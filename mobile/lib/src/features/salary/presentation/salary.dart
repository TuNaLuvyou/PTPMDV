import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';
import '../../../core/state/user_scope.dart';
import '../../../core/models/payslip.dart';
import '../../../core/utils/formatters.dart';
import '../../attendance/data/attendance_repository.dart';
import '../../../core/models/attendance.dart';
import '../../leave_request/data/leave_repository.dart';
import '../data/salary_repository.dart';
import 'bank_disbursement_screen.dart';

class WorkLogItem {
  final String date;
  final String checkIn;
  final String checkOut;
  final double hours;
  final int basePay;
  final String status;

  const WorkLogItem({
    required this.date,
    required this.checkIn,
    required this.checkOut,
    required this.hours,
    required this.basePay,
    required this.status,
  });
}

class SalaryScreen extends StatefulWidget {
  const SalaryScreen({super.key});

  @override
  State<SalaryScreen> createState() => _SalaryScreenState();
}

class _SalaryScreenState extends State<SalaryScreen> {
  // Kỳ lương tính động theo tháng hiện tại + danh sách thật từ API.
  // Không dùng tháng 08/2026 cứng.
  late String _selectedMonth;
  late final List<String> _months;

  String _monthLabel(DateTime d, {bool current = false}) {
    final m = d.month.toString().padLeft(2, '0');
    return current ? 'Tháng $m/${d.year} (Hiện tại)' : 'Tháng $m/${d.year}';
  }

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    _months = [
      _monthLabel(now, current: true),
      _monthLabel(DateTime(now.year, now.month - 1)),
      _monthLabel(DateTime(now.year, now.month - 2)),
    ];
    _selectedMonth = _months.first.replaceAll(' (Hiện tại)', '');
    _loadPayslips();
  }

  final SalaryRepository _salaryRepository = SalaryRepository();
  List<WorkLogItem> _workLogs = [];
  List<PayslipModel> _apiPayslips = const [];
  bool _loadingLogs = true;

  Future<void> _loadPayslips() async {
    // Gọi API thật qua gateway (payroll-service và work-service). Không dùng mock cứng.
    try {
      final user = UserScope.currentUser(context);
      final canManage = user?.canManage ?? false;
      final results = await Future.wait([
        _salaryRepository.getPayslips(
          employeeId: canManage ? null : (user?.id.isNotEmpty == true ? user!.id : null),
        ),
        AttendanceRepository()
            .getAttendance(employeeId: user?.id.isNotEmpty == true ? user!.id : null)
            .catchError((_) => <AttendanceModel>[]),
      ]);

      final items = results[0] as List<PayslipModel>;
      final attList = results[1] as List<AttendanceModel>;

      final logs = attList.map((a) {
        String statusLabel = 'Đúng giờ';
        if (a.status == 'late') {
          statusLabel = 'Trễ giờ';
        } else if (a.status == 'absent') {
          statusLabel = 'Vắng';
        } else if (a.status == 'early_leave') {
          statusLabel = 'Về sớm';
        }

        double h = 8.0;
        if (a.checkIn != null && a.checkOut != null) {
          try {
            final sp = a.checkIn!.split(':');
            final ep = a.checkOut!.split(':');
            if (sp.length == 2 && ep.length == 2) {
              final diffMin = (int.parse(ep[0]) * 60 + int.parse(ep[1])) -
                  (int.parse(sp[0]) * 60 + int.parse(sp[1]));
              if (diffMin > 0) h = double.parse((diffMin / 60.0).toStringAsFixed(1));
            }
          } catch (_) {}
        } else if (a.status == 'absent') {
          h = 0.0;
        }

        final hourlyRate = user?.hourlySalary != null && user!.hourlySalary > 0
            ? user.hourlySalary
            : ((user?.baseSalary != null && user!.baseSalary > 0)
                ? (user.baseSalary / 208)
                : 35000.0);
        final pay = (h * hourlyRate).round();

        return WorkLogItem(
          date: a.date,
          checkIn: a.checkIn ?? '--:--',
          checkOut: a.checkOut ?? '--:--',
          hours: h,
          basePay: pay,
          status: statusLabel,
        );
      }).toList();

      if (mounted) {
        setState(() {
          _apiPayslips = items;
          _workLogs = logs;
          _loadingLogs = false;
        });
      }
    } catch (_) {
      if (mounted) {
        setState(() {
          _apiPayslips = [];
          _workLogs = [];
          _loadingLogs = false;
        });
      }
    }
  }

  String _formatCurrency(int amount) {    final str = amount.toString();
    final buffer = StringBuffer();
    int count = 0;
    for (int i = str.length - 1; i >= 0; i--) {
      buffer.write(str[i]);
      count++;
      if (count % 3 == 0 && i != 0) {
        buffer.write('.');
      }
    }
    return '${buffer.toString().split('').reversed.join('')} đ';
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Kỳ lương & Chi tiết công'),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        actions: [
          IconButton(
            tooltip: 'Chi lương Ngân hàng (SOAP / REST)',
            icon: const FaIcon(FontAwesomeIcons.buildingColumns, size: 16, color: AppColors.primary),
            onPressed: () {
              Navigator.push(
                context,
                MaterialPageRoute(builder: (_) => const BankDisbursementScreen()),
              );
            },
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // 1. Month Picker Dropdown
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 4),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: DropdownButtonHideUnderline(
                child: DropdownButton<String>(
                  isExpanded: true,
                  value: _months.firstWhere(
                    (m) => m.startsWith(_selectedMonth),
                    orElse: () => _months.first,
                  ),
                  icon: const FaIcon(FontAwesomeIcons.chevronDown, color: AppColors.primary),
                  items: _months.map((m) {
                    return DropdownMenuItem<String>(
                      value: m,
                      child: Text(
                        'Kỳ: $m',
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14),
                      ),
                    );
                  }).toList(),
                  onChanged: (val) {
                    if (val != null) {
                      final parts = val.split(' ');
                      setState(() {
                        _selectedMonth = '${parts[0]} ${parts[1]}';
                      });
                    }
                  },
                ),
              ),
            ),
            const SizedBox(height: 16),

            // 1b. Phiếu lương từ API thật (gateway -> payroll-service).
            if (_loadingLogs)
              const Padding(
                padding: EdgeInsets.only(bottom: 12),
                child: Text('Đang tải phiếu lương từ máy chủ...', style: TextStyle(fontSize: 12)),
              )
            else if (_apiPayslips.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: const Text('Chưa có phiếu lương từ máy chủ.', style: TextStyle(fontSize: 12)),
              )
            else
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(14),
                margin: const EdgeInsets.only(bottom: 12),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Phiếu lương từ máy chủ',
                      style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                    ),
                    const SizedBox(height: 8),
                    for (final p in _apiPayslips.take(3))
                      Padding(
                        padding: const EdgeInsets.symmetric(vertical: 2),
                        child: Text(
                          '${p.month} • ${formatVND(p.netSalary.toInt())} (cơ bản ${formatVND(p.baseSalary.toInt())} − phạt ${formatVND(p.totalPenalty.toInt())})',
                          style: const TextStyle(fontSize: 12),
                        ),
                      ),
                  ],
                ),
              ),

            // 2. Main Net Salary Card
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF10B981), Color(0xFF059669)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF10B981).withValues(alpha: 0.3),
                    blurRadius: 12,
                    offset: const Offset(0, 4),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'TẠM TÍNH THỰC LĨNH',
                    style: TextStyle(
                      color: Colors.white70,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                      letterSpacing: 1,
                    ),
                  ),
                  const SizedBox(height: 8),
                  Text(
                    _apiPayslips.isNotEmpty
                        ? _formatCurrency(_apiPayslips.first.netSalary.toInt())
                        : _formatCurrency(0),
                    style: const TextStyle(
                      color: Colors.white,
                      fontSize: 28,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 12),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        _apiPayslips.isNotEmpty
                            ? 'Kỳ ${_apiPayslips.first.month}'
                            : 'Chưa có dữ liệu chấm công',
                        style: const TextStyle(color: Colors.white, fontSize: 12),
                      ),
                      const Text('Nguồn: máy chủ', style: TextStyle(color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // 3. Salary Breakdown từ API thật
            _buildSectionHeader('Chi tiết các khoản thu nhập'),
            const SizedBox(height: 10),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: Column(
                children: [
                  _buildSalaryRow('Lương cơ bản', _apiPayslips.isNotEmpty ? _formatCurrency(_apiPayslips.first.baseSalary.toInt()) : _formatCurrency(0)),
                  const Divider(height: 16),
                  _buildSalaryRow('Tổng phạt', _apiPayslips.isNotEmpty ? _formatCurrency(_apiPayslips.first.totalPenalty.toInt()) : _formatCurrency(0), isNegative: true),
                  const Divider(height: 16),
                  _buildSalaryRow('Thực lĩnh', _apiPayslips.isNotEmpty ? _formatCurrency(_apiPayslips.first.netSalary.toInt()) : _formatCurrency(0)),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // 4. Daily Work Log từ API thật (hiện trống khi chưa có attendance chi tiết)
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                _buildSectionHeader('Nhật ký chấm công'),
                Text(
                  '${_workLogs.length} ca làm',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
            const SizedBox(height: 10),
            if (_workLogs.isEmpty)
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: const Text('Chưa có nhật ký chấm công chi tiết từ máy chủ.', style: TextStyle(fontSize: 12)),
              )
            else
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade200),
              ),
              child: ListView.separated(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: _workLogs.length,
                separatorBuilder: (context, index) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final log = _workLogs[index];
                  bool isWarning = log.status.contains('Trễ');

                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(
                              log.date,
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                            ),
                            Text(
                              _formatCurrency(log.basePay),
                              style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.primary),
                            ),
                          ],
                        ),
                        const SizedBox(height: 4),
                        Row(
                          children: [
                            Text(
                              'Vào: ${log.checkIn} - Ra: ${log.checkOut} (${log.hours}h)',
                              style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                            ),
                            const Spacer(),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                              decoration: BoxDecoration(
                                color: isWarning
                                    ? Colors.orange.withValues(alpha: 0.12)
                                    : AppColors.success.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                log.status,
                                style: TextStyle(
                                  fontSize: 10,
                                  fontWeight: FontWeight.bold,
                                  color: isWarning ? Colors.orange.shade800 : AppColors.success,
                                ),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),

            // Khiếu nại phiếu lương
            SizedBox(
              width: double.infinity,
              child: OutlinedButton.icon(
                onPressed: () {
                  _showSupportSheet(context);
                },
                icon: const FaIcon(FontAwesomeIcons.triangleExclamation, size: 18),
                label: const Text(
                  'Khiếu nại phiếu lương',
                  style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: AppColors.error,
                  side: BorderSide(color: AppColors.error.withValues(alpha: 0.4)),
                  padding: const EdgeInsets.symmetric(vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                ),
              ),
            ),
            const SizedBox(height: 12),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 15,
        fontWeight: FontWeight.bold,
        color: AppColors.textPrimary,
      ),
    );
  }

  Widget _buildSalaryRow(String label, String amount, {bool isPositive = false, bool isNegative = false}) {
    Color amountColor = AppColors.textPrimary;
    if (isPositive) amountColor = const Color(0xFF10B981);
    if (isNegative) amountColor = AppColors.error;

    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Expanded(
          child: Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppColors.textPrimary),
          ),
        ),
        Text(
          amount,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: amountColor,
          ),
        ),
      ],
    );
  }

  void _showSupportSheet(BuildContext context) {
    final textController = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (bottomSheetCtx) => Padding(
        padding: EdgeInsets.only(
          left: 24.0,
          right: 24.0,
          top: 24.0,
          bottom: MediaQuery.of(bottomSheetCtx).viewInsets.bottom + 24,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            const Text('Khiếu nại công / Lương', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            TextField(
              controller: textController,
              decoration: const InputDecoration(
                labelText: 'Mô tả vấn đề',
                hintText: 'Ví dụ: Ca làm việc bị ghi nhận trễ giờ do lỗi hệ thống...',
              ),
              maxLines: 3,
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final content = textController.text.trim();
                if (content.isEmpty) return;
                try {
                  final user = UserScope.currentUser(context);
                  await LeaveRepository().createRequest({
                    'type': 'other',
                    'title': 'Khiếu nại phiếu lương $_selectedMonth',
                    'content': content,
                    'employeeId': user?.id ?? '',
                  });
                  if (bottomSheetCtx.mounted) Navigator.pop(bottomSheetCtx);
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      const SnackBar(
                        backgroundColor: AppColors.success,
                        content: Text('✅ Đã gửi phản ánh tới phòng Nhân sự qua hệ thống!'),
                      ),
                    );
                  }
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(
                        backgroundColor: AppColors.error,
                        content: Text('❌ Gửi khiếu nại thất bại: $e'),
                      ),
                    );
                  }
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppColors.primary),
              child: const Text('Gửi phản ánh', style: TextStyle(color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}
