import 'package:flutter_test/flutter_test.dart';
import 'package:mobile/src/app.dart';

void main() {
  testWidgets('App starts with platform splash screen', (WidgetTester tester) async {
    await tester.pumpWidget(const FBManagementApp());
    // Màn khởi động dùng brand của PLATFORM, không phải của doanh nghiệp nào.
    expect(find.text('F&B Platform'), findsOneWidget);
    // Chờ timer của splash hoàn tất để tránh lỗi "timer still pending".
    await tester.pump(const Duration(seconds: 2));
    await tester.pump();
  });
}
