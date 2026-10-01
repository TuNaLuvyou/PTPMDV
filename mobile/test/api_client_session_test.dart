import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/src/core/network/api_client.dart';

void main() {
  group('ApiClient Shared Session Tests', () {
    setUp(() {
      ApiClient.clearSession();
    });

    tearDown(() {
      ApiClient.clearSession();
    });

    test('Shared session updates across distinct instances', () {
      final clientA = ApiClient();
      final clientB = ApiClient();

      expect(clientA.cookie, isNull);
      expect(clientB.cookie, isNull);
      expect(clientA.accessToken, isNull);
      expect(clientB.accessToken, isNull);

      clientA.setSession(cookie: 'hrm-session=test12345', accessToken: 'jwt-token-xyz');

      expect(clientB.cookie, equals('hrm-session=test12345'));
      expect(clientB.accessToken, equals('jwt-token-xyz'));
    });

    test('clearSession clears across all instances', () {
      final clientA = ApiClient();
      final clientB = ApiClient();

      clientA.setSession(cookie: 'hrm-session=abcdef');
      expect(clientB.cookie, equals('hrm-session=abcdef'));

      ApiClient.clearSession();
      expect(clientA.cookie, isNull);
      expect(clientB.cookie, isNull);
    });
  });
}
