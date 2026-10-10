import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app/core/error/failure.dart';
import 'package:app/core/widgets/load_more_footer.dart';

void main() {
  var loads = 0;

  setUp(() => loads = 0);

  Future<void> pumpFooter(
    WidgetTester tester, {
    bool loadingMore = false,
    Failure? failure,
  }) => tester.pumpWidget(
    MaterialApp(
      home: Scaffold(
        body: LoadMoreFooter(
          loadingMore: loadingMore,
          failure: failure,
          onLoadMore: () => loads++,
        ),
      ),
    ),
  );

  testWidgets('dibangun → onLoadMore dipanggil sekali setelah frame pertama', (
    tester,
  ) async {
    await pumpFooter(tester);
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(loads, 1);

    await tester.pump();
    expect(loads, 1);
  });

  testWidgets('sedang memuat → hanya indikator, onLoadMore tidak dipanggil', (
    tester,
  ) async {
    await pumpFooter(tester, loadingMore: true);
    await tester.pump();

    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    expect(loads, 0);
  });

  testWidgets('gagal → pesan dan "Coba lagi", tanpa coba ulang otomatis', (
    tester,
  ) async {
    await pumpFooter(tester, failure: const Failure(FailureCode.network));
    await tester.pump();

    expect(
      find.text('Tidak dapat terhubung ke server. Periksa koneksi Anda.'),
      findsOneWidget,
    );
    expect(loads, 0);

    await tester.tap(find.widgetWithText(TextButton, 'Coba lagi'));
    expect(loads, 1);
  });
}
