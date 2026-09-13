import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/branch_selector.dart';

// ─── Models ──────────────────────────────────────────────────────────────────

enum ShiftRequestType { swap, coverMe, dayOff }
enum ShiftRequestStatus { pending, approved, rejected }

class ShiftRequest {
  final String id;
  final String staffName;
  final String staffRole;
  final String staffAvatar;
  final ShiftRequestType type;
  final String currentShift;
  final String? targetShift;
  final String? swapWithName;
  final String reason;
  final String submittedAt;
  ShiftRequestStatus status;

  ShiftRequest({
    required this.id,
    required this.staffName,
    required this.staffRole,
    required this.staffAvatar,
    required this.type,
    required this.currentShift,
    this.targetShift,
    this.swapWithName,
    required this.reason,
    required this.submittedAt,
    this.status = ShiftRequestStatus.pending,
  });
}

// ─── Screen ──────────────────────────────────────────────────────────────────

class ShiftRequestScreen extends StatefulWidget {
  const ShiftRequestScreen({super.key});

  @override
  State<ShiftRequestScreen> createState() => _ShiftRequestScreenState();
}

class _ShiftRequestScreenState extends State<ShiftRequestScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  late List<ShiftRequest> _requests;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this, initialIndex: 0);
    _requests = [
      ShiftRequest(
        id: '1',
        staffName: 'Trần Thị Lan',
        staffRole: 'Barista',
        staffAvatar: 'L',
        type: ShiftRequestType.swap,
        currentShift: 'Ca Chiều T5, 21/08 (12:00 - 17:30)',
        targetShift: 'Ca Sáng T6, 22/08 (07:00 - 12:00)',
        swapWithName: 'Nguyễn Minh Tuấn',
        reason: 'Có việc gia đình chiều thứ 5, đã thỏa thuận với anh Tuấn.',
        submittedAt: 'Hôm nay, 08:15',
        status: ShiftRequestStatus.pending,
      ),
      ShiftRequest(
        id: '2',
        staffName: 'Lê Văn Hùng',
        staffRole: 'Thu ngân',
        staffAvatar: 'H',
        type: ShiftRequestType.dayOff,
        currentShift: 'Ca Sáng T6, 22/08 (07:00 - 12:00)',
        reason: 'Đi khám bệnh định kỳ. Đã sắp xếp người thay.',
        submittedAt: 'Hôm qua, 22:30',
        status: ShiftRequestStatus.pending,
      ),
      ShiftRequest(
        id: '3',
        staffName: 'Phạm Thị Ngọc',
        staffRole: 'Phục vụ',
        staffAvatar: 'N',
        type: ShiftRequestType.coverMe,
        currentShift: 'Ca Tối T4, 20/08 (17:30 - 23:00)',
        reason: 'Nhờ người làm thay vì bị ốm đột xuất.',
        submittedAt: 'Hôm nay, 06:00',
        status: ShiftRequestStatus.pending,
      ),
      ShiftRequest(
        id: '4',
        staffName: 'Hoàng Văn Bình',
        staffRole: 'Barista',
        staffAvatar: 'B',
        type: ShiftRequestType.swap,
        currentShift: 'Ca Sáng T3, 19/08 (07:00 - 12:00)',
        targetShift: 'Ca Chiều T3, 19/08 (12:00 - 17:30)',
        swapWithName: 'Trần Thị Lan',
        reason: 'Đổi ca sáng - chiều theo thỏa thuận nhóm.',
        submittedAt: '19/08, 21:00',
        status: ShiftRequestStatus.approved,
      ),
      ShiftRequest(
        id: '5',
        staffName: 'Nguyễn Thị Mai',
        staffRole: 'Phục vụ',
        staffAvatar: 'M',
        type: ShiftRequestType.dayOff,
        currentShift: 'Ca Chiều T2, 18/08 (12:00 - 17:30)',
        reason: 'Lý do cá nhân không thể trình bày chi tiết.',
        submittedAt: '17/08, 20:15',
        status: ShiftRequestStatus.rejected,
      ),
    ];
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  List<ShiftRequest> get _pendingRequests =>
      _requests.where((r) => r.status == ShiftRequestStatus.pending).toList();
  List<ShiftRequest> get _approvedRequests =>
      _requests.where((r) => r.status == ShiftRequestStatus.approved).toList();
  List<ShiftRequest> get _rejectedRequests =>
      _requests.where((r) => r.status == ShiftRequestStatus.rejected).toList();

  void _approve(ShiftRequest request) {
    setState(() => request.status = ShiftRequestStatus.approved);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: Colors.green,
        content: Text('✅ Đã duyệt yêu cầu của ${request.staffName}'),
      ),
    );
  }

  void _reject(ShiftRequest request) {
    setState(() => request.status = ShiftRequestStatus.rejected);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppColors.error,
        content: Text('❌ Đã từ chối yêu cầu của ${request.staffName}'),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Duyệt yêu cầu chung'),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        leading: const BackButton(),
        actions: const [
          BranchSelector(includeAll: false),
        ],
      ),
      body: Column(
        children: [
          Container(
            color: Colors.white,
            child: TabBar(
              controller: _tabController,
              labelColor: AppColors.primary,
              unselectedLabelColor: AppColors.textSecondary,
              indicatorColor: AppColors.primary,
              indicatorWeight: 2.5,
              labelStyle: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
              tabs: [
                Tab(text: 'Chờ duyệt (${_pendingRequests.length})'),
                Tab(text: 'Đã duyệt (${_approvedRequests.length})'),
                Tab(text: 'Từ chối (${_rejectedRequests.length})'),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: [
                _buildRequestList(_pendingRequests, showActions: true),
                _buildRequestList(_approvedRequests, showActions: false),
                _buildRequestList(_rejectedRequests, showActions: false),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildRequestList(List<ShiftRequest> requests, {required bool showActions}) {
    if (requests.isEmpty) {
      return const Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.inbox_outlined, size: 52, color: AppColors.textSecondary),
            SizedBox(height: 10),
            Text('Không có yêu cầu nào', style: TextStyle(color: AppColors.textSecondary, fontSize: 14)),
          ],
        ),
      );
    }
    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: requests.length,
      separatorBuilder: (_, __) => const SizedBox(height: 12),
      itemBuilder: (context, index) => _buildRequestCard(requests[index], showActions: showActions),
    );
  }

  Widget _buildRequestCard(ShiftRequest request, {required bool showActions}) {
    Color typeColor;
    String typeLabel;
    IconData typeIcon;

    switch (request.type) {
      case ShiftRequestType.swap:
        typeColor = Colors.blue;
        typeLabel = 'Đổi ca';
        typeIcon = Icons.swap_horiz;
        break;
      case ShiftRequestType.coverMe:
        typeColor = Colors.purple;
        typeLabel = 'Nhờ làm thay';
        typeIcon = Icons.people_alt_outlined;
        break;
      case ShiftRequestType.dayOff:
        typeColor = Colors.orange;
        typeLabel = 'Xin nghỉ';
        typeIcon = Icons.event_busy;
        break;
    }

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.05),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 10),
            decoration: BoxDecoration(
              color: typeColor.withValues(alpha: 0.06),
              borderRadius: const BorderRadius.vertical(top: Radius.circular(14)),
            ),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: AppColors.primary.withValues(alpha: 0.12),
                  child: Text(request.staffAvatar,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.primary)),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(request.staffName,
                          style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14, color: AppColors.textPrimary)),
                      Text(request.staffRole,
                          style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
                    ],
                  ),
                ),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                  decoration: BoxDecoration(
                    color: typeColor.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Icon(typeIcon, size: 12, color: typeColor),
                      const SizedBox(width: 4),
                      Text(typeLabel, style: TextStyle(fontSize: 11, color: typeColor, fontWeight: FontWeight.bold)),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // Details
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 10, 14, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildDetailRow(Icons.event_note, 'Ca hiện tại', request.currentShift),
                if (request.targetShift != null)
                  _buildDetailRow(Icons.compare_arrows, 'Đổi sang ca', request.targetShift!),
                if (request.swapWithName != null)
                  _buildDetailRow(Icons.person, 'Đổi với', request.swapWithName!),
                _buildDetailRow(Icons.chat_bubble_outline, 'Lý do', request.reason),
                const SizedBox(height: 4),
                Text(
                  '🕐 Gửi lúc: ${request.submittedAt}',
                  style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                ),
              ],
            ),
          ),

          // Action buttons (only for pending)
          if (showActions) ...[
            const Divider(height: 20, thickness: 1),
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Row(
                children: [
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => _reject(request),
                      icon: const Icon(Icons.close, size: 16),
                      label: const Text('Từ chối'),
                      style: OutlinedButton.styleFrom(
                        foregroundColor: AppColors.error,
                        side: const BorderSide(color: AppColors.error),
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: ElevatedButton.icon(
                      onPressed: () => _approve(request),
                      icon: const Icon(Icons.check, size: 16),
                      label: const Text('Phê duyệt'),
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.green,
                        foregroundColor: Colors.white,
                        elevation: 0,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ] else ...[
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 6, 14, 14),
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
                decoration: BoxDecoration(
                  color: (request.status == ShiftRequestStatus.approved ? Colors.green : AppColors.error)
                      .withValues(alpha: 0.08),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Icon(
                      request.status == ShiftRequestStatus.approved ? Icons.check_circle : Icons.cancel,
                      size: 14,
                      color: request.status == ShiftRequestStatus.approved ? Colors.green : AppColors.error,
                    ),
                    const SizedBox(width: 5),
                    Text(
                      request.status == ShiftRequestStatus.approved ? 'Đã phê duyệt' : 'Đã từ chối',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: request.status == ShiftRequestStatus.approved ? Colors.green : AppColors.error,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildDetailRow(IconData icon, String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Icon(icon, size: 14, color: AppColors.textSecondary),
          const SizedBox(width: 6),
          Text('$label: ', style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          Expanded(
            child: Text(value, style: const TextStyle(fontSize: 12, color: AppColors.textPrimary, fontWeight: FontWeight.w500)),
          ),
        ],
      ),
    );
  }
}
