import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/state/branch_scope.dart';
import '../../../core/state/tenant_scope.dart';
import '../../auth/presentation/login_screen.dart';
import '../../revenue/presentation/revenue_screen.dart';
import '../../schedule/presentation/schedule_screen.dart';
import '../../salary/presentation/salary_screen.dart';

class HomeScreen extends StatefulWidget {
  final UserModel currentUser;
  final Function(int tabIndex)? onNavigateToTab;

  const HomeScreen({
    super.key,
    this.currentUser = const UserModel(
      name: 'Nguyễn Văn A',
      email: 'nhanvien@highlands.vn',
      role: 'staff',
      roleTitle: 'Nhân viên',
    ),
    this.onNavigateToTab,
  });

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  ShiftDetail? _checkedInShift;
  DateTime? _checkedInTime;

  UserModel get currentUser => widget.currentUser;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        title: const Text(
          'Trang chủ',
          style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.transparent,
        elevation: 0,
        centerTitle: true,
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined, color: Colors.white),
            onPressed: () {
              if (widget.onNavigateToTab != null) widget.onNavigateToTab!(2); // Switch to Notifications
            },
          ),
        ],
      ),
      body: Stack(
        children: [
          // ── Nửa trên: Ảnh background quán cafe fade dần từ nút chấm công lên ──
          Positioned(
            top: 0,
            left: 0,
            right: 0,
            height: 420,
            child: Stack(
              fit: StackFit.expand,
              children: [
                // Ảnh không gian quán (ảnh demo chung cho mọi doanh nghiệp)
                Image.network(
                  'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop',
                  fit: BoxFit.cover,
                  errorBuilder: (context, error, stackTrace) => Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                        colors: [Color(0xFF5B1115), Color(0xFF8B1E22), Color(0xFF2C0A0C)],
                      ),
                    ),
                  ),
                ),
                // Lớp gradient chuyển màu mượt mà (Fade từ nút chấm công lên trên)
                Container(
                  decoration: BoxDecoration(
                    gradient: LinearGradient(
                      begin: Alignment.topCenter,
                      end: Alignment.bottomCenter,
                      colors: [
                        Colors.black.withValues(alpha: 0.65),
                        Colors.black.withValues(alpha: 0.35),
                        AppColors.primary.withValues(alpha: 0.20),
                        AppColors.background.withValues(alpha: 0.85),
                        AppColors.background,
                      ],
                      stops: const [0.0, 0.35, 0.65, 0.88, 1.0],
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Nội dung cuộn trang ──────────────────────────────────
          SafeArea(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildHeader(context),
                  const SizedBox(height: 60),
                  _buildCheckInOutButton(context),
                  const SizedBox(height: 36),

                  Row(
                    children: [
                      Expanded(
                        child: _buildQuickActionCard(
                          title: 'Lịch làm việc',
                          subtitle: 'Xem ca & phân công',
                          icon: Icons.calendar_month,
                          color: const Color(0xFF2563EB),
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(builder: (context) => const ScheduleScreen()),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _buildQuickActionCard(
                          title: 'Doanh thu',
                          subtitle: currentUser.isManager ? 'Báo cáo ca/ngày' : '🔒 Chỉ Quản lý',
                          icon: Icons.insights,
                          color: const Color(0xFF10B981),
                          onTap: () {
                            if (currentUser.isManager) {
                              Navigator.push(
                                context,
                                MaterialPageRoute(builder: (context) => const RevenueScreen()),
                              );
                            } else {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Chỉ Quản lý mới xem được báo cáo doanh thu.'),
                                  duration: Duration(seconds: 2),
                                ),
                              );
                            }
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),

                  const Text(
                    'Thông tin cá nhân & ca làm',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: AppColors.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  _buildScheduleWidget(context),
                  const SizedBox(height: 12),
                  _buildSalaryWidget(context),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _greeting() {
    final int hour = DateTime.now().hour;
    if (hour >= 5 && hour < 12) return 'Chào buổi sáng 👋';
    if (hour >= 12 && hour < 18) return 'Chào buổi chiều 👋';
    return 'Chào buổi tối 👋';
  }

  Widget _buildHeader(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 6),
      child: Row(
        children: [
          Container(
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              border: Border.all(color: Colors.white.withValues(alpha: 0.4), width: 1.5),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.25),
                  blurRadius: 10,
                  offset: const Offset(0, 3),
                ),
              ],
            ),
            child: CircleAvatar(
              radius: 26,
              backgroundColor: Colors.white.withValues(alpha: 0.2),
              child: Icon(
                currentUser.isManager ? Icons.admin_panel_settings : Icons.person,
                color: Colors.white,
                size: 28,
              ),
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _greeting(),
                  style: TextStyle(
                    fontSize: 13,
                    color: Colors.white.withValues(alpha: 0.85),
                    fontWeight: FontWeight.w500,
                    shadows: const [
                      Shadow(color: Colors.black54, blurRadius: 4, offset: Offset(0, 1)),
                    ],
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  currentUser.name,
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    shadows: [
                      Shadow(color: Colors.black54, blurRadius: 6, offset: Offset(0, 1)),
                    ],
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Icon(Icons.storefront, size: 14, color: Colors.white.withValues(alpha: 0.9)),
                    const SizedBox(width: 4),
                    Flexible(
                      child: Text(
                        TenantScope.label(context),
                        overflow: TextOverflow.ellipsis,
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.95),
                          fontSize: 12.5,
                          fontWeight: FontWeight.bold,
                          shadows: const [
                            Shadow(color: Colors.black54, blurRadius: 4, offset: Offset(0, 1)),
                          ],
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildQuickActionCard({
    required String title,
    required String subtitle,
    required IconData icon,
    required Color color,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(14),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: Colors.grey.shade200),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.02),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            CircleAvatar(
              radius: 20,
              backgroundColor: color.withValues(alpha: 0.12),
              child: Icon(icon, color: color, size: 22),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: 15,
                color: AppColors.textPrimary,
              ),
            ),
            const SizedBox(height: 2),
            Text(
              subtitle,
              style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildCheckInOutButton(BuildContext context) {
    final bool isCheckedIn = _checkedInShift != null;

    // Khi đã chấm công vào: chuyển nút sang màu vàng/amber nổi bật; khi chưa: màu đỏ
    final List<Color> gradientColors = isCheckedIn
        ? const [Color(0xFFF59E0B), Color(0xFFD97706)]
        : const [AppColors.primary, Color(0xFF7F1D1D)];

    final Color shadowColor = isCheckedIn
        ? const Color(0xFFD97706).withValues(alpha: 0.45)
        : AppColors.primary.withValues(alpha: 0.4);

    final String titleText = isCheckedIn ? 'Chấm công ra ca' : 'Chấm công vào ca';

    final String subtitleText = isCheckedIn
        ? 'Đang làm: ${_checkedInShift!.shiftName} (${_checkedInShift!.timeRange})'
        : 'Chạm để xác thực Wi-Fi chi nhánh';

    final IconData mainIcon = isCheckedIn ? Icons.timer_outlined : Icons.touch_app_outlined;

    return Container(
      width: double.infinity,
      height: 104,
      decoration: BoxDecoration(
        borderRadius: BorderRadius.circular(20),
        gradient: LinearGradient(
          colors: gradientColors,
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        boxShadow: [
          BoxShadow(
            color: shadowColor,
            blurRadius: 18,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: () {
            if (isCheckedIn) {
              _showCheckOutSheet(context);
            } else {
              _showCheckInSheet(context);
            }
          },
          borderRadius: BorderRadius.circular(20),
          child: Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
            child: Row(
              children: [
                Container(
                  width: 56,
                  height: 56,
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.22),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: Colors.white.withValues(alpha: 0.35), width: 1.5),
                  ),
                  child: Icon(mainIcon, color: Colors.white, size: 30),
                ),
                const SizedBox(width: 16),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        titleText,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          color: Colors.white,
                          letterSpacing: 0.3,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        subtitleText,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          fontSize: 12.5,
                          color: Colors.white,
                          fontWeight: FontWeight.w400,
                        ),
                      ),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.all(8),
                  decoration: BoxDecoration(
                    color: Colors.white.withValues(alpha: 0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(Icons.arrow_forward, color: Colors.white, size: 18),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Color _getShiftStatusColor(String status) => ScheduleService.getStatusColor(status);

  String _getShiftStatusLabel(String status) => ScheduleService.getStatusLabel(status);

  void _showCheckInSheet(BuildContext context) {
    // Wi-Fi chi nhánh hiện theo tenant — tránh hardcode tên thương hiệu cụ thể.
    final tenant = TenantScope.selectedTenant(context);
    final branch = BranchScope.selectedBranch(context);
    final String wifiSsid = '${(tenant?.brandCode ?? 'SAAS').toUpperCase()}_${branch?.code ?? '01'}';

    // Lấy danh sách ca làm việc được phân công cho nhân viên trong hôm nay
    final assignedShifts = ScheduleService.getTodayAssignedShifts(
      user: currentUser,
      branchName: branch?.name,
      activeCheckedInShift: _checkedInShift,
    );

    ShiftDetail? selectedShift = assignedShifts.isNotEmpty ? assignedShifts.first : null;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) => StatefulBuilder(
        builder: (context, setModalState) {
          final bool hasAssignedShifts = assignedShifts.isNotEmpty;
          final double sheetHeight = MediaQuery.of(context).size.height * 0.52;

          return Container(
            height: sheetHeight,
            padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
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
                  'Chấm công vào ca làm việc',
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 18),

                Expanded(
                  child: SingleChildScrollView(
                    physics: const BouncingScrollPhysics(),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.stretch,
                      children: [
                        const Text('Chọn ca', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                        const SizedBox(height: 8),

                        if (hasAssignedShifts)
                          DropdownButtonFormField<ShiftDetail>(
                            isExpanded: true,
                            initialValue: selectedShift,
                            items: assignedShifts.map((shift) {
                              return DropdownMenuItem<ShiftDetail>(
                                value: shift,
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Text(
                                        '${shift.shiftName} (${shift.timeRange})',
                                        overflow: TextOverflow.ellipsis,
                                        style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13.5),
                                      ),
                                    ),
                                    const SizedBox(width: 8),
                                    Container(
                                      padding: const EdgeInsets.symmetric(horizontal: 7, vertical: 2.5),
                                      decoration: BoxDecoration(
                                        color: _getShiftStatusColor(shift.status).withValues(alpha: 0.12),
                                        borderRadius: BorderRadius.circular(6),
                                      ),
                                      child: Text(
                                        _getShiftStatusLabel(shift.status),
                                        style: TextStyle(
                                          fontSize: 10.5,
                                          fontWeight: FontWeight.bold,
                                          color: _getShiftStatusColor(shift.status),
                                        ),
                                      ),
                                    ),
                                  ],
                                ),
                              );
                            }).toList(),
                            onChanged: (value) {
                              if (value != null) {
                                setModalState(() {
                                  selectedShift = value;
                                });
                              }
                            },
                            decoration: InputDecoration(
                              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
                              border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                            ),
                          )
                        else
                          Container(
                            padding: const EdgeInsets.all(14),
                            decoration: BoxDecoration(
                              color: const Color(0xFFFEF3C7),
                              borderRadius: BorderRadius.circular(12),
                              border: Border.all(color: const Color(0xFFFCD34D)),
                            ),
                            child: const Row(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Icon(Icons.event_busy_outlined, color: Color(0xFFD97706), size: 22),
                                SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        'Không có ca làm việc hôm nay',
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 13.5,
                                          color: Color(0xFF92400E),
                                        ),
                                      ),
                                      SizedBox(height: 3),
                                      Text(
                                        'Bạn chưa được xếp vào ca nào trong ngày hôm nay. Vui lòng liên hệ Quản lý nếu cần bổ sung ca.',
                                        style: TextStyle(fontSize: 12, color: Color(0xFF92400E)),
                                      ),
                                    ],
                                  ),
                                ),
                              ],
                            ),
                          ),

                        const SizedBox(height: 16),
                        Container(
                          padding: const EdgeInsets.all(12),
                          decoration: BoxDecoration(
                            color: AppColors.background,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                '📡 Wi-Fi kết nối: $wifiSsid',
                                style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                              ),
                              const SizedBox(height: 4),
                              const Text(
                                'BSSID: 00:11:22:33:44:55 (Hợp lệ)',
                                style: TextStyle(color: AppColors.success, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ),
                  ),
                ),

                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: hasAssignedShifts && selectedShift != null
                      ? () {
                          final targetShift = selectedShift!;
                          final now = DateTime.now();
                          Navigator.pop(context);
                          setState(() {
                            _checkedInShift = targetShift;
                            _checkedInTime = now;
                          });
                          ScaffoldMessenger.of(context).showSnackBar(
                            SnackBar(
                              backgroundColor: AppColors.success,
                              content: Text('✅ Chấm công vào ${targetShift.shiftName} (${targetShift.timeRange}) thành công!'),
                            ),
                          );
                        }
                      : null,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    disabledBackgroundColor: Colors.grey.shade300,
                    foregroundColor: Colors.white,
                    disabledForegroundColor: Colors.grey.shade600,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  ),
                  child: Text(
                    hasAssignedShifts ? 'Xác nhận Chấm công' : 'Chưa được xếp ca làm việc',
                    style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showCheckOutSheet(BuildContext context) {
    if (_checkedInShift == null) return;
    final shift = _checkedInShift!;
    final tenant = TenantScope.selectedTenant(context);
    final branch = BranchScope.selectedBranch(context);
    final String wifiSsid = '${(tenant?.brandCode ?? 'SAAS').toUpperCase()}_${branch?.code ?? '01'}';

    final String checkInTimeStr = _checkedInTime != null
        ? '${_checkedInTime!.hour.toString().padLeft(2, '0')}:${_checkedInTime!.minute.toString().padLeft(2, '0')}'
        : '08:00';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (context) {
        final double sheetHeight = MediaQuery.of(context).size.height * 0.52;

        return Container(
          height: sheetHeight,
          padding: const EdgeInsets.fromLTRB(24, 12, 24, 24),
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
                'Chấm công ra ca làm việc',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 18),

              Expanded(
                child: SingleChildScrollView(
                  physics: const BouncingScrollPhysics(),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      const Text('Ca làm việc đang thực hiện', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                      const SizedBox(height: 8),

                      // Card ca làm việc đã chấm công vào để chấm công ra ca
                      Container(
                        padding: const EdgeInsets.all(16),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFEF3C7),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(color: const Color(0xFFF59E0B)),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                Expanded(
                                  child: Text(
                                    '${shift.shiftName} (${shift.timeRange})',
                                    style: const TextStyle(
                                      fontSize: 15,
                                      fontWeight: FontWeight.bold,
                                      color: Color(0xFF92400E),
                                    ),
                                  ),
                                ),
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFD97706),
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: const Text(
                                    'Đang trong ca',
                                    style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 11,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 8),
                            Text(
                              '• Vai trò: ${shift.role}\n• Chi nhánh: ${shift.branch}\n• Đã chấm công vào lúc: $checkInTimeStr',
                              style: const TextStyle(fontSize: 12.5, color: Color(0xFF78350F), height: 1.4),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.background,
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              '📡 Wi-Fi kết nối: $wifiSsid',
                              style: const TextStyle(fontWeight: FontWeight.w600, fontSize: 13),
                            ),
                            const SizedBox(height: 4),
                            const Text(
                              'BSSID: 00:11:22:33:44:55 (Hợp lệ)',
                              style: TextStyle(color: AppColors.success, fontSize: 12),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),
              ElevatedButton(
                onPressed: () {
                  final shiftOut = _checkedInShift;
                  Navigator.pop(context);
                  setState(() {
                    _checkedInShift = null;
                    _checkedInTime = null;
                  });
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      backgroundColor: AppColors.success,
                      content: Text('✅ Chấm công ra ca ${shiftOut?.shiftName ?? ''} (${shiftOut?.timeRange ?? ''}) thành công!'),
                    ),
                  );
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFD97706),
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
                child: const Text(
                  'Xác nhận Ra ca',
                  style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  Widget _buildScheduleWidget(BuildContext context) {
    final assignedShifts = ScheduleService.getTodayAssignedShifts(
      user: currentUser,
      activeCheckedInShift: _checkedInShift,
    );

    final String scheduleText = assignedShifts.isNotEmpty
        ? 'Hôm nay: ${assignedShifts.map((s) => '${s.shiftName} (${s.timeRange})').join(', ')}'
        : 'Hôm nay: Nghỉ (Không có ca làm việc)';

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const ScheduleScreen()),
          );
        },
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.blue.withValues(alpha: 0.1),
                child: const Icon(Icons.calendar_month, color: Colors.blue),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Lịch làm việc trong tuần', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 2),
                    Text(
                      scheduleText,
                      style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 20, color: AppColors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildSalaryWidget(BuildContext context) {
    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: () {
          Navigator.push(
            context,
            MaterialPageRoute(builder: (context) => const SalaryScreen()),
          );
        },
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          child: Row(
            children: [
              CircleAvatar(
                backgroundColor: Colors.green.withValues(alpha: 0.1),
                child: const Icon(Icons.payments, color: Colors.green),
              ),
              const SizedBox(width: 12),
              const Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Kỳ lương & Chi tiết công', style: TextStyle(fontWeight: FontWeight.w600, fontSize: 14)),
                    SizedBox(height: 2),
                    Text('Đã làm: 22 công • Tạm tính: 6.800.000 đ', style: TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, size: 20, color: AppColors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}
