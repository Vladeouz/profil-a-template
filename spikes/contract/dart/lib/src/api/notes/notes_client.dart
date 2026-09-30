// coverage:ignore-file
// GENERATED CODE - DO NOT MODIFY BY HAND
// ignore_for_file: type=lint, unused_import, invalid_annotation_target, unnecessary_import

import 'package:dio/dio.dart';
import 'package:retrofit/retrofit.dart';

import '../models/create_note_body.dart';
import '../models/note.dart';

part 'notes_client.g.dart';

@RestApi()
abstract class NotesClient {
  factory NotesClient(Dio dio, {String? baseUrl}) = _NotesClient;

  @POST('/v1/notes')
  Future<Note> createNote({
    @Body() required CreateNoteBody body,
  });
}
