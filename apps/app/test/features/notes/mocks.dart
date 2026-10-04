import 'package:mocktail/mocktail.dart';

import 'package:app/features/notes/data/note_remote_data_source.dart';
import 'package:app/features/notes/domain/entities/note.dart';
import 'package:app/features/notes/domain/repositories/note_repository.dart';

class MockNoteRepository extends Mock implements NoteRepository {}

class MockNoteRemoteDataSource extends Mock implements NoteRemoteDataSource {}

/// Note contoh untuk test, sama dengan [noteJson].
final testNote = Note(
  id: '6f1c2f0e-8a3b-4c5d-9e7f-0a1b2c3d4e5f',
  title: 'Belanja',
  body: 'Susu dan roti',
  createdAt: DateTime.utc(2026, 10, 1, 8, 30),
  updatedAt: DateTime.utc(2026, 10, 1, 9),
);

/// Bentuk JSON `Note` dari API untuk [testNote].
const noteJson = {
  'id': '6f1c2f0e-8a3b-4c5d-9e7f-0a1b2c3d4e5f',
  'title': 'Belanja',
  'body': 'Susu dan roti',
  'createdAt': '2026-10-01T08:30:00.000Z',
  'updatedAt': '2026-10-01T09:00:00.000Z',
};
