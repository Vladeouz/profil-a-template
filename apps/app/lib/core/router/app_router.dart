import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';

/// Path rute app. Fitur menambah path di sini dan rutenya di [createRouter].
abstract final class AppRoutes {
  static const home = '/';
}

/// Router app (go_router).
///
/// Fitur menambah `GoRoute` di daftar `routes`; halaman diambil dari `features/<fitur>/presentation/`.
/// Redirect untuk rute yang butuh login ditambahkan di T-014.
GoRouter createRouter({String initialLocation = AppRoutes.home}) => GoRouter(
  initialLocation: initialLocation,
  routes: [
    GoRoute(
      path: AppRoutes.home,
      builder: (context, state) => const _HomePlaceholderPage(),
    ),
  ],
  errorBuilder: (context, state) => const NotFoundPage(),
);

/// Sementara sampai halaman fitur pertama ada (T-014).
class _HomePlaceholderPage extends StatelessWidget {
  const _HomePlaceholderPage();

  @override
  Widget build(BuildContext context) {
    return const Scaffold(body: Center(child: Text('Profil A')));
  }
}

class NotFoundPage extends StatelessWidget {
  const NotFoundPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Halaman tidak ditemukan')),
      body: Center(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            const Text('Halaman yang Anda buka tidak ada.'),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: () => context.go(AppRoutes.home),
              child: const Text('Kembali ke beranda'),
            ),
          ],
        ),
      ),
    );
  }
}
