/// Cấu hình thông tin doanh nghiệp cố định cho mô hình On-Premises.
///
/// Cả web và mobile gọi chung 1 cửa duy nhất là api-gateway (cổng 4000).
/// [apiBaseUrl] lấy từ `--dart-define=API_BASE_URL=...`, mặc định cho
/// Android emulator (10.0.2.2 trỏ về localhost máy host). iOS simulator
/// dùng `http://localhost:4000`, máy thật dùng IP LAN của server.
class CompanyConfig {
  static const String companyName = 'Hệ Thống Doanh Nghiệp HRM';
  static const String shortName = 'HRM Enterprise';
  static const String brandCode = 'HRM';
  static const String supportPhone = '1900 1234';

  static const String apiBaseUrl = String.fromEnvironment(
    'API_BASE_URL',
    defaultValue: 'http://10.0.2.2:4000',
  );

  /// Timeout gọi liên service theo ràng buộc PTPMDV (tối đa 5000ms).
  static const Duration apiTimeout = Duration(milliseconds: 5000);
}
