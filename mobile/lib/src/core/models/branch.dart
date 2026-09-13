/// Chi nhánh — thuộc về một tenant cụ thể (multi-tenant).
class Branch {
  final String id;
  final String slug; // khớp branchSlug trên Web Portal (VD: hn-1)
  final String code; // mã rút gọn (VD: HCM-01)
  final String name;
  final String address;
  final String tenantId;

  const Branch({
    required this.id,
    required this.slug,
    required this.code,
    required this.name,
    required this.address,
    required this.tenantId,
  });
}

/// Branch mẫu theo từng tenant (mock — sẽ thay bằng API khi có backend).
const List<Branch> kBranches = [
  // ── Tenant: Highlands Coffee (t1) ──────────────────────────────────────────
  Branch(id: '01', slug: 'hn-1', code: 'HCM-01', name: 'Highlands Coffee 01', address: '12 Lê Lợi, Q.1, TP.HCM', tenantId: 't1'),
  Branch(id: '02', slug: 'hn-2', code: 'HCM-02', name: 'Highlands Coffee 02', address: '45 Nguyễn Huệ, Q.1, TP.HCM', tenantId: 't1'),
  Branch(id: '03', slug: 'hn-3', code: 'HCM-03', name: 'Highlands Coffee 03', address: '88 Trần Hưng Đạo, Q.5, TP.HCM', tenantId: 't1'),
  // ── Tenant: Katinat Saigon Kafe (t2) ──────────────────────────────────────
  Branch(id: '01', slug: 'kt-1', code: 'SGN-01', name: 'Katinat Saigon Kafe 01', address: '15 Hai Bà Trưng, Q.1, TP.HCM', tenantId: 't2'),
  Branch(id: '02', slug: 'kt-2', code: 'SGN-02', name: 'Katinat Saigon Kafe 02', address: '66 Đồng Khởi, Q.1, TP.HCM', tenantId: 't2'),
  // ── Tenant: Phê La (t3) ───────────────────────────────────────────────────
  Branch(id: '01', slug: 'pl-1', code: 'DN-01', name: 'Phê La 01', address: '120 Hùng Vương, TP.Đà Nẵng', tenantId: 't3'),
  Branch(id: '02', slug: 'pl-2', code: 'DN-02', name: 'Phê La 02', address: '45 Nguyễn Văn Linh, TP.Đà Nẵng', tenantId: 't3'),
];

/// Danh sách branch thuộc một tenant.
List<Branch> branchesOfTenant(String tenantId) =>
    kBranches.where((b) => b.tenantId == tenantId).toList();

/// Lấy branch theo id trong phạm vi tenant (mặc định branch đầu tiên của tenant).
Branch branchById(String id, String tenantId) {
  final branches = branchesOfTenant(tenantId);
  return branches.firstWhere(
    (b) => b.id == id,
    orElse: () => branches.isNotEmpty ? branches.first : kBranches.first,
  );
}