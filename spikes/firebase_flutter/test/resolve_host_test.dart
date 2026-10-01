import 'package:flutter/foundation.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:spike_firebase_flutter/main.dart';

void main() {
  tearDown(() => debugDefaultTargetPlatformOverride = null);

  test('Android mengganti localhost menjadi 10.0.2.2', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.android;
    expect(SpikeConfig.resolveHost('localhost'), '10.0.2.2');
    expect(SpikeConfig.resolveHost('127.0.0.1'), '10.0.2.2');
    expect(SpikeConfig.resolveHost('192.168.1.5'), '192.168.1.5');
  });

  test('platform lain tetap memakai host apa adanya', () {
    debugDefaultTargetPlatformOverride = TargetPlatform.windows;
    expect(SpikeConfig.resolveHost('localhost'), 'localhost');
  });
}
