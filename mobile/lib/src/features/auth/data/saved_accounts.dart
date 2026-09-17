import '../../../core/models/user.dart';

class SavedAccountsService {
  static final List<UserModel> _savedAccounts = [
    const UserModel(
      name: 'Trần Minh Tuấn',
      email: 'admin@company.com',
      role: 'admin',
      roleTitle: 'Quản trị viên',
      assignedBranchId: '01',
      salaryType: 'monthly',
      baseSalary: 25000000.0,
      hourlySalary: 100000.0,
      bankName: 'Vietcombank',
      bankAccountNumber: '0011009998888',
      bankAccountName: 'TRAN MINH TUAN',
    ),
    const UserModel(
      name: 'Vũ Thành Công',
      email: 'manager@company.com',
      role: 'manager',
      roleTitle: 'Quản lý Chi nhánh',
      assignedBranchId: '01',
      salaryType: 'monthly',
      baseSalary: 16000000.0,
      hourlySalary: 65000.0,
      bankName: 'VietinBank',
      bankAccountNumber: '102008899776',
      bankAccountName: 'VU THANH CONG',
    ),
    const UserModel(
      name: 'Nguyễn Thu Hà',
      email: 'nhanvien@company.com',
      role: 'staff',
      roleTitle: 'Nhân viên',
      assignedBranchId: '01',
      salaryType: 'hourly',
      baseSalary: 0.0,
      hourlySalary: 35000.0,
      bankName: 'VietinBank',
      bankAccountNumber: '108876543210',
      bankAccountName: 'NGUYEN THU HA',
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
