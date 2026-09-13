import '../presentation/login_screen.dart';

class SavedAccountsService {
  static final List<UserModel> _savedAccounts = [
    const UserModel(
      name: 'Nguyễn Văn A',
      email: 'nhanvien@highlands.vn',
      role: 'staff',
      roleTitle: 'Nhân viên',
      tenantId: 'highlands',
      tenantSlug: 'highlands',
      assignedBranchId: '01',
    ),
    const UserModel(
      name: 'Trần Minh Tuấn',
      email: 'admin@highlands.vn',
      role: 'admin',
      roleTitle: 'Quản trị viên',
      tenantId: 'highlands',
      tenantSlug: 'highlands',
    ),
    const UserModel(
      name: 'Lê Thị Thuỳ Dung',
      email: 'thuydung@katinat.vn',
      role: 'staff',
      roleTitle: 'Nhân viên',
      tenantId: 'katinat',
      tenantSlug: 'katinat',
      assignedBranchId: '01',
    ),
  ];

  static List<UserModel> getSavedAccounts() => List.unmodifiable(_savedAccounts);

  static void saveAccount(UserModel user) {
    _savedAccounts.removeWhere((a) => a.email.toLowerCase() == user.email.toLowerCase());
    _savedAccounts.insert(0, user);
  }

  static void removeAccount(String email) {
    _savedAccounts.removeWhere((a) => a.email.toLowerCase() == email.toLowerCase());
  }
}
