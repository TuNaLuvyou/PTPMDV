/// Mô hình người dùng cho hệ thống HRM On-Premises.
class UserModel {
  final String id;
  final String name;
  final String email;
  final String role; // 'admin', 'manager', 'staff'
  final String roleTitle;

  /// Chi nhánh được gán cho nhân sự (Admin và Manager cũng thuộc chi nhánh/HQ).
  final String? assignedBranchId;

  const UserModel({
    this.id = '1',
    required this.name,
    required this.email,
    required this.role,
    required this.roleTitle,
    this.assignedBranchId = '01',
  });

  bool get isAdmin => role == 'admin';
  bool get isManager => role == 'manager';
  bool get isStaff => role == 'staff' || role == 'employee';
  bool get canManage => isAdmin || isManager;
}
