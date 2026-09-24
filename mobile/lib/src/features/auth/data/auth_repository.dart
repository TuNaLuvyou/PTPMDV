import '../../../core/models/branch.dart';
import '../../../core/models/user.dart';
import '../../../core/network/api_client.dart';

/// Tầng data cho Auth: gọi API thật qua api-gateway về identity-service.
///
/// - Đăng nhập: `POST /api/auth/login` (server set cookie `hrm-session`).
/// - Kiểm tra phiên: `GET /api/auth/me`.
/// - Đăng xuất: `POST /api/auth/logout`.
/// Lỗi mạng/sai tài khoản ném [ApiException] với message tiếng Việt để UI hiển thị.
class AuthRepository {
  final ApiClient api;
  AuthRepository({ApiClient? api}) : api = api ?? ApiClient();

  UserModel _toUser(Map<String, dynamic> j) {
    final slug = (j['branchSlug']?.toString() ?? 'HN-1').toLowerCase();
    final branch = branchById(slug);
    return UserModel(
      id: j['id']?.toString() ?? '',
      name: j['name']?.toString() ?? '',
      email: j['email']?.toString() ?? '',
      role: j['role']?.toString() ?? 'staff',
      roleTitle: j['roleTitle']?.toString() ?? '',
      assignedBranchId: branch.id,
    );
  }

  /// Đăng nhập bằng email + mật khẩu, trả về user từ server.
  Future<UserModel> login(String email, String password) async {
    final data = await api.postJson('/api/auth/login', {
      'email': email.trim(),
      'password': password,
    });
    final user = (data as Map)['user'] as Map<String, dynamic>;
    return _toUser(user);
  }

  /// Lấy phiên hiện tại. Trả về null khi chưa/chưa còn đăng nhập.
  Future<UserModel?> me() async {
    try {
      final data = await api.getJson('/api/auth/me');
      return _toUser((data as Map).cast<String, dynamic>());
    } on ApiException {
      return null;
    }
  }

  Future<void> logout() async {
    try {
      await api.postJson('/api/auth/logout', {});
    } on ApiException {
      // Mất mạng vẫn cho đăng xuất cục bộ để không kẹt phiên.
    }
  }
}
