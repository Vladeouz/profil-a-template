import 'package:api_client/api_client.dart';
import 'package:dio/dio.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:get_it/get_it.dart';
import 'package:mocktail/mocktail.dart';

import 'package:app/core/config/app_config.dart';
import 'package:app/core/di/injection.dart';
import 'package:app/core/network/auth_interceptor.dart';
import 'package:app/core/network/token_provider.dart';

class MockFirebaseAuth extends Mock implements FirebaseAuth {}

void main() {
  const config = AppConfig(
    apiBaseUrl: 'http://10.0.2.2:3000',
    firebaseProjectId: 'demo-template',
    firebaseApiKey: 'demo-api-key',
    firebaseAppId: '1:000000000000:android:0000000000000000',
    firebaseMessagingSenderId: '000000000000',
    useEmulator: true,
    authEmulatorHost: '10.0.2.2',
    authEmulatorPort: 9099,
  );

  late GetIt container;
  late MockFirebaseAuth auth;

  setUp(() {
    container = GetIt.asNewInstance();
    auth = MockFirebaseAuth();
    configureDependencies(config: config, auth: auth, container: container);
  });

  tearDown(() => container.reset());

  test('mendaftarkan config dan FirebaseAuth yang diberikan', () {
    expect(container<AppConfig>(), same(config));
    expect(container<FirebaseAuth>(), same(auth));
    expect(container<TokenProvider>(), isA<FirebaseTokenProvider>());
  });

  test('Dio memakai apiBaseUrl dan AuthInterceptor', () {
    final dio = container<Dio>();

    expect(dio.options.baseUrl, 'http://10.0.2.2:3000');
    expect(dio.interceptors.whereType<AuthInterceptor>(), hasLength(1));
  });

  test('ApiClient dan Dio adalah singleton', () {
    expect(container<ApiClient>(), same(container<ApiClient>()));
    expect(container<Dio>(), same(container<Dio>()));
  });

  test('memakai GetIt.instance bila container tidak diberikan', () async {
    addTearDown(GetIt.instance.reset);
    configureDependencies(config: config, auth: auth);

    expect(getIt<AppConfig>(), same(config));
  });
}
