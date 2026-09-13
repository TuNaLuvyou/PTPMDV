import 'package:flutter/material.dart';
import '../../../core/constants/app_colors.dart';
import '../../../core/widgets/branch_selector.dart';

// ─── Model ───────────────────────────────────────────────────────────────────

class MenuItem {
  final String id;
  final String name;
  final String category;
  final int price;
  final IconData icon;
  final Color iconColor;
  bool isAvailable;

  MenuItem({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.icon,
    required this.iconColor,
    this.isAvailable = true,
  });
}

// ─── Screen ──────────────────────────────────────────────────────────────────

class MenuAvailabilityScreen extends StatefulWidget {
  const MenuAvailabilityScreen({super.key});

  @override
  State<MenuAvailabilityScreen> createState() => _MenuAvailabilityScreenState();
}

class _MenuAvailabilityScreenState extends State<MenuAvailabilityScreen> {
  String _selectedCategory = 'Tất cả';

  final List<String> _categories = [
    'Tất cả',
    'Cà phê',
    'Trà sữa',
    'Nước ép & Sinh tố',
    'Ăn vặt',
    'Bánh ngọt',
  ];

  late List<MenuItem> _menuItems;

  @override
  void initState() {
    super.initState();
    _menuItems = [
      MenuItem(id: '1', name: 'Cà phê Muối Huế', category: 'Cà phê', price: 32000,
          icon: Icons.coffee, iconColor: const Color(0xFF8D6E63)),
      MenuItem(id: '2', name: 'Bạc Xỉu Sài Gòn', category: 'Cà phê', price: 29000,
          icon: Icons.local_cafe, iconColor: const Color(0xFFA1887F)),
      MenuItem(id: '3', name: 'Cà phê Đen Đá', category: 'Cà phê', price: 22000,
          icon: Icons.emoji_food_beverage, iconColor: const Color(0xFF5D4037), isAvailable: false),
      MenuItem(id: '4', name: 'Trà Đào Cam Sả', category: 'Trà sữa', price: 38000,
          icon: Icons.local_drink, iconColor: const Color(0xFFFFB74D)),
      MenuItem(id: '5', name: 'Trà Sữa Trân Châu Đường Đen', category: 'Trà sữa', price: 42000,
          icon: Icons.bubble_chart, iconColor: const Color(0xFFBCAAA4), isAvailable: false),
      MenuItem(id: '6', name: 'Trà Mãng Cầu Tươi', category: 'Trà sữa', price: 39000,
          icon: Icons.eco, iconColor: const Color(0xFF81C784)),
      MenuItem(id: '7', name: 'Nước Ép Dưa Hấu', category: 'Nước ép & Sinh tố', price: 35000,
          icon: Icons.water_drop, iconColor: const Color(0xFFE57373)),
      MenuItem(id: '8', name: 'Sinh Tố Bơ Sáp', category: 'Nước ép & Sinh tố', price: 45000,
          icon: Icons.icecream, iconColor: const Color(0xFFAED581)),
      MenuItem(id: '9', name: 'Khoai Tây Chiên Lắc Phô Mai', category: 'Ăn vặt', price: 30000,
          icon: Icons.fastfood, iconColor: const Color(0xFFFFD54F)),
      MenuItem(id: '10', name: 'Bánh Croissant Bơ Tỏi', category: 'Bánh ngọt', price: 35000,
          icon: Icons.bakery_dining, iconColor: const Color(0xFFFFCC80)),
    ];
  }

  List<MenuItem> get _filtered {
    if (_selectedCategory == 'Tất cả') return _menuItems;
    return _menuItems.where((m) => m.category == _selectedCategory).toList();
  }

  int get _outOfStockCount => _menuItems.where((m) => !m.isAvailable).length;
  int get _availableCount => _menuItems.where((m) => m.isAvailable).length;

  String _formatCurrency(int amount) {
    final str = amount.toString();
    final buffer = StringBuffer();
    int count = 0;
    for (int i = str.length - 1; i >= 0; i--) {
      buffer.write(str[i]);
      count++;
      if (count % 3 == 0 && i != 0) buffer.write('.');
    }
    return '${buffer.toString().split('').reversed.join('')} đ';
  }

  void _toggleItem(MenuItem item) {
    setState(() => item.isAvailable = !item.isAvailable);
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: item.isAvailable ? Colors.green : Colors.orange,
        content: Text(
          item.isAvailable
              ? '✅ "${item.name}" — Đã bật trở lại'
              : '⚠️ "${item.name}" — Đã đánh dấu hết hàng',
        ),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  void _showConfirmToggle(MenuItem item) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        title: Text(
          item.isAvailable ? 'Đánh dấu hết hàng?' : 'Mở bán trở lại?',
          style: const TextStyle(fontSize: 17, fontWeight: FontWeight.bold),
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              item.isAvailable
                  ? 'Món "${item.name}" sẽ hiển thị là HẾT HÀNG và không thể gọi.'
                  : 'Món "${item.name}" sẽ được mở bán trở lại trên menu.',
              style: const TextStyle(fontSize: 14),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Huỷ'),
          ),
          ElevatedButton(
            onPressed: () {
              Navigator.pop(context);
              _toggleItem(item);
            },
            style: ElevatedButton.styleFrom(
              backgroundColor: item.isAvailable ? Colors.orange : Colors.green,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
            ),
            child: Text(item.isAvailable ? 'Hết hàng' : 'Mở bán'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _filtered;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Bật / Tắt món hết hàng'),
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
          // Stats bar
          Container(
            color: Colors.white,
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 14),
            child: Row(
              children: [
                _buildStatPill('Đang bán', '$_availableCount món', Colors.green),
                const SizedBox(width: 10),
                _buildStatPill('Hết hàng', '$_outOfStockCount món', Colors.orange),
                const SizedBox(width: 10),
                _buildStatPill('Tổng menu', '${_menuItems.length} món', Colors.blue),
              ],
            ),
          ),

          // Info banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
            color: Colors.amber.shade50,
            child: Row(
              children: [
                Icon(Icons.info_outline, color: Colors.amber.shade800, size: 16),
                const SizedBox(width: 8),
                const Expanded(
                  child: Text(
                    'Bật/tắt sẽ cập nhật ngay lập tức trạng thái khả dụng của món.',
                    style: TextStyle(fontSize: 12, color: Color(0xFF795548)),
                  ),
                ),
              ],
            ),
          ),

          // Category filter
          Container(
            height: 48,
            color: Colors.white,
            child: ListView.builder(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
              itemCount: _categories.length,
              itemBuilder: (context, index) {
                final cat = _categories[index];
                final isSelected = cat == _selectedCategory;
                return Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 4),
                  child: ChoiceChip(
                    label: Text(cat, style: TextStyle(
                      fontSize: 12,
                      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                      color: isSelected ? Colors.white : AppColors.textPrimary,
                    )),
                    selected: isSelected,
                    selectedColor: AppColors.primary,
                    backgroundColor: AppColors.background,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(20),
                      side: BorderSide(color: isSelected ? AppColors.primary : Colors.grey.shade200),
                    ),
                    showCheckmark: false,
                    onSelected: (selected) {
                      if (selected) setState(() => _selectedCategory = cat);
                    },
                  ),
                );
              },
            ),
          ),
          const Divider(height: 1),

          // Menu list
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.all(14),
              itemCount: filtered.length,
              separatorBuilder: (_, __) => const SizedBox(height: 10),
              itemBuilder: (context, index) {
                final item = filtered[index];
                return _buildMenuCard(item);
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatPill(String label, String value, Color color) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 10, horizontal: 10),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(12),
          border: Border.all(color: color.withValues(alpha: 0.2)),
        ),
        child: Column(
          children: [
            Text(value, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: color)),
            Text(label, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
          ],
        ),
      ),
    );
  }

  Widget _buildMenuCard(MenuItem item) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
          color: item.isAvailable ? Colors.grey.shade200 : Colors.orange.shade200,
          width: item.isAvailable ? 1 : 1.5,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 6,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Row(
        children: [
          // Icon
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: item.isAvailable
                  ? item.iconColor.withValues(alpha: 0.15)
                  : Colors.grey.shade100,
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(
              item.icon,
              size: 22,
              color: item.isAvailable ? item.iconColor : Colors.grey.shade400,
            ),
          ),
          const SizedBox(width: 12),

          // Name, category, price
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.name,
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14,
                    color: item.isAvailable ? AppColors.textPrimary : Colors.grey.shade500,
                    decoration: item.isAvailable ? null : TextDecoration.lineThrough,
                  ),
                ),
                const SizedBox(height: 3),
                Row(
                  children: [
                    Text(
                      item.category,
                      style: const TextStyle(fontSize: 11, color: AppColors.textSecondary),
                    ),
                    const SizedBox(width: 8),
                    Text(
                      _formatCurrency(item.price),
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                        color: item.isAvailable ? AppColors.primary : Colors.grey.shade500,
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 8),

          // Toggle + status
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Switch(
                value: item.isAvailable,
                onChanged: (_) => _showConfirmToggle(item),
                activeThumbColor: Colors.green,
                activeTrackColor: Colors.green.withValues(alpha: 0.4),
                inactiveThumbColor: Colors.orange,
                inactiveTrackColor: Colors.orange.withValues(alpha: 0.3),
                materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
              ),
              Text(
                item.isAvailable ? 'Đang bán' : 'Hết hàng',
                style: TextStyle(
                  fontSize: 10,
                  fontWeight: FontWeight.bold,
                  color: item.isAvailable ? Colors.green : Colors.orange,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
