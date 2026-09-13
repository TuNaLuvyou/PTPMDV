import 'package:flutter/material.dart';
import '../constants/app_colors.dart';
import '../models/branch.dart';
import '../state/branch_scope.dart';
import '../state/tenant_scope.dart';
import '../state/user_scope.dart';

/// Nút chọn chi nhánh đặt trên AppBar của các tính năng quản trị.
///
/// Chỉ Quản trị viên (Admin) mới có quyền chuyển đổi chi nhánh.
/// Đối với nhân viên (Staff), hiển thị chi nhánh cố định và thông báo quyền hạn.
///
/// [includeAll] = true cho phép chọn "Tổng (Tất cả chi nhánh)" — chỉ áp dụng
/// cho các màn tổng hợp (doanh thu, giám sát nhân sự...).
class BranchSelector extends StatelessWidget {
  final bool includeAll;

  const BranchSelector({super.key, this.includeAll = true});

  @override
  Widget build(BuildContext context) {
    final branch = BranchScope.selectedBranch(context);
    final bool isAll = branch == null;
    final String branchName = branch?.name ?? 'Tổng';
    final bool isAdmin = UserScope.isAdmin(context);

    return IconButton(
      tooltip: isAdmin
          ? 'Chọn chi nhánh (đang xem: $branchName)'
          : 'Chi nhánh: $branchName (Cố định cho nhân viên)',
      onPressed: () {
        if (isAdmin) {
          _showBranchPicker(context);
        } else {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(
              content: Text('Chỉ Quản trị viên (Admin) mới có quyền chuyển chi nhánh.'),
              duration: Duration(seconds: 2),
            ),
          );
        }
      },
      icon: Stack(
        clipBehavior: Clip.none,
        children: [
          Icon(
            isAll ? Icons.storefront_outlined : Icons.storefront,
            color: AppColors.textPrimary,
            size: 22,
          ),
          if (isAll)
            Positioned(
              right: -3,
              top: -3,
              child: Container(
                width: 9,
                height: 9,
                decoration: const BoxDecoration(
                  color: AppColors.primary,
                  shape: BoxShape.circle,
                  border: Border.fromBorderSide(BorderSide(color: Colors.white, width: 1.5)),
                ),
              ),
            ),
        ],
      ),
    );
  }

  void _showBranchPicker(BuildContext context) {
    if (!UserScope.isAdmin(context)) return;
    final current = BranchScope.selectedBranch(context);
    // Chỉ liệt kê chi nhánh thuộc tenant đã đăng nhập (do Admin doanh nghiệp đó tạo).
    final tenant = TenantScope.selectedTenant(context);
    final branches = tenant == null ? const <Branch>[] : branchesOfTenant(tenant.id);

    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (sheetContext) => SafeArea(
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Padding(
              padding: EdgeInsets.fromLTRB(20, 16, 20, 12),
              child: Text(
                'Chọn chi nhánh',
                style: TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
            ),
            if (includeAll)
              ListTile(
                leading: Icon(
                  Icons.account_balance_outlined,
                  color: current == null ? AppColors.primary : AppColors.textSecondary,
                ),
                title: Text(
                  'Tổng (Tất cả chi nhánh)',
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: current == null ? AppColors.primary : AppColors.textPrimary,
                  ),
                ),
                subtitle: const Text('Gộp dữ liệu toàn hệ thống', style: TextStyle(fontSize: 11)),
                trailing: current == null ? const Icon(Icons.check, color: AppColors.primary) : null,
                onTap: () {
                  BranchScope.select(context, null);
                  Navigator.pop(sheetContext);
                },
              ),
            for (final branch in branches)
              ListTile(
                leading: Icon(
                  Icons.store,
                  color: current?.id == branch.id ? AppColors.primary : AppColors.textSecondary,
                ),
                title: Text(
                  branch.name,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    color: current?.id == branch.id ? AppColors.primary : AppColors.textPrimary,
                  ),
                ),
                subtitle: Text(branch.address, style: const TextStyle(fontSize: 11)),
                trailing: current?.id == branch.id ? const Icon(Icons.check, color: AppColors.primary) : null,
                onTap: () {
                  BranchScope.select(context, branch);
                  Navigator.pop(sheetContext);
                },
              ),
            const SizedBox(height: 8),
          ],
        ),
      ),
    );
  }
}