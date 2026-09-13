import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/branch_selector.dart';

class ShiftOrder {
  final String id;
  final String table;
  final String openedAt;
  final int itemCount;
  final int total;
  final String status;
  final String? paymentMethod;

  const ShiftOrder({
    required this.id,
    required this.table,
    required this.openedAt,
    required this.itemCount,
    required this.total,
    required this.status,
    this.paymentMethod,
  });
}

class ShiftPaymentStat {
  final String method;
  final int count;
  final int revenue;

  const ShiftPaymentStat({
    required this.method,
    required this.count,
    required this.revenue,
  });
}

class Shift {
  final String id;
  final String openedAt;
  final String? closedAt;
  final int initialCash;
  final int cashRevenue;
  final int qrRevenue;
  final int orderCount;
  final int itemCount;
  final int expectedCash;
  final int? actualCash;
  final int? difference;
  final String status;
  final List<ShiftOrder> orders;
  final List<ShiftPaymentStat> paymentStats;

  const Shift({
    required this.id,
    required this.openedAt,
    this.closedAt,
    required this.initialCash,
    required this.cashRevenue,
    required this.qrRevenue,
    required this.orderCount,
    required this.itemCount,
    required this.expectedCash,
    this.actualCash,
    this.difference,
    required this.status,
    this.orders = const [],
    this.paymentStats = const [],
  });

  int get totalRevenue => cashRevenue + qrRevenue;
}

const Shift kCurrentShift = Shift(
  id: 'day-0817',
  openedAt: '17/08/2026 07:00',
  initialCash: 2000000,
  cashRevenue: 8240000,
  qrRevenue: 6180000,
  orderCount: 52,
  itemCount: 186,
  expectedCash: 10240000,
  status: 'đang mở',
  paymentStats: [
    ShiftPaymentStat(method: 'Tiền mặt', count: 31, revenue: 8240000),
    ShiftPaymentStat(method: 'VietQR (SePay)', count: 21, revenue: 6180000),
  ],
);

const List<Shift> kShiftHistory = [
  Shift(
    id: 'day-0816',
    openedAt: '16/08/2026 07:00',
    closedAt: '16/08/2026 22:40',
    initialCash: 2000000,
    cashRevenue: 21500000,
    qrRevenue: 17100000,
    orderCount: 135,
    itemCount: 492,
    expectedCash: 23500000,
    actualCash: 23480000,
    difference: -20000,
    status: 'đã kết ca',
    orders: [
      ShiftOrder(id: 'ORD-0816-01', table: 'Bàn A2', openedAt: '08:15', itemCount: 4, total: 320000, status: 'đã thanh toán', paymentMethod: 'Tiền mặt'),
      ShiftOrder(id: 'ORD-0816-02', table: 'Bàn B1', openedAt: '09:30', itemCount: 6, total: 540000, status: 'đã thanh toán', paymentMethod: 'VietQR (SePay)'),
      ShiftOrder(id: 'ORD-0816-05', table: 'Bàn C2', openedAt: '17:40', itemCount: 8, total: 780000, status: 'đã thanh toán', paymentMethod: 'VietQR (SePay)'),
      ShiftOrder(id: 'ORD-0816-07', table: 'Bàn A1', openedAt: '19:30', itemCount: 6, total: 590000, status: 'đã thanh toán', paymentMethod: 'Tiền mặt'),
    ],
    paymentStats: [
      ShiftPaymentStat(method: 'Tiền mặt', count: 82, revenue: 21500000),
      ShiftPaymentStat(method: 'VietQR (SePay)', count: 53, revenue: 17100000),
    ],
  ),
  Shift(
    id: 'day-0815',
    openedAt: '15/08/2026 07:00',
    closedAt: '15/08/2026 14:20',
    initialCash: 2000000,
    cashRevenue: 8600000,
    qrRevenue: 6900000,
    orderCount: 55,
    itemCount: 198,
    expectedCash: 10600000,
    actualCash: 10650000,
    difference: 50000,
    status: 'đã kết ca',
    orders: [
      ShiftOrder(id: 'ORD-0815-01', table: 'Bàn A3', openedAt: '08:45', itemCount: 5, total: 450000, status: 'đã thanh toán', paymentMethod: 'Tiền mặt'),
      ShiftOrder(id: 'ORD-0815-02', table: 'Bàn B4', openedAt: '10:20', itemCount: 4, total: 380000, status: 'đã thanh toán', paymentMethod: 'VietQR (SePay)'),
    ],
    paymentStats: [
      ShiftPaymentStat(method: 'Tiền mặt', count: 33, revenue: 8600000),
      ShiftPaymentStat(method: 'VietQR (SePay)', count: 22, revenue: 6900000),
    ],
  ),
];

const List<ShiftOrder> kTodayOrders = [
  ShiftOrder(id: 'ORD-0001', table: 'Bàn A5', openedAt: '10:12', itemCount: 5, total: 380000, status: 'chưa thanh toán'),
  ShiftOrder(id: 'ORD-0002', table: 'Mang về', openedAt: '10:25', itemCount: 3, total: 210000, status: 'chưa thanh toán'),
  ShiftOrder(id: 'ORD-0003', table: 'Bàn B2', openedAt: '09:40', itemCount: 4, total: 460000, status: 'đã thanh toán', paymentMethod: 'VietQR (SePay)'),
  ShiftOrder(id: 'ORD-0004', table: 'Bàn C1', openedAt: '09:12', itemCount: 3, total: 320000, status: 'đã thanh toán', paymentMethod: 'Tiền mặt'),
];

class RevenueScreen extends StatefulWidget {
  final bool embedded;
  final VoidCallback? onReturnHome;

  const RevenueScreen({
    super.key,
    this.embedded = false,
    this.onReturnHome,
  });

  @override
  State<RevenueScreen> createState() => _RevenueScreenState();
}

class _RevenueScreenState extends State<RevenueScreen> {
  String? _selectedShiftId;

  Shift get _currentShift =>
      _selectedShiftId == null
          ? kCurrentShift
          : kShiftHistory.firstWhere((s) => s.id == _selectedShiftId);

  List<ShiftOrder> get _orders {
    final shift = _currentShift;
    if (shift.id == kCurrentShift.id) return kTodayOrders;
    return shift.orders;
  }

  String _formatCurrency(int amount) {
    final str = amount.toString();
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

  String _shiftLabel(Shift shift) {
    final parts = shift.openedAt.split(' ');
    final date = parts.isNotEmpty ? parts[0] : '';
    final time = parts.length > 1 ? parts[1].substring(0, 5) : '';
    return 'Ngày $date ($time)';
  }

  @override
  Widget build(BuildContext context) {
    final Shift shift = _currentShift;
    final bool isOpen = shift.status == 'đang mở';

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: widget.embedded
          ? null
          : AppBar(
              title: const Text('Doanh thu'),
              centerTitle: true,
              elevation: 0,
              backgroundColor: Colors.white,
              leading: widget.onReturnHome != null
                  ? IconButton(
                      icon: const Icon(Icons.arrow_back_ios_new, size: 20),
                      tooltip: 'Về trang chủ',
                      onPressed: widget.onReturnHome,
                    )
                  : null,
              actions: const [
                BranchSelector(includeAll: true),
              ],
            ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(
              height: 42,
              child: ListView(
                scrollDirection: Axis.horizontal,
                children: [
                  _buildShiftChip('Hôm nay (đang mở)', _selectedShiftId == null),
                  const SizedBox(width: 8),
                  for (final s in kShiftHistory)
                    Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: _buildShiftChip(_shiftLabel(s), _selectedShiftId == s.id, shift: s),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            _buildTotalCard(shift, isOpen),
            const SizedBox(height: 16),
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              crossAxisSpacing: 10,
              mainAxisSpacing: 10,
              childAspectRatio: 2.2,
              children: [
                _buildInfoTile('Mở ca', shift.openedAt),
                _buildInfoTile('Kết ca', shift.closedAt ?? 'Đang mở'),
                _buildInfoTile('Tiền két ban đầu', _formatCurrency(shift.initialCash)),
                _buildInfoTile('Tổng số đơn', '${shift.orderCount} đơn'),
                _buildInfoTile('Doanh thu tiền mặt', _formatCurrency(shift.cashRevenue), highlight: true),
                _buildInfoTile('Doanh thu VietQR', _formatCurrency(shift.qrRevenue), highlight: true),
                _buildInfoTile('Tổng số món', '${shift.itemCount} món'),
                _buildInfoTile('Tiền két dự kiến', _formatCurrency(shift.expectedCash)),
              ],
            ),
            const SizedBox(height: 20),
            _buildSectionHeader('Thống kê theo phương thức thanh toán'),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade100),
              ),
              child: Column(
                children: [
                  for (final stat in shift.paymentStats)
                    Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                      child: Row(
                        children: [
                          Container(
                            width: 10,
                            height: 10,
                            decoration: BoxDecoration(
                              color: stat.method.contains('Tiền mặt') ? Colors.green : Colors.indigo,
                              shape: BoxShape.circle,
                            ),
                          ),
                          const SizedBox(width: 8),
                          Expanded(
                            child: Text(
                              stat.method,
                              style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w500),
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.grey.shade100,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              '${stat.count} đơn',
                              style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600),
                            ),
                          ),
                          const SizedBox(width: 8),
                          Text(
                            _formatCurrency(stat.revenue),
                            style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                          ),
                        ],
                      ),
                    ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _buildSectionHeader('Danh sách đơn trong ngày (${_orders.length})'),
            const SizedBox(height: 10),
            Container(
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: Colors.grey.shade100),
              ),
              child: _orders.isEmpty
                  ? Padding(
                      padding: const EdgeInsets.all(24),
                      child: Center(
                        child: Text(
                          isOpen ? 'Chưa có đơn trong ngày này' : 'Ngày này không có đơn',
                          style: const TextStyle(color: AppColors.textSecondary, fontSize: 13),
                        ),
                      ),
                    )
                  : Column(
                      children: [
                        for (final order in _orders)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                            child: Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                  decoration: BoxDecoration(
                                    color: Colors.grey.shade100,
                                    borderRadius: BorderRadius.circular(6),
                                  ),
                                  child: Text(
                                    order.table,
                                    style: const TextStyle(fontSize: 11, fontWeight: FontWeight.bold),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        order.id,
                                        style: const TextStyle(fontSize: 13, fontWeight: FontWeight.w600),
                                      ),
                                      const SizedBox(height: 2),
                                      Text(
                                        '${order.openedAt} · ${order.itemCount} món${order.paymentMethod != null ? ' · ${order.paymentMethod}' : ''}',
                                        style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                                      ),
                                    ],
                                  ),
                                ),
                                Text(
                                  _formatCurrency(order.total),
                                  style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold),
                                ),
                              ],
                            ),
                          ),
                      ],
                    ),
            ),
const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _buildShiftChip(String label, bool selected, {Shift? shift}) {
    return GestureDetector(
      onTap: () {
        setState(() {
          _selectedShiftId = shift?.id;
        });
      },
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        alignment: Alignment.center,
        decoration: BoxDecoration(
          color: selected ? AppColors.primary : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: selected ? AppColors.primary : Colors.grey.shade300,
          ),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.bold,
            color: selected ? Colors.white : AppColors.textSecondary,
          ),
        ),
      ),
    );
  }

  Widget _buildTotalCard(Shift shift, bool isOpen) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          colors: [Color(0xFFFF7A00), Color(0xFFFF4800)],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: AppColors.primary.withValues(alpha: 0.3),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                _selectedShiftId == null ? 'Hôm nay' : 'Ngày đã kết ca',
                style: const TextStyle(
                  color: Colors.white70,
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                  letterSpacing: 1,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: isOpen
                      ? Colors.white.withValues(alpha: 0.25)
                      : Colors.white.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  isOpen ? 'Đang mở' : 'Đã kết ca',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(
            _formatCurrency(shift.totalRevenue),
            style: const TextStyle(
              color: Colors.white,
              fontSize: 28,
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            'Doanh thu ca (tiền mặt + VietQR)',
            style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoTile(String label, String value, {bool highlight = false}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
      decoration: BoxDecoration(
        color: highlight ? AppColors.primary.withValues(alpha: 0.06) : Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: highlight ? AppColors.primary.withValues(alpha: 0.3) : Colors.grey.shade100,
        ),
      ),
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: const TextStyle(
              fontSize: 11,
              color: AppColors.textSecondary,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 3),
          Text(
            value,
            maxLines: 1,
            overflow: TextOverflow.ellipsis,
            style: TextStyle(
              fontSize: 13,
              fontWeight: FontWeight.bold,
              color: highlight ? AppColors.primary : AppColors.textPrimary,
            ),
          ),
        ],
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
}