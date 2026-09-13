import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/models/branch.dart';
import '../../../core/models/tenant.dart';
import '../../../core/state/branch_scope.dart';
import '../../../core/state/tenant_scope.dart';
import '../../../core/state/user_scope.dart';
import '../../auth/data/saved_accounts_service.dart';
import '../../auth/presentation/login_screen.dart';
import '../../main/presentation/main_navigation_screen.dart';
import 'notification_settings_screen.dart';
import 'security_screen.dart';

class ProfileScreen extends StatefulWidget {
  final UserModel currentUser;

  const ProfileScreen({
    super.key,
    this.currentUser = const UserModel(
      name: 'Nguyễn Văn A',
      email: 'nhanvien@highlands.vn',
      role: 'staff',
      roleTitle: 'Nhân viên',
    ),
  });

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  static const String _birthDate = '15/03/1998';
  static const String _bankAccount = 'Vietcombank • 9876 5432 10';
  static const String _residence = '123 Đường Nguyễn Trãi, P. Bến Thành, Q.1, TP.HCM';
  static const String _phone = '0901 234 567';

  late final TextEditingController _nameController;
  late final TextEditingController _phoneController;
  bool _isEditing = false;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: widget.currentUser.name);
    _phoneController = TextEditingController(text: _phone);
  }

  @override
  void dispose() {
    _nameController.dispose();
    _phoneController.dispose();
    super.dispose();
  }

  void _startEditing() {
    setState(() {
      _isEditing = true;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Chỉ được chỉnh sửa Họ tên và Số điện thoại'),
      ),
    );
  }

  void _saveChanges() {
    setState(() {
      _isEditing = false;
    });
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        backgroundColor: AppColors.success,
        content: Text('✅ Đã lưu thông tin cá nhân'),
      ),
    );
  }


  @override
  Widget build(BuildContext context) {
    final bool isManager = widget.currentUser.isManager;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Tài khoản'),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        actions: [
          if (_isEditing)
            TextButton(
              onPressed: _saveChanges,
              child: const Text(
                'Lưu',
                style: TextStyle(
                  color: AppColors.primary,
                  fontWeight: FontWeight.bold,
                  fontSize: 15,
                ),
              ),
            )
          else
            IconButton(
              icon: const Icon(Icons.edit_outlined, color: AppColors.primary),
              tooltip: 'Chỉnh sửa thông tin cá nhân',
              onPressed: _startEditing,
            ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Header Profile
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                CircleAvatar(
                  radius: 40,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                  child: Icon(
                    isManager ? Icons.admin_panel_settings : Icons.person,
                    size: 44,
                    color: AppColors.primary,
                  ),
                ),
                const SizedBox(height: 12),
                Text(
                  _nameController.text,
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 4),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 3),
                  decoration: BoxDecoration(
                    color: isManager
                        ? AppColors.primary.withValues(alpha: 0.12)
                        : Colors.blue.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(20),
                  ),
                  child: Text(
                    BranchScope.label(context),
                    style: TextStyle(
                      color: isManager ? AppColors.primary : Colors.blue.shade700,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Personal Info Header
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text(
                'Thông tin cá nhân',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                ),
              ),
              Text(
                _isEditing ? 'Đang chỉnh sửa...' : 'Chỉ sửa được Tên & SĐT',
                style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
              ),
            ],
          ),
          const SizedBox(height: 12),

          // User info list
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey.shade200),
            ),
            child: Column(
              children: [
                _buildEditableRow('Họ và tên', _nameController),
                const Divider(height: 1),
                _buildInfoRow('Ngày sinh', _birthDate),
                const Divider(height: 1),
                _buildEditableRow('Số điện thoại', _phoneController),
                const Divider(height: 1),
                _buildInfoRow('Ngân hàng', _bankAccount),
                const Divider(height: 1),
                _buildInfoRow('Thường trú', _residence),
                const Divider(height: 1),
                _buildInfoRow('Chi nhánh', BranchScope.label(context)),
                const Divider(height: 1),
                _buildInfoRow('Email', widget.currentUser.email),
                const Divider(height: 1),
                _buildInfoRow('Quyền hạn', isManager ? 'Quản trị viên' : 'Nhân viên'),
              ],
            ),
          ),
          const SizedBox(height: 16),

          // Action list: Đổi tài khoản đăng nhập & Đăng xuất
          Material(
            color: Colors.white,
            borderRadius: BorderRadius.circular(16),
            clipBehavior: Clip.antiAlias,
            child: Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  InkWell(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const NotificationSettingsScreen()),
                      );
                    },
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Icon(Icons.notifications_none_rounded, color: AppColors.primary),
                          SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              'Cài đặt thông báo',
                              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                            ),
                          ),
                          Icon(Icons.chevron_right, size: 20, color: AppColors.textSecondary),
                        ],
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  InkWell(
                    onTap: () {
                      Navigator.of(context).push(
                        MaterialPageRoute(builder: (context) => const SecurityScreen()),
                      );
                    },
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Icon(Icons.shield_outlined, color: AppColors.primary),
                          SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              'Bảo mật tài khoản',
                              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                            ),
                          ),
                          Icon(Icons.chevron_right, size: 20, color: AppColors.textSecondary),
                        ],
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  InkWell(
                    onTap: () => _showAccountSwitchSheet(context),
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Icon(Icons.swap_horiz, color: AppColors.primary),
                          SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              'Đổi tài khoản đăng nhập',
                              style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14),
                            ),
                          ),
                          Icon(Icons.chevron_right, size: 20, color: AppColors.textSecondary),
                        ],
                      ),
                    ),
                  ),
                  const Divider(height: 1),
                  InkWell(
                    onTap: () {
                      Navigator.of(context).pushReplacement(
                        MaterialPageRoute(builder: (context) => const LoginScreen()),
                      );
                    },
                    child: const Padding(
                      padding: EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      child: Row(
                        children: [
                          Icon(Icons.logout, color: Colors.red),
                          SizedBox(width: 14),
                          Expanded(
                            child: Text(
                              'Đăng xuất',
                              style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 14),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 30),
        ],
      ),
    );
  }

  void _showAccountSwitchSheet(BuildContext context) {
    SavedAccountsService.saveAccount(widget.currentUser);

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (sheetContext) => StatefulBuilder(
        builder: (sheetContext, setModalState) {
          final savedAccounts = SavedAccountsService.getSavedAccounts();
          final double sheetHeight = MediaQuery.of(context).size.height * 0.58;

          return Container(
            height: sheetHeight,
            padding: const EdgeInsets.fromLTRB(20, 12, 20, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                Center(
                  child: Container(
                    width: 44,
                    height: 4.5,
                    decoration: BoxDecoration(
                      color: Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(3),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                const Text(
                  'Chuyển đổi tài khoản',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 4),
                const Text(
                  'Chọn tài khoản đã lưu trên thiết bị này',
                  style: TextStyle(fontSize: 12.5, color: AppColors.textSecondary),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),

                // Danh sách tài khoản đã lưu
                Expanded(
                  child: ListView.separated(
                    physics: const BouncingScrollPhysics(),
                    itemCount: savedAccounts.length,
                    separatorBuilder: (_, __) => const SizedBox(height: 10),
                    itemBuilder: (ctx, index) {
                      final acc = savedAccounts[index];
                      final bool isCurrent = acc.email.toLowerCase() == widget.currentUser.email.toLowerCase();

                      return Material(
                        color: isCurrent ? AppColors.primary.withValues(alpha: 0.06) : Colors.grey.shade50,
                        borderRadius: BorderRadius.circular(14),
                        child: InkWell(
                          onTap: isCurrent
                              ? null
                              : () {
                                  final tenant = tenantById(acc.tenantId ?? 'highlands');
                                  TenantScope.select(context, tenant);
                                  final branches = branchesOfTenant(tenant.id);
                                  final branch = acc.assignedBranchId != null
                                      ? branchById(acc.assignedBranchId!, tenant.id)
                                      : (branches.isNotEmpty ? branches.first : kBranches.first);
                                  BranchScope.select(context, branch);
                                  UserScope.setUser(context, acc);

                                  Navigator.pop(sheetContext);
                                  Navigator.of(context).pushAndRemoveUntil(
                                    MaterialPageRoute(builder: (context) => MainNavigationScreen(currentUser: acc)),
                                    (route) => false,
                                  );

                                  ScaffoldMessenger.of(context).showSnackBar(
                                    SnackBar(
                                      backgroundColor: AppColors.success,
                                      content: Text('✅ Đã chuyển sang tài khoản ${acc.name} (${acc.roleTitle})'),
                                      behavior: SnackBarBehavior.floating,
                                    ),
                                  );
                                },
                          borderRadius: BorderRadius.circular(14),
                          child: Container(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                            decoration: BoxDecoration(
                              borderRadius: BorderRadius.circular(14),
                              border: Border.all(
                                color: isCurrent ? AppColors.primary.withValues(alpha: 0.3) : Colors.grey.shade200,
                                width: isCurrent ? 1.5 : 1,
                              ),
                            ),
                            child: Row(
                              children: [
                                CircleAvatar(
                                  radius: 20,
                                  backgroundColor: acc.isManager
                                      ? AppColors.primary.withValues(alpha: 0.15)
                                      : Colors.blue.withValues(alpha: 0.15),
                                  child: Text(
                                    acc.name.isNotEmpty ? acc.name[0].toUpperCase() : 'U',
                                    style: TextStyle(
                                      color: acc.isManager ? AppColors.primary : Colors.blue.shade700,
                                      fontWeight: FontWeight.bold,
                                      fontSize: 16,
                                    ),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Row(
                                        children: [
                                          Flexible(
                                            child: Text(
                                              acc.name,
                                              overflow: TextOverflow.ellipsis,
                                              style: const TextStyle(
                                                fontWeight: FontWeight.bold,
                                                fontSize: 14.5,
                                                color: AppColors.textPrimary,
                                              ),
                                            ),
                                          ),
                                          const SizedBox(width: 6),
                                          Container(
                                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                            decoration: BoxDecoration(
                                              color: acc.isManager
                                                  ? AppColors.primary.withValues(alpha: 0.1)
                                                  : Colors.blue.withValues(alpha: 0.1),
                                              borderRadius: BorderRadius.circular(4),
                                            ),
                                            child: Text(
                                              acc.roleTitle,
                                              style: TextStyle(
                                                fontSize: 10,
                                                fontWeight: FontWeight.bold,
                                                color: acc.isManager ? AppColors.primary : Colors.blue.shade700,
                                              ),
                                            ),
                                          ),
                                        ],
                                      ),
                                      const SizedBox(height: 3),
                                      Text(
                                        acc.email,
                                        style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                if (isCurrent)
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                    decoration: BoxDecoration(
                                      color: AppColors.success.withValues(alpha: 0.12),
                                      borderRadius: BorderRadius.circular(6),
                                    ),
                                    child: const Row(
                                      mainAxisSize: MainAxisSize.min,
                                      children: [
                                        Icon(Icons.check_circle, size: 13, color: AppColors.success),
                                        SizedBox(width: 4),
                                        Text(
                                          'Đang dùng',
                                          style: TextStyle(color: AppColors.success, fontSize: 11, fontWeight: FontWeight.bold),
                                        ),
                                      ],
                                    ),
                                  )
                                else
                                  IconButton(
                                    icon: const Icon(Icons.close, size: 18, color: Colors.grey),
                                    tooltip: 'Xoá khỏi thiết bị',
                                    onPressed: () {
                                      SavedAccountsService.removeAccount(acc.email);
                                      setModalState(() {});
                                    },
                                  ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 12),

                // Nút Đăng nhập tài khoản khác
                OutlinedButton.icon(
                  onPressed: () {
                    Navigator.pop(sheetContext);
                    Navigator.of(context).pushReplacement(
                      MaterialPageRoute(builder: (context) => const LoginScreen()),
                    );
                  },
                  icon: const Icon(Icons.person_add_alt_1_rounded, size: 20, color: AppColors.primary),
                  label: const Text(
                    'Đăng nhập tài khoản khác',
                    style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.primary),
                  ),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    side: const BorderSide(color: AppColors.primary),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildEditableRow(String label, TextEditingController controller) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6.0, horizontal: 16.0),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.center,
        children: [
          SizedBox(
            width: 150,
            child: Text(
              label,
              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textSecondary),
            ),
          ),
          Expanded(
            child: _isEditing
                ? TextField(
                    controller: controller,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                    decoration: const InputDecoration(
                      isDense: true,
                      contentPadding: EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      border: OutlineInputBorder(),
                    ),
                  )
                : Text(
                    controller.text,
                    textAlign: TextAlign.right,
                    style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                  ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 14.0, horizontal: 16.0),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          SizedBox(
            width: 150,
            child: Text(label, style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13, color: AppColors.textSecondary)),
          ),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.right,
              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }
}