import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:go_router/go_router.dart';

import 'package:app/core/router/app_router.dart';
import 'package:app/features/auth/presentation/widgets/sign_out_button.dart';
import 'package:app/features/notes/domain/entities/note.dart';
import 'package:app/features/notes/presentation/cubit/note_form_state.dart';
import 'package:app/features/notes/presentation/cubit/notes_list_cubit.dart';
import 'package:app/features/notes/presentation/cubit/notes_list_state.dart';
import 'package:app/features/notes/presentation/widgets/failure_view.dart';
import 'package:app/features/notes/presentation/widgets/load_more_footer.dart';
import 'package:app/features/notes/presentation/widgets/note_tile.dart';

/// Daftar note milik user. Butuh [NotesListCubit] dari `BlocProvider` (dipasang router).
///
/// Form dibuka dengan `context.push`; hasilnya (`NoteFormSaved`/`NoteFormDeleted`)
/// diterapkan ke daftar tanpa memuat ulang.
class NotesPage extends StatelessWidget {
  const NotesPage({super.key});

  Future<void> _openForm(BuildContext context, {Note? note}) async {
    final cubit = context.read<NotesListCubit>();
    final location = note == null ? AppRoutes.noteNew : AppRoutes.note(note.id);
    final result = await context.push<NoteFormState>(location, extra: note);
    switch (result) {
      case NoteFormSaved(:final note):
        cubit.noteSaved(note);
      case NoteFormDeleted(:final id):
        cubit.noteDeleted(id);
      case _:
        break;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Catatan'),
        actions: const [SignOutButton()],
      ),
      floatingActionButton: FloatingActionButton(
        tooltip: 'Catatan baru',
        onPressed: () => _openForm(context),
        child: const Icon(Icons.add),
      ),
      body: BlocBuilder<NotesListCubit, NotesListState>(
        builder: (context, state) => switch (state) {
          NotesListLoading() => const Center(
            child: CircularProgressIndicator(),
          ),
          NotesListLoadFailed(:final failure) => FailureView(
            failure: failure,
            onRetry: () => context.read<NotesListCubit>().load(),
          ),
          NotesListLoaded(items: []) => const Center(
            child: Text('Belum ada catatan.'),
          ),
          final NotesListLoaded loaded => ListView.builder(
            // Ruang di bawah agar baris terakhir tidak tertutup tombol tambah.
            padding: const EdgeInsets.only(bottom: 88),
            itemCount: loaded.items.length + (loaded.hasMore ? 1 : 0),
            itemBuilder: (context, index) {
              if (index == loaded.items.length) {
                return LoadMoreFooter(
                  state: loaded,
                  onLoadMore: () => context.read<NotesListCubit>().loadMore(),
                );
              }
              final note = loaded.items[index];
              return NoteTile(
                key: ValueKey(note.id),
                note: note,
                onTap: () => _openForm(context, note: note),
              );
            },
          ),
        },
      ),
    );
  }
}
