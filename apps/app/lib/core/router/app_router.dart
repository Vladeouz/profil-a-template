import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:get_it/get_it.dart';
import 'package:go_router/go_router.dart';

import 'package:app/core/di/injection.dart';
import 'package:app/features/auth/presentation/cubit/auth_session_cubit.dart';
import 'package:app/features/auth/presentation/cubit/auth_session_state.dart';
import 'package:app/features/auth/presentation/cubit/login_cubit.dart';
import 'package:app/features/auth/presentation/cubit/register_cubit.dart';
import 'package:app/features/auth/presentation/pages/login_page.dart';
import 'package:app/features/auth/presentation/pages/register_page.dart';
import 'package:app/features/auth/presentation/widgets/sign_out_button.dart';

/// Path rute app. Fitur menambah path di sini dan rutenya di [createRouter].
abstract final class AppRoutes {
  static const home = '/';
  static const login = '/login';
  static const register = '/register';
  static const notes = '/notes';

  /// Rute yang boleh dibuka tanpa login. Rute lain dilindungi.
  static const public = {login, register};
}

/// Router app (go_router).
///
/// - Rute terlindungi (butuh login) ditaruh di `routes` milik `ShellRoute`, yang memasang
///   [AuthSessionCubit] untuk halaman di dalamnya (misalnya `SignOutButton`).
/// - Redirect: belum login + rute terlindungi → login; sudah login + rute publik → beranda.
///   Dievaluasi ulang setiap kali [AuthSessionCubit] berubah (login, logout, token dicabut).
/// - Cubit halaman diambil dari [container] (default `getIt`) dan dipasang dengan `BlocProvider`.
GoRouter createRouter({
  GetIt? container,
  String initialLocation = AppRoutes.home,
}) {
  final c = container ?? getIt;
  final session = c<AuthSessionCubit>();

  return GoRouter(
    initialLocation: initialLocation,
    refreshListenable: _StreamListenable(session.stream),
    redirect: (context, state) => _authRedirect(session.state, state),
    routes: [
      GoRoute(path: AppRoutes.home, redirect: (_, _) => AppRoutes.notes),
      GoRoute(
        path: AppRoutes.login,
        builder: (context, state) => BlocProvider(
          create: (_) => c<LoginCubit>(),
          child: const LoginPage(),
        ),
      ),
      GoRoute(
        path: AppRoutes.register,
        builder: (context, state) => BlocProvider(
          create: (_) => c<RegisterCubit>(),
          child: const RegisterPage(),
        ),
      ),
      ShellRoute(
        builder: (context, state, child) =>
            BlocProvider.value(value: session, child: child),
        routes: [
          GoRoute(
            path: AppRoutes.notes,
            builder: (context, state) => const _NotesPlaceholderPage(),
          ),
        ],
      ),
    ],
    errorBuilder: (context, state) => const NotFoundPage(),
  );
}

String? _authRedirect(AuthSessionState session, GoRouterState state) {
  final isPublic = AppRoutes.public.contains(state.matchedLocation);
  return switch (session) {
    Unauthenticated() when !isPublic => AppRoutes.login,
    Authenticated() when isPublic => AppRoutes.home,
    _ => null,
  };
}

/// `refreshListenable` dari stream Cubit. Langganan berakhir saat Cubit ditutup
/// (stream selesai); Cubit sesi hidup selama app.
class _StreamListenable extends ChangeNotifier {
  _StreamListenable(Stream<Object?> stream) {
    stream.listen((_) => notifyListeners());
  }
}

/// Sementara sampai halaman notes ada (T-016). Halaman pengganti tetap memasang `SignOutButton`.
class _NotesPlaceholderPage extends StatelessWidget {
  const _NotesPlaceholderPage();

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Catatan'),
        actions: const [SignOutButton()],
      ),
      body: const Center(child: Text('Belum ada catatan.')),
    );
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
