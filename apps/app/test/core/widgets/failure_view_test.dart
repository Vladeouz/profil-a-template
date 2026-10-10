import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app/core/error/failure.dart';
import 'package:app/core/widgets/failure_view.dart';

void main() {
  testWidgets('menampilkan teks dari code, bukan pesan server; "Coba lagi" '
      'memanggil onRetry', (tester) async {
    var retries = 0;
    await tester.pumpWidget(
      MaterialApp(
        home: Scaffold(
          body: FailureView(
            failure: const Failure(
              FailureCode.network,
              message: 'socket closed',
            ),
            onRetry: () => retries++,
          ),
        ),
      ),
    );

    expect(
      find.text('Tidak dapat terhubung ke server. Periksa koneksi Anda.'),
      findsOneWidget,
    );
    expect(find.textContaining('socket closed'), findsNothing);

    await tester.tap(find.widgetWithText(FilledButton, 'Coba lagi'));
    expect(retries, 1);
  });
}
