import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/state/branch_scope.dart';

class StaffInShift {
  final String name;
  final String role;
  final String avatarUrl;
  final String checkInStatus; // 'checked_in', 'in_progress', 'not_yet'
  final String checkInTime;
  final String phone;

  const StaffInShift({
    required this.name,
    required this.role,
    this.avatarUrl = '',
    required this.checkInStatus,
    required this.checkInTime,
    required this.phone,
  });
}

class GeneralShiftModel {
  final String id;
  final String shiftName;
  final String startTime;
  final String endTime;
  final String status; // 'active', 'upcoming', 'completed'
  final List<StaffInShift> staffList;

  const GeneralShiftModel({
    required this.id,
    required this.shiftName,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.staffList,
  });

  String get timeRange => '$startTime - $endTime';
  int get staffCount => staffList.length;
}

class GeneralDayModel {
  final String dayOfWeek;
  final String date;
  final bool isToday;
  final List<GeneralShiftModel> shifts;

  const GeneralDayModel({
    required this.dayOfWeek,
    required this.date,
    required this.shifts,
    this.isToday = false,
  });
}

class GeneralScheduleScreen extends StatefulWidget {
  const GeneralScheduleScreen({super.key});

  @override
  State<GeneralScheduleScreen> createState() => _GeneralScheduleScreenState();
}

class _GeneralScheduleScreenState extends State<GeneralScheduleScreen> {
  // Offset tuần so với tuần hiện tại (0: Tuần này, -1: Tuần trước, 1: Tuần sau, -2, 2, ...)
  int _weekOffset = 0;
  int _selectedDayIndex = 0;

  DateTime get _today {
    final now = DateTime.now();
    return DateTime(now.year, now.month, now.day);
  }

  DateTime get _thisWeekMonday => _getMonday(_today);

  // Set các ID ca đang được mở rộng xổ xuống
  final Set<String> _expandedShiftIds = {'shift_1', 'shift_2'};

  @override
  void initState() {
    super.initState();
    _selectedDayIndex = (_today.weekday - 1).clamp(0, 6);
  }

  DateTime _getMonday(DateTime date) {
    return DateTime(date.year, date.month, date.day).subtract(Duration(days: date.weekday - 1));
  }

  String _getWeekTitle(int offset) {
    if (offset == 0) return 'Tuần này';
    if (offset == -1) return 'Tuần trước';
    if (offset == 1) return 'Tuần sau';
    if (offset < -1) return '${offset.abs()} tuần trước';
    return '$offset tuần sau';
  }

  String _getWeekRange(int offset) {
    final monday = _thisWeekMonday.add(Duration(days: offset * 7));
    final sunday = monday.add(const Duration(days: 6));
    final monStr = '${monday.day.toString().padLeft(2, '0')}/${monday.month.toString().padLeft(2, '0')}';
    final sunStr = '${sunday.day.toString().padLeft(2, '0')}/${sunday.month.toString().padLeft(2, '0')}';
    return '$monStr - $sunStr';
  }

  List<GeneralDayModel> _getGeneralWeekData(int offset) {
    final monday = _thisWeekMonday.add(Duration(days: offset * 7));
    final List<String> dayShortNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

    return List.generate(7, (i) {
      final dayDate = monday.add(Duration(days: i));
      final isToday = dayDate.year == _today.year && dayDate.month == _today.month && dayDate.day == _today.day;
      final isPast = dayDate.isBefore(_today);
      final dateStr = '${dayDate.day.toString().padLeft(2, '0')}/${dayDate.month.toString().padLeft(2, '0')}';

      return GeneralDayModel(
        dayOfWeek: dayShortNames[i],
        date: dateStr,
        isToday: isToday,
        shifts: [
          GeneralShiftModel(
            id: 'shift_w${offset}_d${i}_1',
            shiftName: 'Ca Sáng (Mở cửa)',
            startTime: '07:00',
            endTime: '12:00',
            status: isPast ? 'completed' : (isToday ? 'in_progress' : 'upcoming'),
            staffList: [
              StaffInShift(
                name: 'Trần Minh Tuấn',
                role: 'Admin',
                checkInStatus: isPast || isToday ? 'checked_in' : 'not_yet',
                checkInTime: '06:50',
                phone: '0901 111 222',
              ),
              StaffInShift(
                name: 'Nguyễn Văn A',
                role: 'Phục vụ bàn',
                checkInStatus: isPast || isToday ? 'checked_in' : 'not_yet',
                checkInTime: '06:55',
                phone: '0902 333 444',
              ),
              StaffInShift(
                name: 'Lê Thị B',
                role: 'Barista',
                checkInStatus: isPast || isToday ? 'checked_in' : 'not_yet',
                checkInTime: '06:52',
                phone: '0903 555 666',
              ),
            ],
          ),
          GeneralShiftModel(
            id: 'shift_w${offset}_d${i}_2',
            shiftName: 'Ca Chiều',
            startTime: '12:00',
            endTime: '17:30',
            status: isPast ? 'completed' : (isToday ? 'in_progress' : 'upcoming'),
            staffList: [
              StaffInShift(
                name: 'Phạm Thị D',
                role: 'Phục vụ bàn',
                checkInStatus: isPast ? 'checked_in' : (isToday ? 'in_progress' : 'not_yet'),
                checkInTime: '11:55',
                phone: '0905 123 456',
              ),
              StaffInShift(
                name: 'Đặng Văn E',
                role: 'Barista',
                checkInStatus: isPast ? 'checked_in' : (isToday ? 'in_progress' : 'not_yet'),
                checkInTime: '11:50',
                phone: '0906 234 567',
              ),
              StaffInShift(
                name: 'Hoàng Văn C',
                role: 'Thu ngân',
                checkInStatus: isPast ? 'checked_in' : (isToday ? 'in_progress' : 'not_yet'),
                checkInTime: '11:52',
                phone: '0904 777 888',
              ),
            ],
          ),
          GeneralShiftModel(
            id: 'shift_w${offset}_d${i}_3',
            shiftName: 'Ca Tối (Đóng cửa)',
            startTime: '17:30',
            endTime: '23:00',
            status: isPast ? 'completed' : 'upcoming',
            staffList: [
              StaffInShift(
                name: 'Trần Minh Tuấn',
                role: 'Admin',
                checkInStatus: isPast ? 'checked_in' : 'not_yet',
                checkInTime: '17:20',
                phone: '0901 111 222',
              ),
              StaffInShift(
                name: 'Bùi Văn G',
                role: 'Pha chế',
                checkInStatus: isPast ? 'checked_in' : 'not_yet',
                checkInTime: '17:25',
                phone: '0908 456 789',
              ),
              StaffInShift(
                name: 'Vũ Thị Mai',
                role: 'Phục vụ bàn',
                checkInStatus: isPast ? 'checked_in' : 'not_yet',
                checkInTime: '17:28',
                phone: '0909 567 890',
              ),
            ],
          ),
        ],
      );
    });
  }

  void _changeWeek(int newOffset) {
    setState(() {
      _weekOffset = newOffset;
      if (_weekOffset == 0) {
        _selectedDayIndex = (_today.weekday - 1).clamp(0, 6);
      } else {
        _selectedDayIndex = 0; // Mặc định Thứ 2 cho các tuần khác
      }
    });
  }

  void _toggleShiftExpand(String shiftId) {
    setState(() {
      if (_expandedShiftIds.contains(shiftId)) {
        _expandedShiftIds.remove(shiftId);
      } else {
        _expandedShiftIds.add(shiftId);
      }
    });
  }

  void _callStaff(StaffInShift staff) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('📞 Đang kết nối cuộc gọi tới ${staff.name} (${staff.phone})...'),
        backgroundColor: AppColors.primary,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final weekDays = _getGeneralWeekData(_weekOffset);
    final selectedDay = (_selectedDayIndex >= 0 && _selectedDayIndex < weekDays.length)
        ? weekDays[_selectedDayIndex]
        : (weekDays.isNotEmpty ? weekDays.first : const GeneralDayModel(dayOfWeek: '', date: '', shifts: []));

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Lịch làm việc chung'),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, size: 20, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.today, color: AppColors.primary),
            tooltip: 'Về hôm nay',
            onPressed: () {
              setState(() {
                _weekOffset = 0; // Tuần này
                _selectedDayIndex = (_today.weekday - 1).clamp(0, 6);
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // 1. Thanh chọn các ngày cụ thể trong tuần (Ở trên cùng)
          Container(
            color: Colors.white,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Flexible(
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          const Icon(Icons.storefront, size: 16, color: AppColors.primary),
                          const SizedBox(width: 6),
                          Flexible(
                            child: Text(
                              BranchScope.label(context),
                              overflow: TextOverflow.ellipsis,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    // 2 mũi tên di chuyển qua lại các tuần
                    Container(
                      decoration: BoxDecoration(
                        color: AppColors.background,
                        borderRadius: BorderRadius.circular(8),
                        border: Border.all(color: Colors.grey.shade300),
                      ),
                      child: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          InkWell(
                            onTap: () => _changeWeek(_weekOffset - 1),
                            borderRadius: const BorderRadius.horizontal(left: Radius.circular(7)),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                              child: Icon(
                                Icons.arrow_back_ios_new,
                                size: 12,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 4),
                            child: Text(
                              '${_getWeekTitle(_weekOffset)} (${_getWeekRange(_weekOffset)})',
                              style: const TextStyle(
                                fontSize: 11.5,
                                fontWeight: FontWeight.bold,
                                color: AppColors.textPrimary,
                              ),
                            ),
                          ),
                          InkWell(
                            onTap: () => _changeWeek(_weekOffset + 1),
                            borderRadius: const BorderRadius.horizontal(right: Radius.circular(7)),
                            child: const Padding(
                              padding: EdgeInsets.symmetric(horizontal: 6, vertical: 4),
                              child: Icon(
                                Icons.arrow_forward_ios,
                                size: 12,
                                color: AppColors.primary,
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),

                // Hàng 7 ngày trong tuần
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: List.generate(weekDays.length, (index) {
                    final day = weekDays[index];
                    final isSelected = index == _selectedDayIndex;

                    return GestureDetector(
                      onTap: () {
                        setState(() {
                          _selectedDayIndex = index;
                        });
                      },
                      child: AnimatedContainer(
                        duration: const Duration(milliseconds: 200),
                        width: 44,
                        padding: const EdgeInsets.symmetric(vertical: 8),
                        decoration: BoxDecoration(
                          color: isSelected
                              ? AppColors.primary
                              : (day.isToday ? AppColors.primary.withValues(alpha: 0.12) : AppColors.background),
                          borderRadius: BorderRadius.circular(12),
                          border: Border.all(
                            color: isSelected
                                ? AppColors.primary
                                : (day.isToday ? AppColors.primary : Colors.grey.shade200),
                            width: isSelected ? 1.8 : 1,
                          ),
                        ),
                        child: Column(
                          children: [
                            Text(
                              day.dayOfWeek,
                              style: TextStyle(
                                fontSize: 11,
                                fontWeight: isSelected ? FontWeight.bold : FontWeight.w600,
                                color: isSelected
                                    ? Colors.white
                                    : (day.isToday ? AppColors.primary : AppColors.textSecondary),
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              day.date.split('/')[0],
                              style: TextStyle(
                                fontSize: 14,
                                fontWeight: FontWeight.bold,
                                color: isSelected ? Colors.white : AppColors.textPrimary,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Container(
                              width: 5,
                              height: 5,
                              decoration: BoxDecoration(
                                shape: BoxShape.circle,
                                color: isSelected
                                    ? Colors.white
                                    : (day.isToday ? AppColors.primary : Colors.grey.shade400),
                              ),
                            ),
                          ],
                        ),
                      ),
                    );
                  }),
                ),
              ],
            ),
          ),
          const Divider(height: 1),

          // 2. Tiêu đề ngày được chọn & danh sách ca làm
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(16.0),
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Row(
                      children: [
                        Text(
                          '${selectedDay.dayOfWeek}, Ngày ${selectedDay.date}/2026',
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.textPrimary,
                          ),
                        ),
                        if (selectedDay.isToday) ...[
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: AppColors.primary.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(10),
                            ),
                            child: const Text(
                              'Hôm nay',
                              style: TextStyle(color: AppColors.primary, fontSize: 11, fontWeight: FontWeight.bold),
                            ),
                          ),
                        ],
                      ],
                    ),
                    Text(
                      '${selectedDay.shifts.length} ca làm',
                      style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, fontWeight: FontWeight.w600),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                const Text(
                  'Chạm vào từng ca để xem danh sách nhân viên phân công',
                  style: TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
                const SizedBox(height: 12),

                // 3. Danh sách các ca làm việc (Accordion xổ xuống nhân viên)
                ...selectedDay.shifts.map((shift) {
                  final isExpanded = _expandedShiftIds.contains(shift.id);
                  return _buildGeneralShiftAccordion(shift, isExpanded);
                }),
                const SizedBox(height: 20),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildGeneralShiftAccordion(GeneralShiftModel shift, bool isExpanded) {
    Color statusColor;
    String statusText;
    if (shift.status == 'completed') {
      statusColor = AppColors.success;
      statusText = 'Đã hoàn thành';
    } else if (shift.status == 'active') {
      statusColor = AppColors.primary;
      statusText = 'Đang diễn ra';
    } else {
      statusColor = Colors.blue;
      statusText = 'Sắp diễn ra';
    }

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: isExpanded ? AppColors.primary.withValues(alpha: 0.4) : Colors.grey.shade200,
          width: isExpanded ? 1.5 : 1,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // Header Ca làm (Clickable để xổ xuống danh sách nhân viên)
          InkWell(
            onTap: () => _toggleShiftExpand(shift.id),
            borderRadius: BorderRadius.circular(14),
            child: Padding(
              padding: const EdgeInsets.all(14.0),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 20,
                    backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                    child: const Icon(Icons.access_time_filled, color: AppColors.primary, size: 20),
                  ),
                  const SizedBox(width: 12),

                  // Tên ca & Khung giờ
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          shift.shiftName,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary),
                        ),
                        const SizedBox(height: 3),
                        Row(
                          children: [
                            Flexible(
                              child: Text(
                                shift.timeRange,
                                overflow: TextOverflow.ellipsis,
                                style: const TextStyle(fontSize: 12, color: AppColors.textSecondary, fontWeight: FontWeight.w500),
                              ),
                            ),
                            const SizedBox(width: 6),
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 5, vertical: 1),
                              decoration: BoxDecoration(
                                color: statusColor.withValues(alpha: 0.12),
                                borderRadius: BorderRadius.circular(4),
                              ),
                              child: Text(
                                statusText,
                                style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 9.5),
                              ),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ),

                  // Badge số nhân viên
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: AppColors.background,
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: Colors.grey.shade300),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        const Icon(Icons.group, size: 14, color: AppColors.primary),
                        const SizedBox(width: 4),
                        Text(
                          '${shift.staffCount} NV',
                          style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),

                  // Mũi tên xổ xuống
                  Icon(
                    isExpanded ? Icons.keyboard_arrow_up : Icons.keyboard_arrow_down,
                    color: isExpanded ? AppColors.primary : Colors.grey,
                    size: 22,
                  ),
                ],
              ),
            ),
          ),

          // Phần xổ xuống: Danh sách các nhân viên trong ca
          if (isExpanded) ...[
            const Divider(height: 1, color: Color(0xFFF1F5F9)),
            Container(
              width: double.infinity,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              color: const Color(0xFFF8FAFC),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Padding(
                    padding: const EdgeInsets.symmetric(vertical: 4),
                    child: Text(
                      'Nhân viên trong ca (${shift.staffCount} người):',
                      style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.textSecondary),
                    ),
                  ),
                  const SizedBox(height: 4),
                  ...shift.staffList.asMap().entries.map((entry) {
                    final staff = entry.value;
                    return _buildStaffItemTile(staff);
                  }),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildStaffItemTile(StaffInShift staff) {
    Color checkInColor = staff.checkInStatus == 'checked_in'
        ? AppColors.success
        : (staff.checkInStatus == 'in_progress' ? Colors.orange : Colors.grey);

    String checkInLabel = staff.checkInStatus == 'checked_in'
        ? 'Đã vào ca (${staff.checkInTime})'
        : (staff.checkInStatus == 'in_progress' ? 'Đang làm' : 'Chưa điểm danh');

    return Container(
      margin: const EdgeInsets.only(bottom: 6),
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          CircleAvatar(
            radius: 16,
            backgroundColor: AppColors.primary.withValues(alpha: 0.1),
            child: Text(
              staff.name.split(' ').last.substring(0, 1),
              style: const TextStyle(fontWeight: FontWeight.bold, color: AppColors.primary, fontSize: 13),
            ),
          ),
          const SizedBox(width: 10),

          // Tên & Vị trí
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  staff.name,
                  style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 2),
                Text(
                  staff.role,
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),

          // Trạng thái điểm danh
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Row(
                children: [
                  Container(
                    width: 6,
                    height: 6,
                    decoration: BoxDecoration(shape: BoxShape.circle, color: checkInColor),
                  ),
                  const SizedBox(width: 4),
                  Text(
                    checkInLabel,
                    style: TextStyle(fontSize: 10, fontWeight: FontWeight.w600, color: checkInColor),
                  ),
                ],
              ),
              const SizedBox(height: 4),
              InkWell(
                onTap: () => _callStaff(staff),
                child: const Row(
                  children: [
                    Icon(Icons.phone, size: 12, color: AppColors.primary),
                    SizedBox(width: 3),
                    Text('Gọi', style: TextStyle(fontSize: 10, color: AppColors.primary, fontWeight: FontWeight.bold)),
                  ],
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
