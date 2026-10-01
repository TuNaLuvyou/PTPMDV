/// Chi nhánh doanh nghiệp trong hệ thống HRM On-Premises.
class Branch {
  final String id;
  final String slug; // khớp branchSlug trên Web Portal (VD: hn-1)
  final String code; // mã rút gọn (VD: HN-1)
  final String name;
  final String address;

  const Branch({
    required this.id,
    required this.slug,
    required this.code,
    required this.name,
    required this.address,
  });
}

/// Danh sách chi nhánh chuẩn hóa cho hệ thống HRM nội bộ.
const List<Branch> kBranches = [
  Branch(
    id: '01',
    slug: 'hn-1',
    code: 'HN-1',
    name: 'Chi nhánh Hoàn Kiếm',
    address: '12 Tràng Thi, Hoàn Kiếm, Hà Nội',
  ),
  Branch(
    id: '02',
    slug: 'hn-2',
    code: 'HN-2',
    name: 'Chi nhánh Cầu Giấy',
    address: '88 Cầu Giấy, Q. Cầu Giấy, Hà Nội',
  ),
  Branch(
    id: '03',
    slug: 'dn-1',
    code: 'DN-1',
    name: 'Chi nhánh Đà Nẵng',
    address: '120 Nguyễn Văn Linh, Q. Hải Châu, Đà Nẵng',
  ),
];

/// Lấy danh sách chi nhánh công ty
List<Branch> get branches => kBranches;

/// Lấy branch theo id, slug hoặc code (không phân biệt chữ hoa thường).
Branch branchById(String id) {
  final norm = id.trim().toLowerCase();
  return kBranches.firstWhere(
    (b) =>
        b.id.toLowerCase() == norm ||
        b.slug.toLowerCase() == norm ||
        b.code.toLowerCase() == norm,
    orElse: () => kBranches.first,
  );
}