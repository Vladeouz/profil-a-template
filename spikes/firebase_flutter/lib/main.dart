import 'package:firebase_auth/firebase_auth.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

/// Nilai dari `--dart-define-from-file=config/dev.json`.
class SpikeConfig {
  static const projectId = String.fromEnvironment('FIREBASE_PROJECT_ID');
  static const apiKey = String.fromEnvironment('FIREBASE_API_KEY');
  static const appId = String.fromEnvironment('FIREBASE_APP_ID');
  static const messagingSenderId = String.fromEnvironment(
    'FIREBASE_MESSAGING_SENDER_ID',
  );
  static const useEmulator = bool.fromEnvironment('USE_EMULATOR');
  static const authEmulatorHost = String.fromEnvironment(
    'AUTH_EMULATOR_HOST',
    defaultValue: 'localhost',
  );
  static const authEmulatorPort = int.fromEnvironment(
    'AUTH_EMULATOR_PORT',
    defaultValue: 9099,
  );

  static FirebaseOptions get firebaseOptions => const FirebaseOptions(
    apiKey: apiKey,
    appId: appId,
    messagingSenderId: messagingSenderId,
    projectId: projectId,
  );

  /// Android emulator mencapai host lewat `10.0.2.2`, bukan `localhost`.
  static String resolveHost(String host) {
    final isAndroid =
        !kIsWeb && defaultTargetPlatform == TargetPlatform.android;
    if (isAndroid && (host == 'localhost' || host == '127.0.0.1')) {
      return '10.0.2.2';
    }
    return host;
  }
}

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  if (SpikeConfig.projectId.isEmpty) {
    throw StateError('Jalankan dengan --dart-define-from-file=config/dev.json');
  }
  await Firebase.initializeApp(options: SpikeConfig.firebaseOptions);
  if (SpikeConfig.useEmulator) {
    final host = SpikeConfig.resolveHost(SpikeConfig.authEmulatorHost);
    await FirebaseAuth.instance.useAuthEmulator(
      host,
      SpikeConfig.authEmulatorPort,
    );
    debugPrint('Auth Emulator: $host:${SpikeConfig.authEmulatorPort}');
  }
  runApp(const SpikeApp());
}

class SpikeApp extends StatelessWidget {
  const SpikeApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(title: 'Spike Firebase Auth', home: AuthPage());
  }
}

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage> {
  final _email = TextEditingController();
  final _password = TextEditingController();
  String _status = '';
  bool _busy = false;

  @override
  void dispose() {
    _email.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _run(
    String label,
    Future<UserCredential> Function() action,
  ) async {
    setState(() {
      _busy = true;
      _status = '';
    });
    try {
      final credential = await action();
      setState(
        () => _status =
            '$label berhasil: ${credential.user?.email} (${credential.user?.uid})',
      );
    } on FirebaseAuthException catch (e) {
      setState(() => _status = '$label gagal: ${e.code}');
    } finally {
      setState(() => _busy = false);
    }
  }

  void _register() => _run(
    'Daftar',
    () => FirebaseAuth.instance.createUserWithEmailAndPassword(
      email: _email.text.trim(),
      password: _password.text,
    ),
  );

  void _login() => _run(
    'Login',
    () => FirebaseAuth.instance.signInWithEmailAndPassword(
      email: _email.text.trim(),
      password: _password.text,
    ),
  );

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Spike Firebase Auth')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            TextField(
              key: const Key('email'),
              controller: _email,
              decoration: const InputDecoration(labelText: 'Email'),
              keyboardType: TextInputType.emailAddress,
            ),
            TextField(
              key: const Key('password'),
              controller: _password,
              decoration: const InputDecoration(labelText: 'Password'),
              obscureText: true,
            ),
            const SizedBox(height: 16),
            FilledButton(
              onPressed: _busy ? null : _register,
              child: const Text('Daftar'),
            ),
            const SizedBox(height: 8),
            OutlinedButton(
              onPressed: _busy ? null : _login,
              child: const Text('Login'),
            ),
            const SizedBox(height: 16),
            StreamBuilder<User?>(
              stream: FirebaseAuth.instance.authStateChanges(),
              builder: (context, snapshot) =>
                  Text('User aktif: ${snapshot.data?.email ?? '-'}'),
            ),
            const SizedBox(height: 8),
            SelectableText(_status, key: const Key('status')),
          ],
        ),
      ),
    );
  }
}
