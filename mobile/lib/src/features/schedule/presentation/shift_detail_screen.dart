import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import 'schedule_screen.dart';
import 'shift_action_form_screen.dart';

class ShiftDetailScreen extends StatefulWidget {
  final ShiftDetail shift;
  final String date;
  final String dayOfWeek;

  const ShiftDetailScreen({
    super.key,
    required this.shift,
    required this.date,
    required this.dayOfWeek,
  });

  @override
  State<ShiftDetailScreen> createState() => _ShiftDetailScreenState();
}

class _ShiftDetailScreenState extends State<ShiftDetailScreen> {
  void _navigateToForm(ShiftActionType type) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => ShiftActionFormScreen(
          shift: widget.shift,
          date: widget.date,
          dayOfWeek: widget.dayOfWeek,
          actionType: type,
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final shift = widget.shift;

    final Color statusColor = ScheduleService.getStatusColor(shift.status);
    final String statusText = ScheduleService.getStatusLabel(shift.status);

    // Dữ liệu chấm công mock dựa theo trạng thái ca
    final String checkIn = shift.status == 'completed'
        ? '07:55'
        : (shift.status == 'active'
            ? '07:58'
            : (shift.status == 'missed' ? 'Chưa chấm công' : '--:--'));
    final String checkOut = shift.status == 'completed'
        ? '12:05'
        : (shift.status == 'active'
            ? 'Đang trong ca'
            : (shift.status == 'missed' ? 'Chưa chấm công' : '--:--'));
    final String tongGioTinhCong = shift.status == 'completed'
        ? '${shift.hours} giờ'
        : (shift.status == 'active'
            ? 'Đang tính...'
            : (shift.status == 'missed' ? '0.0 giờ' : '--'));
    final String nguonCong = (shift.status == 'upcoming' || shift.status == 'missed')
        ? 'Phân công (Quản lý)'
        : 'Hệ thống tự động';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Chi tiết ca làm việc'),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
          tooltip: 'Quay lại',
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header tổng quan ──────────────────────────────────
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(18),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.03),
                    blurRadius: 10,
                    offset: const Offset(0, 3),
                  ),
                ],
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppColors.primary.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.access_time_filled, color: AppColors.primary, size: 28),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          shift.shiftName,
                          style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '${widget.dayOfWeek}, ${widget.date}/2026 • ${shift.timeRange}',
                          style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                    decoration: BoxDecoration(
                      color: statusColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: Text(
                      statusText,
                      style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Thông tin chấm công ───────────────────────────────
            const Text(
              'Thông tin chấm công',
              style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
            ),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.symmetric(vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  _buildInfoRow(Icons.calendar_today_outlined, 'Ngày tính công',
                      '${widget.date}/08/2026 (${widget.dayOfWeek})'),
                  _divider(),
                  _buildInfoRow(Icons.person_outline, 'Nhân viên', 'Nguyễn Văn A'),
                  _divider(),
                  _buildInfoRow(Icons.work_outline, 'Ca làm việc', shift.shiftName),
                  _divider(),
                  _buildInfoRow(Icons.login, 'Giờ check-in tính công', checkIn),
                  _divider(),
                  _buildInfoRow(Icons.logout, 'Giờ check-out tính công', checkOut),
                  _divider(),
                  _buildInfoRow(Icons.timer_outlined, 'Số giờ tính công', tongGioTinhCong),
                  _divider(),
                  _buildInfoRow(Icons.flag_outlined, 'Trạng thái', statusText,
                      valueColor: statusColor),
                  _divider(),
                  _buildInfoRow(Icons.source_outlined, 'Nguồn công', nguonCong),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Tác vụ ───────────────────────────────────────────
            if (shift.status == 'upcoming') ...[
              const Text(
                'Tùy chọn',
                style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 10),
              _buildActionButton(
                title: 'Nhờ làm thay',
                icon: Icons.person_add_alt_1_outlined,
                color: Colors.orange.shade800,
                bgColor: Colors.orange.shade50,
                onTap: () => _navigateToForm(ShiftActionType.cover),
              ),
              const SizedBox(height: 8),
              _buildActionButton(
                title: 'Đổi ca làm việc',
                icon: Icons.swap_horiz_rounded,
                color: AppColors.primary,
                bgColor: AppColors.primary.withValues(alpha: 0.08),
                onTap: () => _navigateToForm(ShiftActionType.swap),
              ),
              const SizedBox(height: 8),
              _buildActionButton(
                title: 'Xin nghỉ ca',
                icon: Icons.event_busy_outlined,
                color: Colors.red.shade700,
                bgColor: Colors.red.shade50,
                onTap: () => _navigateToForm(ShiftActionType.leave),
              ),
            ] else ...[
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    Icon(
                      shift.status == 'completed' ? Icons.check_circle_outline : Icons.info_outline,
                      color: shift.status == 'completed' ? AppColors.success : AppColors.primary,
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Text(
                        shift.status == 'completed'
                            ? 'Ca làm việc đã hoàn thành và được ghi nhận công.'
                            : 'Ca làm việc đang diễn ra.',
                        style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
                      ),
                    ),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _divider() => const Divider(height: 1, indent: 16, endIndent: 16);

  Widget _buildInfoRow(IconData icon, String label, String value, {Color? valueColor}) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 13),
      child: Row(
        children: [
          Icon(icon, size: 17, color: AppColors.textSecondary),
          const SizedBox(width: 10),
          SizedBox(
            width: 155,
            child: Text(
              label,
              style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
            ),
          ),
          Expanded(
            child: Text(
              value,
              textAlign: TextAlign.end,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.bold,
                color: valueColor ?? AppColors.textPrimary,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton({
    required String title,
    required IconData icon,
    required Color color,
    required Color bgColor,
    required VoidCallback onTap,
  }) {
    return InkWell(
      onTap: onTap,
      borderRadius: BorderRadius.circular(12),
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
        decoration: BoxDecoration(
          color: bgColor,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.25)),
        ),
        child: Row(
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                title,
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: color),
              ),
            ),
            Icon(Icons.chevron_right, color: color.withValues(alpha: 0.6), size: 20),
          ],
        ),
      ),
    );
  }
}
