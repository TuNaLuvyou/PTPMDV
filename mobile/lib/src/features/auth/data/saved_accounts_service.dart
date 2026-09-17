import '../../../core/models/user.dart';

class SavedAccountsService {
  static final List<UserModel> _savedAccounts = [
    const UserModel(
      name: 'Trần Minh Tuấn',
      email: 'admin@company.com',
      role: 'admin',
      roleTitle: 'Quản trị viên',
      assignedBranchId: '01',
    ),
    const UserModel(
      name: 'Vũ Thành Công',
      email: 'manager@company.com',
      role: 'manager',
      roleTitle: 'Quản lý Chi nhánh',
      assignedBranchId: '01',
    ),
    const UserModel(
      name: 'Nguyễn Thu Hà',
      email: 'nhanvien@company.com',
      role: 'staff',
      roleTitle: 'Nhân viên',
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
