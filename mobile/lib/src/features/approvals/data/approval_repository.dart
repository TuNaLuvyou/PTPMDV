import '../../../core/models/leave_request.dart';
import '../../../core/network/api_client.dart';

/// Repository duyệt đơn (approvals). Duyệt/từ chối tự sinh thông báo phía
/// integration-service — mobile chỉ gọi API và refresh 2 màn approvals +
/// notifications theo liên động nghiệm thu.
class ApprovalRepository {
  final ApiClient api;
  ApprovalRepository({ApiClient? api}) : api = api ?? ApiClient();

  Future<List<LeaveRequestModel>> getPending() async {
    return getAllRequests(status: 'pending');
  }

  Future<List<LeaveRequestModel>> getAllRequests({String? status}) async {
    final query = status != null ? {'status': status} : <String, String>{};
    final data = await api.getJson('/api/requests', query: query.isEmpty ? null : query);
    final List list = data is List ? data : [];
    return list
        .whereType<Map<String, dynamic>>()
        .map(LeaveRequestModel.fromJson)
        .toList();
  }

  Future<void> approve(String id, {String? note}) => api.putJson(
        '/api/requests/$id/approve',
        {if (note != null) 'reviewNote': note},
      );

  Future<void> reject(String id, {String? note}) => api.putJson(
        '/api/requests/$id/reject',
        {if (note != null) 'reviewNote': note},
      );
}
