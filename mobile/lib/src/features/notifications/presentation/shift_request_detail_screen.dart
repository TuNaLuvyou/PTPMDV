import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/app_colors.dart';

enum ShiftRequestStatus { pending, accepted, rejected }

class ShiftRequestDetailScreen extends StatefulWidget {
  final String requestId;
  final String title;
  final String senderName;
  final String senderRole;
  final String senderPhone;
  final String requestType; // 'cover' (Nhờ làm thay) hoặc 'swap' (Đổi ca)
  final String requestTime;

  // Ca của đồng nghiệp
  final String shiftName;
  final String shiftTime;
  final String shiftHours;
  final String shiftDate;
  final String branch;
  final String shiftRole;

  // Ca của bạn (dành cho swap)
  final String? swapShiftName;
  final String? swapShiftTime;
  final String? swapShiftHours;
  final String? swapShiftDate;
  final String? swapShiftBranch;
  final String? swapShiftRole;

  final String reason;
  final ShiftRequestStatus initialStatus;
  final Function(ShiftRequestStatus newStatus)? onStatusChanged;

  const ShiftRequestDetailScreen({
    super.key,
    required this.requestId,
    required this.title,
    required this.senderName,
    required this.senderRole,
    this.senderPhone = '0912.345.678',
    this.requestType = 'cover',
    this.requestTime = '25 phút trước (10:45)',
    required this.shiftName,
    required this.shiftTime,
    this.shiftHours = '5.0 giờ',
    required this.shiftDate,
    required this.branch,
    this.shiftRole = 'Thu ngân',
    this.swapShiftName,
    this.swapShiftTime,
    this.swapShiftHours = '5.0 giờ',
    this.swapShiftDate,
    this.swapShiftBranch,
    this.swapShiftRole = 'Phục vụ',
    required this.reason,
    this.initialStatus = ShiftRequestStatus.pending,
    this.onStatusChanged,
  });

  @override
  State<ShiftRequestDetailScreen> createState() => _ShiftRequestDetailScreenState();
}

class _ShiftRequestDetailScreenState extends State<ShiftRequestDetailScreen> {
  late ShiftRequestStatus _status;

  @override
  void initState() {
    super.initState();
    _status = widget.initialStatus;
  }

  void _handleResponse(ShiftRequestStatus newStatus) {
    setState(() => _status = newStatus);
    if (widget.onStatusChanged != null) {
      widget.onStatusChanged!(newStatus);
    }

    final isAccept = newStatus == ShiftRequestStatus.accepted;
    final message = isAccept
        ? (widget.requestType == 'cover'
            ? '✅ Bạn đã đồng ý nhận làm thay ca cho ${widget.senderName}!'
            : '✅ Bạn đã đồng ý đổi ca với ${widget.senderName}!')
        : '❌ Bạn đã từ chối yêu cầu từ ${widget.senderName}.';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: isAccept ? AppColors.success : AppColors.error,
        content: Text(message),
        duration: const Duration(seconds: 3),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final bool isCover = widget.requestType == 'cover';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: Text(
          isCover ? 'Chi tiết nhờ làm thay' : 'Chi tiết yêu cầu đổi ca',
          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 18),
        ),
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.chevronLeft, size: 20, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context, _status),
          tooltip: 'Quay lại',
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── 1. Thẻ trạng thái nổi bật ─────────────────────────────
            _buildStatusHeader(),
            const SizedBox(height: 16),

            // ── 2. Thông tin người gửi ────────────────────────────────
            _buildSenderCard(),
            const SizedBox(height: 16),

            // ── 3. Chi tiết đối soát 2 ca (Đầy đủ & Chi tiết đều cả 2 ca)
            if (isCover)
              _buildSingleCoverShiftCard()
            else
              _buildSwapComparisonSection(),

            const SizedBox(height: 16),

            // ── 4. Lời nhắn & Lý do ───────────────────────────────────
            _buildReasonCard(),
            const SizedBox(height: 16),
          ],
        ),
      ),
      bottomNavigationBar: _buildBottomActionBar(isCover),
    );
  }

  // ── 1. Thẻ trạng thái ──────────────────────────────────────────────────
  Widget _buildStatusHeader() {
    Color bg;
    Color borderCol;
    Color textCol;
    FaIconData icon;
    String title;
    String sub;

    switch (_status) {
      case ShiftRequestStatus.pending:
        bg = const Color(0xFFFFFBEB);
        borderCol = Colors.amber.shade300;
        textCol = Colors.amber.shade900;
        icon = FontAwesomeIcons.hourglassHalf;
        title = 'Chờ bạn phản hồi yêu cầu';
        sub = widget.requestType == 'cover'
            ? 'Đồng nghiệp đang cần người nhận làm thay ca. Vui lòng kiểm tra chi tiết.'
            : 'Vui lòng kiểm tra kỹ chi tiết 2 ca làm việc đối soát trước khi quyết định.';
        break;
      case ShiftRequestStatus.accepted:
        bg = const Color(0xFFF0FDF4);
        borderCol = Colors.green.shade300;
        textCol = Colors.green.shade900;
        icon = FontAwesomeIcons.circleCheck;
        title = 'Bạn đã đồng ý yêu cầu';
        sub = 'Lịch làm việc sẽ được cập nhật tương ứng vào lịch làm việc của bạn.';
        break;
      case ShiftRequestStatus.rejected:
        bg = const Color(0xFFFEF2F2);
        borderCol = Colors.red.shade300;
        textCol = Colors.red.shade900;
        icon = FontAwesomeIcons.circleXmark;
        title = 'Bạn đã từ chối yêu cầu';
        sub = 'Đồng nghiệp đã được thông báo về quyết định từ chối của bạn.';
        break;
    }

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderCol, width: 1.2),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          FaIcon(icon, color: textCol, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(color: textCol, fontWeight: FontWeight.bold, fontSize: 14.5),
                ),
                const SizedBox(height: 3),
                Text(
                  sub,
                  style: TextStyle(color: textCol.withValues(alpha: 0.85), fontSize: 12.5, height: 1.3),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── 2. Thông tin người gửi ─────────────────────────────────────────────
  Widget _buildSenderCard() {
    return Container(
      padding: const EdgeInsets.all(16),
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
        children: [
          Stack(
            children: [
              CircleAvatar(
                radius: 26,
                backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                child: Text(
                  widget.senderName.isNotEmpty ? widget.senderName.substring(0, 1) : 'U',
                  style: const TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 20),
                ),
              ),
              Positioned(
                bottom: 0,
                right: 0,
                child: Container(
                  padding: const EdgeInsets.all(2),
                  decoration: const BoxDecoration(color: Colors.white, shape: BoxShape.circle),
                  child: const FaIcon(FontAwesomeIcons.star, color: Colors.amber, size: 14),
                ),
              ),
            ],
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Expanded(
                      child: Text(
                        widget.senderName,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: AppColors.textPrimary),
                      ),
                    ),
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                      decoration: BoxDecoration(
                        color: AppColors.primary.withValues(alpha: 0.08),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        widget.senderRole,
                        style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: AppColors.primary),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 4),
                Text(
                  '📞 SĐT: ${widget.senderPhone} • Gửi: ${widget.requestTime}',
                  style: const TextStyle(fontSize: 12, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  // ── 3A. Thẻ chi tiết khi là Đổi Ca (So sánh 2 ca đầy đủ 100%) ───────────
  Widget _buildSwapComparisonSection() {
    final myShiftName = widget.swapShiftName ?? 'Ca Tối (17:00 - 22:00)';
    final myShiftDate = widget.swapShiftDate ?? 'Thứ Sáu, 21/08/2026';
    final myShiftTime = widget.swapShiftTime ?? '17:00 - 22:00';
    final myShiftHours = widget.swapShiftHours ?? '5.0 giờ';
    final myShiftBranch = widget.swapShiftBranch ?? widget.branch;
    final myShiftRole = widget.swapShiftRole ?? 'Phục vụ';

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 4),
          child: Text(
            'Thông tin đối soát 2 ca làm việc:',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
        ),
        const SizedBox(height: 8),

        // ── Ca 1: Ca của đồng nghiệp (Bạn sẽ nhận)
        _buildDetailedShiftCard(
          badgeText: 'Ca bạn sẽ NHẬN vào',
          badgeBg: Colors.orange.shade50,
          badgeColor: Colors.orange.shade900,
          borderColor: Colors.orange.shade300,
          shiftTitle: widget.shiftName,
          shiftTime: widget.shiftTime,
          shiftHours: widget.shiftHours,
          shiftDate: widget.shiftDate,
          branchName: widget.branch,
          roleName: widget.shiftRole,
          ownerText: '${widget.senderName} (${widget.senderRole})',
          isColleagueShift: true,
        ),

        // ── Icon chuyển đổi 2 chiều ở giữa
        Padding(
          padding: const EdgeInsets.symmetric(vertical: 10),
          child: Center(
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: AppColors.primary.withValues(alpha: 0.3)),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.04),
                    blurRadius: 6,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: const Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  FaIcon(FontAwesomeIcons.arrowsUpDown, color: AppColors.primary, size: 20),
                  SizedBox(width: 6),
                  Text(
                    'ĐỔI LẤY CA CỦA BẠN',
                    style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: AppColors.primary, letterSpacing: 0.5),
                  ),
                ],
              ),
            ),
          ),
        ),

        // ── Ca 2: Ca của bạn (Bạn sẽ nhượng lại)
        _buildDetailedShiftCard(
          badgeText: 'Ca bạn sẽ NHƯỢNG lại',
          badgeBg: Colors.blue.shade50,
          badgeColor: Colors.blue.shade900,
          borderColor: Colors.blue.shade300,
          shiftTitle: myShiftName,
          shiftTime: myShiftTime,
          shiftHours: myShiftHours,
          shiftDate: myShiftDate,
          branchName: myShiftBranch,
          roleName: myShiftRole,
          ownerText: 'Nguyễn Văn A (Bạn)',
          isColleagueShift: false,
        ),
      ],
    );
  }

  // ── 3B. Thẻ chi tiết khi là Nhờ làm thay (Cover) ────────────────────────
  Widget _buildSingleCoverShiftCard() {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Padding(
          padding: EdgeInsets.symmetric(vertical: 4),
          child: Text(
            'Thông tin ca làm việc nhờ nhận:',
            style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
          ),
        ),
        const SizedBox(height: 8),
        _buildDetailedShiftCard(
          badgeText: 'Ca nhờ bạn nhận làm thay',
          badgeBg: Colors.orange.shade50,
          badgeColor: Colors.orange.shade900,
          borderColor: Colors.orange.shade300,
          shiftTitle: widget.shiftName,
          shiftTime: widget.shiftTime,
          shiftHours: widget.shiftHours,
          shiftDate: widget.shiftDate,
          branchName: widget.branch,
          roleName: widget.shiftRole,
          ownerText: '${widget.senderName} (${widget.senderRole})',
          isColleagueShift: true,
        ),
      ],
    );
  }

  // ── Component: Thẻ ca làm việc đầy đủ chi tiết và đồng bộ ───────────────
  Widget _buildDetailedShiftCard({
    required String badgeText,
    required Color badgeBg,
    required Color badgeColor,
    required Color borderColor,
    required String shiftTitle,
    required String shiftTime,
    required String shiftHours,
    required String shiftDate,
    required String branchName,
    required String roleName,
    required String ownerText,
    required bool isColleagueShift,
  }) {
    return Container(
      width: double.infinity,
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: borderColor, width: 1.3),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.03),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header ca
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            decoration: BoxDecoration(
              color: badgeBg,
              borderRadius: const BorderRadius.vertical(top: Radius.circular(15)),
            ),
            child: Row(
              children: [
                FaIcon(
                  isColleagueShift ? FontAwesomeIcons.locationDot : FontAwesomeIcons.circleUser,
                  size: 18,
                  color: badgeColor,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    badgeText,
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: badgeColor),
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(6),
                    border: Border.all(color: badgeColor.withValues(alpha: 0.3)),
                  ),
                  child: Text(
                    shiftHours,
                    style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold, color: badgeColor),
                  ),
                ),
              ],
            ),
          ),

          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Tên ca nổi bật
                Text(
                  shiftTitle,
                  style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
                ),
                const SizedBox(height: 12),
                const Divider(height: 1),
                const SizedBox(height: 12),

                // 4 dòng thông số chi tiết
                _buildInfoLine(FontAwesomeIcons.calendarDay, 'Ngày làm việc', shiftDate),
                const SizedBox(height: 8),
                _buildInfoLine(FontAwesomeIcons.clock, 'Khung giờ ca', shiftTime),
                const SizedBox(height: 8),
                _buildInfoLine(FontAwesomeIcons.store, 'Chi nhánh', branchName),
                const SizedBox(height: 8),
                _buildInfoLine(FontAwesomeIcons.idCard, 'Vị trí công việc', roleName),
                const SizedBox(height: 8),
                _buildInfoLine(
                  FontAwesomeIcons.user,
                  isColleagueShift ? 'Người bàn giao' : 'Người phụ trách',
                  ownerText,
                  highlight: true,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoLine(FaIconData icon, String label, String value, {bool highlight = false}) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        FaIcon(icon, size: 16, color: AppColors.textSecondary),
        const SizedBox(width: 8),
        SizedBox(
          width: 120,
          child: Text(
            label,
            style: const TextStyle(fontSize: 13, color: AppColors.textSecondary),
          ),
        ),
        Expanded(
          child: Text(
            value,
            textAlign: TextAlign.end,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: highlight ? AppColors.primary : AppColors.textPrimary,
            ),
          ),
        ),
      ],
    );
  }

  // ── 4. Thẻ lời nhắn / lý do ───────────────────────────────────────────
  Widget _buildReasonCard() {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
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
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Row(
            children: [
              FaIcon(FontAwesomeIcons.quoteLeft, size: 20, color: AppColors.primary),
              SizedBox(width: 8),
              Text(
                'Lời nhắn & Lý do từ đồng nghiệp',
                style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: AppColors.textPrimary),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(14),
            decoration: BoxDecoration(
              color: AppColors.background,
              borderRadius: BorderRadius.circular(12),
              border: Border.all(color: Colors.grey.shade300),
            ),
            child: Text(
              '"${widget.reason}"',
              style: const TextStyle(fontSize: 13.5, height: 1.45, fontStyle: FontStyle.italic, color: AppColors.textPrimary),
            ),
          ),
        ],
      ),
    );
  }

  // ── 5. Bottom Action Bar cố định đáy màn hình ──────────────────────────
  Widget _buildBottomActionBar(bool isCover) {
    return Container(
      padding: const EdgeInsets.fromLTRB(16, 12, 16, 24),
      decoration: BoxDecoration(
        color: Colors.white,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.08),
            blurRadius: 10,
            offset: const Offset(0, -3),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: _status == ShiftRequestStatus.pending
            ? Row(
                children: [
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: OutlinedButton.icon(
                        onPressed: () => _handleResponse(ShiftRequestStatus.rejected),
                        icon: const FaIcon(FontAwesomeIcons.xmark, size: 20, color: AppColors.error),
                        label: const Text(
                          'Từ chối',
                          style: TextStyle(color: AppColors.error, fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        style: OutlinedButton.styleFrom(
                          side: const BorderSide(color: AppColors.error, width: 1.5),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: SizedBox(
                      height: 50,
                      child: ElevatedButton.icon(
                        onPressed: () => _handleResponse(ShiftRequestStatus.accepted),
                        icon: const FaIcon(FontAwesomeIcons.check, size: 20),
                        label: Text(
                          isCover ? 'Nhận làm thay' : 'Đồng ý đổi ca',
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                        ),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.success,
                          foregroundColor: Colors.white,
                          elevation: 0,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                        ),
                      ),
                    ),
                  ),
                ],
              )
            : SizedBox(
                height: 50,
                width: double.infinity,
                child: OutlinedButton.icon(
                  onPressed: () => Navigator.pop(context, _status),
                  icon: const FaIcon(FontAwesomeIcons.chevronLeft, size: 16),
                  label: const Text('Quay lại danh sách thông báo', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 15)),
                  style: OutlinedButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                ),
              ),
      ),
    );
  }
}
