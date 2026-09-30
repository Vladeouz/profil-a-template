import 'dart:convert';
import 'dart:io';
import 'dart:typed_data';

import 'package:api_client/api_client.dart';
import 'package:dio/dio.dart';
import 'package:test/test.dart';

/// Respons nyata dari route Hono, ditulis oleh `spikes/contract/api/scripts/export.ts`.
String fixture(String name) => File('test/fixtures/$name').readAsStringSync();

/// Adapter dio palsu: selalu menjawab dengan status dan body yang diberikan.
class FakeAdapter implements HttpClientAdapter {
  FakeAdapter(this.status, this.body);

  final int status;
  final String body;
  RequestOptions? lastRequest;

  @override
  Future<ResponseBody> fetch(
    RequestOptions options,
    Stream<Uint8List>? requestStream,
    Future<void>? cancelFuture,
  ) async {
    lastRequest = options;
    return ResponseBody.fromString(
      body,
      status,
      headers: {
        Headers.contentTypeHeader: [Headers.jsonContentType],
      },
    );
  }

  @override
  void close({bool force = false}) {}
}

void main() {
  group('deserialize fixture', () {
    test('201 Note', () {
      final note = Note.fromJson(
        jsonDecode(fixture('create_note_201.json')) as Map<String, Object?>,
      );

      expect(note.title, 'Belanja');
      expect(note.body, 'Susu dan roti');
      expect(note.createdAt, DateTime.utc(2026, 9, 30));
      expect(note.createdAt.isUtc, isTrue);
    });

    test('422 ErrorBody dengan details', () {
      final body = ErrorBody.fromJson(
        jsonDecode(fixture('create_note_422.json')) as Map<String, Object?>,
      );

      expect(body.error.code, ErrorCode.validationError);
      expect(body.error.details!['title']!.single.code, 'required');
      expect(body.error.details!['body']!.single.code, 'too_big');
    });

    test('ErrorCode baru dari server menjadi \$unknown, tidak melempar', () {
      final body = ErrorBody.fromJson({
        'error': {'code': 'RATE_LIMITED', 'message': 'x'},
      });

      expect(body.error.code, ErrorCode.$unknown);
      expect(body.error.details, isNull);
    });

    test('ErrorCode berisi semua kode PRD bagian 5', () {
      expect(ErrorCode.$valuesDefined.map((c) => c.json), [
        'BAD_REQUEST',
        'UNAUTHENTICATED',
        'FORBIDDEN',
        'NOT_FOUND',
        'CONFLICT',
        'VALIDATION_ERROR',
        'INTERNAL_ERROR',
      ]);
    });
  });

  group('lewat NotesClient (retrofit + dio)', () {
    test('201 menjadi Note', () async {
      final adapter = FakeAdapter(201, fixture('create_note_201.json'));
      final dio = Dio(BaseOptions(baseUrl: 'http://api.test'))
        ..httpClientAdapter = adapter;

      final note = await ApiClient(dio).notes.createNote(
        body: const CreateNoteBody(title: 'Belanja', body: 'Susu dan roti'),
      );

      expect(note.id, '0b7e5f7c-9a8e-4c1a-bb7e-2f4f9f0c1d2e');
      expect(adapter.lastRequest!.method, 'POST');
      expect(adapter.lastRequest!.path, '/v1/notes');
    });

    test(
      '422 menjadi DioException yang body-nya bisa dibaca sebagai ErrorBody',
      () async {
        final adapter = FakeAdapter(422, fixture('create_note_422.json'));
        final dio = Dio(BaseOptions(baseUrl: 'http://api.test'))
          ..httpClientAdapter = adapter;

        final error = await ApiClient(dio).notes
            .createNote(body: const CreateNoteBody(title: ''))
            .then<DioException?>(
              (_) => null,
              onError: (Object e) => e as DioException,
            );

        expect(error!.response!.statusCode, 422);
        final body = ErrorBody.fromJson(
          error.response!.data as Map<String, Object?>,
        );
        expect(body.error.code, ErrorCode.validationError);
        expect(body.error.details!.keys, containsAll(['title', 'body']));
      },
    );
  });
}
