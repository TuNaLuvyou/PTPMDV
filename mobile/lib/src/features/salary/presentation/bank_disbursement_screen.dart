import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';
import '../../../core/network/api_client.dart';
import '../../../core/utils/formatters.dart';

class BankDisbursementScreen extends StatefulWidget {
  const BankDisbursementScreen({super.key});

  @override
  State<BankDisbursementScreen> createState() => _BankDisbursementScreenState();
}

class _BankDisbursementScreenState extends State<BankDisbursementScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  final ApiClient _api = ApiClient();

  // SOAP State
  String _soapKey = '';
  final _soapAccountCtrl = TextEditingController();
  late final TextEditingController _soapContentCtrl;
  final _soapAmountCtrl = TextEditingController();
  final _soapCountCtrl = TextEditingController();
  bool _soapLoading = false;
  String? _soapResponseXml;
  String? _soapTxId;
  String? _soapBankRef;
  String? _soapError;

  // REST State
  String _restKey = '';
  final _restAccountCtrl = TextEditingController();
  late final TextEditingController _restContentCtrl;
  final _restAmountCtrl = TextEditingController();
  final _restCountCtrl = TextEditingController();
  bool _restLoading = false;
  Map<String, dynamic>? _restResult;
  String? _restError;
  int _sendCount = 0;

  @override
  void initState() {
    super.initState();
    final now = DateTime.now();
    final mm = now.month.toString().padLeft(2, '0');
    _soapContentCtrl = TextEditingController(text: 'Chi lương tháng $mm/${now.year}');
    _restContentCtrl = TextEditingController(text: 'Chi lương tháng $mm/${now.year}');

    _tabController = TabController(length: 2, vsync: this);
    _generateNewSoapKey();
    _generateNewRestKey();
    _loadDefaultAccount();
  }

  Future<void> _loadDefaultAccount() async {
    try {
      final res = await _api.getJson('/api/payroll/bank-accounts');
      final list = res is List ? res : [];
      if (list.isNotEmpty) {
        final first = list.first;
        if (first is Map) {
          final acc = first['accountNumber']?.toString() ?? '';
          if (acc.isNotEmpty && mounted) {
            setState(() {
              if (_soapAccountCtrl.text.isEmpty) _soapAccountCtrl.text = acc;
              if (_restAccountCtrl.text.isEmpty) _restAccountCtrl.text = acc;
            });
          }
        }
      }
    } catch (_) {}
  }

  @override
  void dispose() {
    _tabController.dispose();
    _soapAccountCtrl.dispose();
    _soapContentCtrl.dispose();
    _soapAmountCtrl.dispose();
    _soapCountCtrl.dispose();
    _restAccountCtrl.dispose();
    _restContentCtrl.dispose();
    _restAmountCtrl.dispose();
    _restCountCtrl.dispose();
    super.dispose();
  }

  void _generateNewSoapKey() {
    setState(() {
      _soapKey = 'SOAP-KEY-${DateTime.now().millisecondsSinceEpoch}';
    });
  }

  void _generateNewRestKey() {
    setState(() {
      _restKey = 'REST-KEY-${DateTime.now().millisecondsSinceEpoch}';
      _sendCount = 0;
      _restResult = null;
      _restError = null;
    });
  }

  String _buildSoapXml() {
    return '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/">\n'
        '  <soap:Body>\n'
        '    <PayoutRequest>\n'
        '      <idempotencyKey>$_soapKey</idempotencyKey>\n'
        '      <debitAccount>${_soapAccountCtrl.text.trim()}</debitAccount>\n'
        '      <content>${_soapContentCtrl.text.trim()}</content>\n'
        '      <totalAmount>${_soapAmountCtrl.text.trim()}</totalAmount>\n'
        '      <beneficiaryCount>${_soapCountCtrl.text.trim()}</beneficiaryCount>\n'
        '    </PayoutRequest>\n'
        '  </soap:Body>\n'
        '</soap:Envelope>';
  }

  Future<void> _sendSoapRequest() async {
    setState(() {
      _soapLoading = true;
      _soapError = null;
      _soapResponseXml = null;
      _soapTxId = null;
      _soapBankRef = null;
    });

    final xmlBody = _buildSoapXml();
    try {
      final resXml = await _api.postSoap(xmlBody);
      setState(() {
        _soapResponseXml = resXml;
        _soapLoading = false;

        // Trích xuất thẻ XML
        final txMatch = RegExp(r'<transactionId>([^<]+)</transactionId>').firstMatch(resXml);
        final refMatch = RegExp(r'<bankReference>([^<]+)</bankReference>').firstMatch(resXml);
        final faultMatch = RegExp(r'<faultstring>([^<]+)</faultstring>').firstMatch(resXml);

        if (faultMatch != null) {
          _soapError = 'SOAP Fault: ${faultMatch.group(1)}';
        } else {
          _soapTxId = txMatch?.group(1);
          _soapBankRef = refMatch?.group(1);
        }
      });
    } catch (e) {
      setState(() {
        _soapLoading = false;
        _soapError = 'Lỗi gửi SOAP: $e';
      });
    }
  }

  Future<void> _sendRestPayout() async {
    setState(() {
      _restLoading = true;
      _restError = null;
    });

    final payload = {
      'idempotencyKey': _restKey,
      'debitAccount': _restAccountCtrl.text.trim(),
      'content': _restContentCtrl.text.trim(),
      'totalAmount': double.tryParse(_restAmountCtrl.text.trim()) ?? 0,
      'beneficiaryCount': int.tryParse(_restCountCtrl.text.trim()) ?? 0,
    };

    try {
      final res = await _api.postJson('/api/payroll/payouts', payload);
      setState(() {
        _restLoading = false;
        _sendCount++;
        if (res is Map<String, dynamic>) {
          _restResult = res;
        } else if (res is Map) {
          _restResult = Map<String, dynamic>.from(res);
        }
      });
    } catch (e) {
      setState(() {
        _restLoading = false;
        _restError = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new, color: AppColors.textPrimary, size: 18),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Chi lương Ngân hàng & SOAP',
          style: TextStyle(
            color: AppColors.textPrimary,
            fontSize: 17,
            fontWeight: FontWeight.bold,
          ),
        ),
        bottom: TabBar(
          controller: _tabController,
          indicatorColor: AppColors.primary,
          labelColor: AppColors.primary,
          unselectedLabelColor: AppColors.secondary,
          tabs: const [
            Tab(icon: Icon(Icons.code, size: 18), text: 'SOAP XML'),
            Tab(icon: Icon(Icons.security, size: 18), text: 'REST Idempotent'),
          ],
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _buildSoapTab(),
          _buildRestTab(),
        ],
      ),
    );
  }

  Widget _buildSoapTab() {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFEFF6FF),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFBFDBFE)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.info_outline, size: 18, color: Color(0xFF2563EB)),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Demo SOAP Gateway: Client gửi PayoutRequest qua HTTP POST /soap/payroll (XML), backend tạo lệnh chi và trả PayoutResponse (XML) kèm mã giao dịch BANK-*.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF1E40AF), height: 1.4),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _buildSectionCard(
          title: 'Cấu hình lệnh chi SOAP',
          icon: Icons.tune,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Key: $_soapKey',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                TextButton.icon(
                  onPressed: _generateNewSoapKey,
                  icon: const Icon(Icons.refresh, size: 14),
                  label: const Text('Key mới', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            _buildTextField('Tài khoản trích nợ', _soapAccountCtrl),
            const SizedBox(height: 10),
            _buildTextField('Nội dung', _soapContentCtrl),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: _buildTextField('Tổng tiền (VND)', _soapAmountCtrl, keyboardType: TextInputType.number)),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField('Số nhân sự', _soapCountCtrl, keyboardType: TextInputType.number)),
              ],
            ),
            const SizedBox(height: 14),
            SizedBox(
              width: double.infinity,
              height: 44,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: _soapLoading ? null : _sendSoapRequest,
                icon: _soapLoading
                    ? const SizedBox(width: 16, height: 16, child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2))
                    : const Icon(Icons.send, size: 16),
                label: Text(_soapLoading ? 'Đang gửi SOAP XML...' : 'Gửi Request SOAP'),
              ),
            ),
          ],
        ),
        if (_soapError != null) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFFECACA)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, size: 18, color: AppColors.error),
                const SizedBox(width: 10),
                Expanded(child: Text(_soapError!, style: const TextStyle(fontSize: 12, color: AppColors.error))),
              ],
            ),
          ),
        ],
        if (_soapTxId != null) ...[
          const SizedBox(height: 14),
          _buildSuccessBanner(
            title: 'Tạo lệnh chi SOAP thành công!',
            txId: _soapTxId!,
            bankRef: _soapBankRef ?? '',
          ),
        ],
        if (_soapResponseXml != null) ...[
          const SizedBox(height: 14),
          _buildSectionCard(
            title: 'Phản hồi XML từ SOAP Gateway',
            icon: Icons.code,
            children: [
              Container(
                width: double.infinity,
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: const Color(0xFF1E293B),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Text(
                  _soapResponseXml!,
                  style: const TextStyle(fontFamily: 'Courier', fontSize: 11, color: Color(0xFF38BDF8), height: 1.3),
                ),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildRestTab() {
    final isDeduped = _restResult?['deduped'] == true;
    final txId = _restResult?['id']?.toString() ?? '';
    final bankRef = _restResult?['bankReference']?.toString() ?? '';

    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Container(
          padding: const EdgeInsets.all(14),
          decoration: BoxDecoration(
            color: const Color(0xFFF0FDF4),
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: const Color(0xFFBBF7D0)),
          ),
          child: const Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Icon(Icons.verified_user, size: 18, color: Color(0xFF16A34A)),
              SizedBox(width: 10),
              Expanded(
                child: Text(
                  'Demo Idempotency: Gửi lệnh chi 2 lần với cùng 1 key. Lần 1 trả kết quả mới (HTTP 201). Lần 2 trả bản ghi cũ kèm deduped: true (HTTP 200), không trừ tiền lần hai.',
                  style: TextStyle(fontSize: 12, color: Color(0xFF15803D), height: 1.4),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 16),
        _buildSectionCard(
          title: 'Lệnh chi REST Idempotent',
          icon: Icons.currency_exchange,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Key: $_restKey',
                    style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textSecondary),
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
                TextButton.icon(
                  onPressed: _generateNewRestKey,
                  icon: const Icon(Icons.refresh, size: 14),
                  label: const Text('Key mới', style: TextStyle(fontSize: 11)),
                ),
              ],
            ),
            const SizedBox(height: 6),
            _buildTextField('Tài khoản công ty', _restAccountCtrl),
            const SizedBox(height: 10),
            _buildTextField('Nội dung', _restContentCtrl),
            const SizedBox(height: 10),
            Row(
              children: [
                Expanded(child: _buildTextField('Số tiền (VND)', _restAmountCtrl, keyboardType: TextInputType.number)),
                const SizedBox(width: 12),
                Expanded(child: _buildTextField('Số người', _restCountCtrl, keyboardType: TextInputType.number)),
              ],
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: SizedBox(
                    height: 42,
                    child: ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: AppColors.primary,
                        foregroundColor: Colors.white,
                        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                      ),
                      onPressed: _restLoading ? null : _sendRestPayout,
                      child: Text(_sendCount == 0 ? 'Gửi lần 1' : 'Gửi lại (Test Lần ${_sendCount + 1})'),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                SizedBox(
                  height: 42,
                  child: OutlinedButton(
                    style: OutlinedButton.styleFrom(
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                    onPressed: _generateNewRestKey,
                    child: const Text('Đổi Key'),
                  ),
                ),
              ],
            ),
          ],
        ),
        if (_restError != null) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: const Color(0xFFFEF2F2),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(color: const Color(0xFFFECACA)),
            ),
            child: Row(
              children: [
                const Icon(Icons.error_outline, size: 18, color: AppColors.error),
                const SizedBox(width: 10),
                Expanded(child: Text(_restError!, style: const TextStyle(fontSize: 12, color: AppColors.error))),
              ],
            ),
          ),
        ],
        if (_restResult != null) ...[
          const SizedBox(height: 14),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: isDeduped ? const Color(0xFFFFFBEB) : const Color(0xFFF0FDF4),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: isDeduped ? const Color(0xFFFDE68A) : const Color(0xFFBBF7D0)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Icon(
                      isDeduped ? Icons.content_copy : Icons.check_circle_outline,
                      size: 20,
                      color: isDeduped ? const Color(0xFFD97706) : AppColors.success,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        isDeduped
                            ? 'Lệnh chi trùng lặp — Đã chống trùng (deduped: true)!'
                            : 'Tạo lệnh chi lần đầu thành công (HTTP 201)!',
                        style: TextStyle(
                          fontSize: 13,
                          fontWeight: FontWeight.bold,
                          color: isDeduped ? const Color(0xFF92400E) : const Color(0xFF166534),
                        ),
                      ),
                    ),
                  ],
                ),
                const Divider(height: 20),
                _buildInfoRow('Mã giao dịch', txId),
                _buildInfoRow('Đối soát ngân hàng', bankRef),
                _buildInfoRow('Tổng tiền chi', formatVND((_restResult?['totalAmount'] as num?)?.toDouble() ?? 0)),
                _buildInfoRow('Idempotency Key', _restKey),
                _buildInfoRow('Số lần gửi với key này', '$_sendCount lần'),
                _buildInfoRow('Trạng thái chống trùng', isDeduped ? 'CHẶNG TRÙNG THÀNH CÔNG (deduped = true)' : 'Tạo mới (HTTP 201)'),
              ],
            ),
          ),
        ],
      ],
    );
  }

  Widget _buildSectionCard({
    required String title,
    required IconData icon,
    required List<Widget> children,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Icon(icon, size: 16, color: AppColors.primary),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: AppColors.textPrimary)),
            ],
          ),
          const Divider(height: 18),
          ...children,
        ],
      ),
    );
  }

  Widget _buildTextField(String label, TextEditingController ctrl, {TextInputType? keyboardType}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 11, fontWeight: FontWeight.w600, color: AppColors.textSecondary)),
        const SizedBox(height: 4),
        SizedBox(
          height: 38,
          child: TextField(
            controller: ctrl,
            keyboardType: keyboardType,
            style: const TextStyle(fontSize: 13),
            decoration: InputDecoration(
              contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
              border: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.border)),
              enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.border)),
              focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(8), borderSide: const BorderSide(color: AppColors.primary)),
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildSuccessBanner({required String title, required String txId, required String bankRef}) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFFF0FDF4),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: const Color(0xFFBBF7D0)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(Icons.check_circle_outline, size: 18, color: AppColors.success),
              const SizedBox(width: 8),
              Text(title, style: const TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: Color(0xFF166534))),
            ],
          ),
          const SizedBox(height: 8),
          Text('Mã giao dịch: $txId', style: const TextStyle(fontSize: 12, color: Color(0xFF15803D))),
          Text('Mã đối soát: $bankRef', style: const TextStyle(fontSize: 12, color: Color(0xFF15803D))),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 3),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(fontSize: 12, color: AppColors.textSecondary)),
          Text(value, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: AppColors.textPrimary)),
        ],
      ),
    );
  }
}
