import 'package:flutter/material.dart';
import 'package:font_awesome_flutter/font_awesome_flutter.dart';
import '../../../core/constants/colors.dart';
import '../data/regulation_repository.dart';

class CompanyRegulationsScreen extends StatefulWidget {
  const CompanyRegulationsScreen({super.key});

  @override
  State<CompanyRegulationsScreen> createState() => _CompanyRegulationsScreenState();
}

class _CompanyRegulationsScreenState extends State<CompanyRegulationsScreen> {
  final RegulationRepository _repo = RegulationRepository();
  List<RegulationModel> _apiRegulations = [];
  bool _isLoading = false;

  @override
  void initState() {
    super.initState();
    _loadRegulations();
  }

  Future<void> _loadRegulations() async {
    setState(() => _isLoading = true);
    try {
      final list = await _repo.getRegulations();
      if (mounted) {
        setState(() {
          _apiRegulations = list;
          _isLoading = false;
        });
      }
    } catch (_) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  FaIconData _iconForCategory(String cat) {
    final lower = cat.toLowerCase();
    if (lower.contains('giờ') || lower.contains('time') || lower.contains('chấm công')) {
      return FontAwesomeIcons.clock;
    }
    if (lower.contains('nghỉ') || lower.contains('phép') || lower.contains('leave')) {
      return FontAwesomeIcons.calendarCheck;
    }
    if (lower.contains('lương') || lower.contains('thưởng') || lower.contains('payroll')) {
      return FontAwesomeIcons.coins;
    }
    if (lower.contains('tác phong') || lower.contains('văn hóa') || lower.contains('an toàn')) {
      return FontAwesomeIcons.circleCheck;
    }
    return FontAwesomeIcons.bookOpen;
  }

  Color _colorForIndex(int idx) {
    final colors = [Colors.blue, Colors.orange, Colors.teal, Colors.green, Colors.purple, Colors.indigo];
    return colors[idx % colors.length];
  }

  void _showDetail(BuildContext context, RegulationModel r, Color color, String number) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (ctx) => DraggableScrollableSheet(
        initialChildSize: 0.75,
        maxChildSize: 0.95,
        minChildSize: 0.5,
        expand: false,
        builder: (_, scrollController) => Padding(
          padding: const EdgeInsets.fromLTRB(20, 12, 20, 24),
          child: ListView(
            controller: scrollController,
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
              const SizedBox(height: 18),
              Wrap(
                spacing: 8,
                runSpacing: 6,
                children: [
                  if (r.code.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        r.code,
                        style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.bold),
                      ),
                    ),
                  if (r.category.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        r.category,
                        style: const TextStyle(color: AppColors.textSecondary, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ),
                  if (r.scope.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: Colors.teal.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        'Phạm vi: ${r.scope}',
                        style: const TextStyle(color: Colors.teal, fontSize: 11, fontWeight: FontWeight.w600),
                      ),
                    ),
                  if (r.status.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3.5),
                      decoration: BoxDecoration(
                        color: Colors.green.withValues(alpha: 0.1),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        r.status.toUpperCase(),
                        style: const TextStyle(color: Colors.green, fontSize: 10.5, fontWeight: FontWeight.bold),
                      ),
                    ),
                ],
              ),
              const SizedBox(height: 14),
              Text(
                r.title,
                style: const TextStyle(
                  fontSize: 18,
                  fontWeight: FontWeight.bold,
                  color: AppColors.textPrimary,
                  height: 1.3,
                ),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const FaIcon(FontAwesomeIcons.circleUser, size: 12, color: AppColors.textSecondary),
                  const SizedBox(width: 5),
                  Expanded(
                    child: Text(
                      '${r.author.isNotEmpty ? r.author : "Ban Giám Đốc"} • Áp dụng: ${r.effectiveDate.isNotEmpty ? r.effectiveDate : "Hiện hành"} • Phiên bản: ${r.version}',
                      style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              const Divider(height: 1),
              const SizedBox(height: 16),
              if (r.summary.isNotEmpty && r.summary.trim() != r.content.trim()) ...[
                Container(
                  padding: const EdgeInsets.all(12),
                  decoration: BoxDecoration(
                    color: Colors.amber.shade50,
                    borderRadius: BorderRadius.circular(10),
                    border: Border.all(color: Colors.amber.shade200),
                  ),
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Icon(Icons.info_outline, size: 18, color: Colors.amber.shade900),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(
                          r.summary,
                          style: TextStyle(
                            fontSize: 12.5,
                            color: Colors.amber.shade900,
                            fontWeight: FontWeight.w500,
                            height: 1.4,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],
              const Text(
                'Nội dung chi tiết quy định:',
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary),
              ),
              const SizedBox(height: 8),
              Text(
                r.content.isNotEmpty ? r.content : r.summary,
                style: const TextStyle(
                  fontSize: 13.5,
                  height: 1.6,
                  color: AppColors.textPrimary,
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: double.infinity,
                child: OutlinedButton(
                  onPressed: () => Navigator.pop(ctx),
                  style: OutlinedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(vertical: 12),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  child: const Text('Đóng'),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Nội quy công ty', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: AppColors.textPrimary)),
        backgroundColor: Colors.white,
        centerTitle: true,
        elevation: 0,
        leading: IconButton(
          icon: const FaIcon(FontAwesomeIcons.chevronLeft, size: 18, color: AppColors.textPrimary),
          onPressed: () => Navigator.pop(context),
        ),
      ),
      body: RefreshIndicator(
        onRefresh: _loadRegulations,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            if (_isLoading && _apiRegulations.isEmpty)
              const Center(
                child: Padding(
                  padding: EdgeInsets.all(32),
                  child: CircularProgressIndicator(),
                ),
              )
            else if (_apiRegulations.isNotEmpty)
              ..._apiRegulations.asMap().entries.map((e) {
                final idx = e.key;
                final r = e.value;
                return _buildSection(
                  number: '${idx + 1}',
                  r: r,
                  icon: _iconForCategory(r.category),
                  color: _colorForIndex(idx),
                );
              })
            else ...[
              Container(
                padding: const EdgeInsets.symmetric(vertical: 36),
                alignment: Alignment.center,
                child: const Column(
                  children: [
                    FaIcon(FontAwesomeIcons.bookOpen, size: 36, color: Colors.grey),
                    SizedBox(height: 10),
                    Text('Chưa có nội quy nào', style: TextStyle(color: AppColors.textSecondary, fontSize: 13.5)),
                  ],
                ),
              ),
            ],
            const SizedBox(height: 20),
          ],
        ),
      ),
    );
  }

  Widget _buildSection({
    required String number,
    required RegulationModel r,
    required FaIconData icon,
    required Color color,
  }) {
    final previewText = r.summary.isNotEmpty ? r.summary : r.content;

    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0.5,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(14),
        side: BorderSide(color: Colors.grey.shade200),
      ),
      child: InkWell(
        onTap: () => _showDetail(context, r, color, number),
        borderRadius: BorderRadius.circular(14),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  CircleAvatar(
                    radius: 14,
                    backgroundColor: color.withValues(alpha: 0.12),
                    child: Text(number, style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 13)),
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      r.title,
                      style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14.5, color: AppColors.textPrimary),
                    ),
                  ),
                  if (r.scope.isNotEmpty)
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(4),
                      ),
                      child: Text(r.scope, style: const TextStyle(fontSize: 10, color: AppColors.textSecondary)),
                    ),
                ],
              ),
              const SizedBox(height: 10),
              Text(
                previewText,
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
                style: const TextStyle(fontSize: 13, color: AppColors.textSecondary, height: 1.5),
              ),
              if (r.category.isNotEmpty) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    FaIcon(icon, size: 12, color: AppColors.textSecondary),
                    const SizedBox(width: 5),
                    Text(
                      r.category,
                      style: const TextStyle(fontSize: 11.5, color: AppColors.textSecondary),
                    ),
                  ],
                ),
              ],
            ],
          ),
        ),
      ),
    );
  }
}
