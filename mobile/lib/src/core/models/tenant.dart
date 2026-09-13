/// Thương hiệu / khách thuê SaaS (tenant) đang đăng nhập.
///
/// Toàn bộ dữ liệu hiển thị (chi nhánh, menu, Wi-Fi, ngân hàng, chuỗi brand)
/// phải lấy theo tenant hiện tại — KHÔNG hardcode tên thương hiệu cụ thể.
class Tenant {
  final String id;
  final String slug; // khớp với tenantSlug trên Web Portal
  final String name; // tên thương hiệu hiển thị
  final String brandCode; // mã rút gọn (dùng cho SSID Wi-Fi, prefix chuyển khoản...)

  // Thông tin thanh toán chuyển khoản của doanh nghiệp (khi backend:
  // đọc từ GET /banks?branch= — mock đặt sẵn theo tenant cho tiện demo).
  final String bankCode;
  final String bankName;
  final String accountNumber;
  final String accountHolder;

  const Tenant({
    required this.id,
    required this.slug,
    required this.name,
    required this.brandCode,
    this.bankCode = 'ICB',
    this.bankName = 'VietinBank (ICB)',
    this.accountNumber = '102888889999',
    this.accountHolder = 'SAAS F&B PLATFORM',
  });
}

/// Danh sách tenant mẫu (mock — sẽ thay bằng API /auth/login khi có backend).
const List<Tenant> kTenants = [
  Tenant(
    id: 't1',
    slug: 'highlands',
    name: 'Highlands Coffee',
    brandCode: 'HLC',
    bankCode: 'ICB',
    bankName: 'VietinBank (ICB)',
    accountNumber: '102888889999',
    accountHolder: 'HIGHLANDS COFFEE VIET NAM',
  ),
  Tenant(
    id: 't2',
    slug: 'katinat',
    name: 'Katinat Saigon Kafe',
    brandCode: 'KTN',
    bankCode: 'VPB',
    bankName: 'VPBank',
    accountNumber: '0234567890',
    accountHolder: 'KATINAT SAIGON KAFE',
  ),
  Tenant(
    id: 't3',
    slug: 'phe-la',
    name: 'Phê La',
    brandCode: 'PLE',
    bankCode: 'MB',
    bankName: 'MB Bank',
    accountNumber: '0345678901',
    accountHolder: 'PHE LA TRADING',
  ),
];

Tenant tenantBySlug(String slug) =>
    kTenants.firstWhere((t) => t.slug == slug, orElse: () => kTenants.first);

Tenant tenantById(String id) =>
    kTenants.firstWhere((t) => t.id == id, orElse: () => kTenants.first);