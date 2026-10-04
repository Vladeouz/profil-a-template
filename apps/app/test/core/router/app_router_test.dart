import 'package:flutter/material.dart';
import 'package:flutter_test/flutter_test.dart';

import 'package:app/app.dart';
import 'package:app/core/router/app_router.dart';

void main() {
  testWidgets('App membuka beranda dengan locale Indonesia', (tester) async {
    await tester.pumpWidget(const App());
    await tester.pumpAndSettle();

    expect(find.text('Profil A'), findsOneWidget);
    final context = tester.element(find.text('Profil A'));
    expect(Localizations.localeOf(context), const Locale('id'));
    expect(MaterialLocalizations.of(context).okButtonLabel, 'OKE');
  });

  testWidgets(
    'rute yang tidak ada → halaman tidak ditemukan, tombol kembali ke beranda',
    (tester) async {
      final router = createRouter(initialLocation: '/tidak-ada');
      addTearDown(router.dispose);

      await tester.pumpWidget(App(router: router));
      await tester.pumpAndSettle();

      expect(find.byType(NotFoundPage), findsOneWidget);
      expect(find.text('Halaman tidak ditemukan'), findsOneWidget);

      await tester.tap(find.text('Kembali ke beranda'));
      await tester.pumpAndSettle();

      expect(find.byType(NotFoundPage), findsNothing);
      expect(router.routeInformationProvider.value.uri.path, AppRoutes.home);
    },
  );
}
