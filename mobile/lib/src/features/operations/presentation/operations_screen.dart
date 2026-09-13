import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/branch_selector.dart';
import '../../auth/presentation/login_screen.dart';
import '../../revenue/presentation/revenue_screen.dart';
import '../../schedule/presentation/general_schedule_screen.dart';
import '../../salary/presentation/salary_screen.dart';
import 'staff_monitor_screen.dart';
import 'shift_request_screen.dart';
import 'menu_availability_screen.dart';
import 'wifi_config_screen.dart';

class OperationsScreen extends StatelessWidget {
  final UserModel currentUser;
  final VoidCallback? onReturnHome;

  const OperationsScreen({
    super.key,
    this.currentUser = const UserModel(
      name: 'Nguyễn Văn A',
      email: 'nhanvien@highlands.vn',
      role: 'staff',
      roleTitle: 'Nhân viên',
    ),
    this.onReturnHome,
  });

  void _showLockedDialog(BuildContext context, String featureName) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: const Row(
          children: [
            Icon(Icons.lock, color: AppColors.error, size: 24),
            SizedBox(width: 8),
            Text('Quyền bị khóa', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              'Tính năng "$featureName" chỉ dành cho cấp Quản lý / Quản trị viên chi nhánh.',
              style: const TextStyle(fontSize: 14),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(10),
              decoration: BoxDecoration(
                color: Colors.amber.shade50,
                borderRadius: BorderRadius.circular(8),
                border: Border.all(color: Colors.amber.shade200),
              ),
              child: Row(
                children: [
                  Icon(Icons.info_outline, color: Colors.amber.shade900, size: 18),
                  const SizedBox(width: 8),
                  const Expanded(
                    child: Text(
                      'Tài khoản Nhân viên không thể xem dữ liệu doanh thu & quản trị.',
                      style: TextStyle(fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Đóng'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isManager = currentUser.isManager;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        automaticallyImplyLeading: false,
        title: const Text(
          'Danh mục tác vụ',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontWeight: FontWeight.bold,
            fontSize: 18,
          ),
        ),
        actions: [
          if (isManager) const BranchSelector(includeAll: true),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        children: [
          // 1. Phân hệ Quản trị (Quản lý)
          _buildSectionTitle(
            'Phân hệ Quản trị',
            'Dành cho Quản lý / Giám sát chi nhánh',
            Icons.admin_panel_settings,
            AppColors.primary,
          ),
          const SizedBox(height: 10),

          // Action 1: Báo cáo doanh thu (Khoá khi là Nhân viên)
          _buildFeatureCard(
            title: 'Báo cáo doanh thu',
            subtitle: isManager
                ? 'Xem tổng doanh thu, biểu đồ giờ cao điểm & hóa đơn'
                : '🔒 Đã khóa - Yêu cầu quyền Quản lý để xem doanh thu',
            icon: Icons.bar_chart,
            iconColor: Colors.green,
            isLocked: !isManager,
            badgeText: isManager ? 'Toàn quyền' : 'Chỉ Quản lý',
            badgeColor: isManager ? AppColors.success : Colors.grey,
            onTap: () {
              if (isManager) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const RevenueScreen()),
                );
              } else {
                _showLockedDialog(context, 'Báo cáo doanh thu');
              }
            },
          ),

          // Action 2: Giám sát nhân sự
          _buildFeatureCard(
            title: 'Giám sát nhân sự',
            subtitle: isManager
                ? 'Xem nhân viên đang có mặt trong ca & điểm danh'
                : '🔒 Đã khóa - Yêu cầu quyền Quản lý',
            icon: Icons.people_alt_outlined,
            iconColor: Colors.indigo,
            isLocked: !isManager,
            badgeText: isManager ? '4 online' : 'Chỉ Quản lý',
            badgeColor: isManager ? Colors.indigo : Colors.grey,
            onTap: () {
              if (isManager) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const StaffMonitorScreen()),
                );
              } else {
                _showLockedDialog(context, 'Giám sát nhân sự');
              }
            },
          ),

          // Action 3: Duyệt yêu cầu chung
          _buildFeatureCard(
            title: 'Duyệt yêu cầu chung',
            subtitle: isManager
                ? 'Phê duyệt các yêu cầu xin nghỉ / pass ca từ nhân viên'
                : '🔒 Đã khóa - Yêu cầu quyền Quản lý',
            icon: Icons.check_circle_outline,
            iconColor: Colors.orange,
            isLocked: !isManager,
            badgeText: isManager ? '2 chờ duyệt' : 'Chỉ Quản lý',
            badgeColor: isManager ? Colors.orange : Colors.grey,
            onTap: () {
              if (isManager) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const ShiftRequestScreen()),
                );
              } else {
                _showLockedDialog(context, 'Duyệt yêu cầu chung');
              }
            },
          ),

          // Action 4: Bật / Tắt món hết hàng
          _buildFeatureCard(
            title: 'Bật / Tắt món hết hàng',
            subtitle: isManager
                ? 'Cập nhật nhanh tình trạng còn/hết món trên menu'
                : '🔒 Đã khóa - Yêu cầu quyền Quản lý',
            icon: Icons.inventory_2_outlined,
            iconColor: Colors.deepOrange,
            isLocked: !isManager,
            badgeText: isManager ? 'Sẵn sàng' : 'Chỉ Quản lý',
            badgeColor: isManager ? Colors.deepOrange : Colors.grey,
            onTap: () {
              if (isManager) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const MenuAvailabilityScreen()),
                );
              } else {
                _showLockedDialog(context, 'Bật / Tắt món hết hàng');
              }
            },
          ),

          // Action 5: Cấu hình Wi-Fi chi nhánh
          _buildFeatureCard(
            title: 'Cấu hình Wi-Fi',
            subtitle: isManager
                ? 'Đặt nhiều mạng & mật khẩu Wi-Fi cho từng chi nhánh'
                : '🔒 Đã khóa - Yêu cầu quyền Quản lý',
            icon: Icons.wifi,
            iconColor: Colors.teal,
            isLocked: !isManager,
            badgeText: isManager ? 'Chấm công' : 'Chỉ Quản lý',
            badgeColor: isManager ? Colors.teal : Colors.grey,
            onTap: () {
              if (isManager) {
                Navigator.push(
                  context,
                  MaterialPageRoute(builder: (context) => const WifiConfigScreen()),
                );
              } else {
                _showLockedDialog(context, 'Cấu hình Wi-Fi');
              }
            },
          ),

          const SizedBox(height: 24),

          // 2. Phân hệ Nhân viên (Nghiệp vụ)
          _buildSectionTitle(
            'Phân hệ Nhân viên',
            'Nghiệp vụ ca làm & cá nhân',
            Icons.badge_outlined,
            Colors.blue,
          ),
          const SizedBox(height: 10),

          // Staff Action 2: Lịch làm việc chung
          _buildFeatureCard(
            title: 'Lịch làm việc chung',
            subtitle: 'Xem phân ca toàn chi nhánh & danh sách nhân viên theo ca',
            icon: Icons.calendar_month,
            iconColor: Colors.blue,
            isLocked: false,
            badgeText: 'Toàn chi nhánh',
            badgeColor: Colors.blue,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const GeneralScheduleScreen()),
              );
            },
          ),

          // Staff Action 3: Kỳ lương & Chấm công
          _buildFeatureCard(
            title: 'Kỳ lương & Chấm công',
            subtitle: 'Xem số công, giờ làm thực tế và tạm tính thu nhập',
            icon: Icons.payments,
            iconColor: Colors.green,
            isLocked: false,
            badgeText: '22 công',
            badgeColor: Colors.green,
            onTap: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (context) => const SalaryScreen()),
              );
            },
          ),

          const SizedBox(height: 30),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title, String subtitle, IconData icon, Color color) {
    return Row(
      children: [
        Container(
          padding: const EdgeInsets.all(6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.12),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Icon(icon, size: 18, color: color),
        ),
        const SizedBox(width: 10),
        Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              title,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.bold,
                color: AppColors.textPrimary,
              ),
            ),
            Text(
              subtitle,
              style: const TextStyle(
                fontSize: 11,
                color: AppColors.textSecondary,
              ),
            ),
          ],
        ),
      ],
    );
  }

  Widget _buildFeatureCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color iconColor,
    required bool isLocked,
    required String badgeText,
    required Color badgeColor,
    required VoidCallback onTap,
  }) {
    return Card(
      margin: const EdgeInsets.only(bottom: 10),
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(
          color: isLocked ? Colors.grey.shade200 : Colors.grey.shade300,
        ),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: isLocked ? Colors.grey.shade50.withValues(alpha: 0.7) : Colors.white,
            borderRadius: BorderRadius.circular(14),
          ),
          child: Row(
            children: [
              // Icon with locked overlay
              Stack(
                children: [
                  CircleAvatar(
                    radius: 22,
                    backgroundColor: isLocked ? Colors.grey.shade200 : iconColor.withValues(alpha: 0.12),
                    child: Icon(
                      icon,
                      color: isLocked ? Colors.grey.shade500 : iconColor,
                      size: 22,
                    ),
                  ),
                  if (isLocked)
                    Positioned(
                      right: 0,
                      bottom: 0,
                      child: Container(
                        padding: const EdgeInsets.all(2),
                        decoration: const BoxDecoration(
                          color: AppColors.error,
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.lock, size: 10, color: Colors.white),
                      ),
                    ),
                ],
              ),
              const SizedBox(width: 14),
              // Title & Subtitle
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Text(
                          title,
                          style: TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                            color: isLocked ? Colors.grey.shade700 : AppColors.textPrimary,
                          ),
                        ),
                        if (isLocked) ...[
                          const SizedBox(width: 6),
                          const Icon(Icons.lock, size: 13, color: AppColors.error),
                        ],
                      ],
                    ),
                    const SizedBox(height: 3),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 11,
                        color: isLocked ? AppColors.error : AppColors.textSecondary,
                        fontWeight: isLocked ? FontWeight.w500 : FontWeight.normal,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              // Badge & Chevron
              Column(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 3),
                    decoration: BoxDecoration(
                      color: badgeColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: Text(
                      badgeText,
                      style: TextStyle(
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        color: badgeColor,
                      ),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Icon(
                    isLocked ? Icons.lock_outline : Icons.chevron_right,
                    size: 18,
                    color: isLocked ? AppColors.error : AppColors.textSecondary,
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
