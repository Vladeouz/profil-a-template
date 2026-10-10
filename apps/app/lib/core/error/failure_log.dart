import 'package:flutter/foundation.dart';

import 'package:app/core/error/failure.dart';

/// Mencatat [failure] ke konsol (`debugPrint`) saat mode debug, agar penyebab kegagalan yang
/// tampil ke user sebagai teks umum tetap terlihat oleh developer. Di mode rilis tidak mencatat
/// apa pun. [debug] hanya diganti di test.
///
/// Dipanggil di batas tempat exception menjadi [Failure] (`apiCall`, `FirebaseAuthRepository`),
/// bukan di mapper atau Cubit. Yang dicatat: kode, [Failure.message], dan nama field yang gagal
/// validasi; tidak pernah token atau header. Teks untuk user tetap dari `failure_messages.dart`
/// (D-03).
void logFailure(Failure failure, {bool debug = kDebugMode}) {
  if (!debug) return;
  final fields = failure.fieldErrors.keys;
  debugPrint(
    'Failure ${failure.code.name}: ${failure.message ?? '-'}'
    '${fields.isEmpty ? '' : ' (fields: ${fields.join(', ')})'}',
  );
}
