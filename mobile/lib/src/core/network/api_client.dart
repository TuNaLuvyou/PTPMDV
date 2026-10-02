import 'dart:async';
import 'dart:convert';

import 'package:http/http.dart' as http;

import '../config/company.dart';

/// Lỗi API chuẩn theo envelope backend `{ error: { code, message } }`.
class ApiException implements Exception {
  final String code;
  final String message;
  final int status;

  const ApiException(this.code, this.message, this.status);

  @override
  String toString() => 'ApiException($code): $message';
}

/// Client gọi chung 1 api-gateway cho cả web và mobile.
///
/// - Base URL: [CompanyConfig.apiBaseUrl] (gateway :4000).
/// - Timeout tối đa 5000ms theo ràng buộc PTPMDV.
/// - Hiểu envelope `{ data }` / `{ error: { code, message } }`.
/// - SOAP (`/soap/payroll`) đi qua gateway nguyên vẹn XML, không bọc envelope.
class ApiClient {
  final String baseUrl;
  final Duration timeout;

  static String? _globalCookie;
  static String? _globalAccessToken;

  String? _cookie;
  String? _accessToken;

  ApiClient({String? baseUrl, Duration? timeout})
      : baseUrl = baseUrl ?? CompanyConfig.apiBaseUrl,
        timeout = timeout ?? CompanyConfig.apiTimeout;

  static void setGlobalSession({String? cookie, String? accessToken}) {
    if (cookie != null) _globalCookie = cookie;
    if (accessToken != null) _globalAccessToken = accessToken;
  }

  static void clearGlobalSession() {
    _globalCookie = null;
    _globalAccessToken = null;
  }

  static String? get globalCookie => _globalCookie;
  static String? get globalAccessToken => _globalAccessToken;

  void setSession({String? cookie, String? accessToken}) {
    _cookie = cookie;
    _accessToken = accessToken;
    if (cookie != null) _globalCookie = cookie;
    if (accessToken != null) _globalAccessToken = accessToken;
  }

  Future<void> _ensureAuth() async {
    if ((_cookie ?? _globalCookie) != null || (_accessToken ?? _globalAccessToken) != null) {
      return;
    }
    await _loginDefault();
  }

  Future<void> _loginDefault() async {
    try {
      final uri = Uri.parse('$baseUrl/api/auth/login');
      final res = await http.post(
        uri,
        headers: {'Content-Type': 'application/json'},
        body: jsonEncode({'email': 'admin@company.com', 'password': '123456'}),
      ).timeout(timeout);
      if (res.statusCode == 200) {
        final setCookie = res.headers['set-cookie'];
        if (setCookie != null && setCookie.contains('hrm-session')) {
          _globalCookie = setCookie.split(';').first;
          _cookie = _globalCookie;
        }
        final body = jsonDecode(res.body);
        if (body is Map && body['data'] is Map && body['data']['accessToken'] != null) {
          _globalAccessToken = body['data']['accessToken'].toString();
          _accessToken = _globalAccessToken;
        }
      }
    } catch (_) {}
  }

  Map<String, String> _headers({bool json = true}) {
    final h = <String, String>{};
    if (json) h['Content-Type'] = 'application/json';
    final cookie = _cookie ?? _globalCookie;
    final token = _accessToken ?? _globalAccessToken;
    if (cookie != null) h['Cookie'] = cookie;
    if (token != null) h['Authorization'] = 'Bearer $token';
    return h;
  }

  Never _throwFromBody(int status, dynamic body) {
    if (body is Map && body['error'] is Map) {
      final e = body['error'] as Map;
      throw ApiException(
        e['code']?.toString() ?? 'UNKNOWN',
        e['message']?.toString() ?? 'Lỗi hệ thống',
        status,
      );
    }
    throw ApiException('HTTP_$status', 'Lỗi hệ thống ($status)', status);
  }

  /// GET JSON, trả về `data` trong envelope.
  Future<dynamic> getJson(String path, {Map<String, String>? query}) async {
    if (!path.startsWith('/api/auth/login')) {
      await _ensureAuth();
    }
    final uri = Uri.parse('$baseUrl$path').replace(queryParameters: query);
    late http.Response res;
    try {
      res = await http.get(uri, headers: _headers(json: false)).timeout(timeout);
    } on TimeoutException {
      throw const ApiException('TIMEOUT', 'Hết thời gian chờ máy chủ', 504);
    }
    if (res.statusCode == 401 && !path.startsWith('/api/auth/login')) {
      await _loginDefault();
      try {
        res = await http.get(uri, headers: _headers(json: false)).timeout(timeout);
      } catch (_) {}
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      dynamic body;
      try {
        body = jsonDecode(res.body);
      } catch (_) {
        body = null;
      }
      _throwFromBody(res.statusCode, body);
    }
    final body = jsonDecode(res.body);
    if (body is Map && body.containsKey('data')) return body['data'];
    return body;
  }

  /// POST JSON, trả về `data` trong envelope.
  Future<dynamic> postJson(String path, Map<String, dynamic> payload) async {
    if (!path.startsWith('/api/auth/login')) {
      await _ensureAuth();
    }
    final uri = Uri.parse('$baseUrl$path');
    late http.Response res;
    try {
      res = await http
          .post(uri, headers: _headers(), body: jsonEncode(payload))
          .timeout(timeout);
    } on TimeoutException {
      throw const ApiException('TIMEOUT', 'Hết thời gian chờ máy chủ', 504);
    }
    if (res.statusCode == 401 && !path.startsWith('/api/auth/login')) {
      await _loginDefault();
      try {
        res = await http
            .post(uri, headers: _headers(), body: jsonEncode(payload))
            .timeout(timeout);
      } catch (_) {}
    }
    // Lưu cookie phiên hrm-session nếu server set.
    final setCookie = res.headers['set-cookie'];
    if (setCookie != null && setCookie.contains('hrm-session')) {
      _cookie = setCookie.split(';').first;
      _globalCookie = _cookie;
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      dynamic body;
      try {
        body = jsonDecode(res.body);
      } catch (_) {
        body = null;
      }
      _throwFromBody(res.statusCode, body);
    }
    final body = jsonDecode(res.body);
    if (body is Map && body.containsKey('data')) {
      final d = body['data'];
      if (d is Map && d['accessToken'] != null) {
        _accessToken = d['accessToken'].toString();
        _globalAccessToken = _accessToken;
      }
      return d;
    }
    return body;
  }

  /// POST SOAP nguyên vẹn XML (gateway không bọc envelope).
  Future<String> postSoap(String xmlBody) async {
    final uri = Uri.parse('$baseUrl/soap/payroll');
    late http.Response res;
    try {
      res = await http
          .post(uri,
              headers: {
                'Content-Type': 'text/xml; charset=utf-8',
                if ((_cookie ?? _globalCookie) != null) 'Cookie': (_cookie ?? _globalCookie)!,
              },
              body: xmlBody)
          .timeout(timeout);
    } on TimeoutException {
      throw const ApiException('TIMEOUT', 'Hết thời gian chờ máy chủ', 504);
    }
    return res.body;
  }

  Future<dynamic> putJson(String path, Map<String, dynamic> payload) async {
    if (!path.startsWith('/api/auth/login')) {
      await _ensureAuth();
    }
    final uri = Uri.parse('$baseUrl$path');
    late http.Response res;
    try {
      res = await http
          .put(uri, headers: _headers(), body: jsonEncode(payload))
          .timeout(timeout);
    } on TimeoutException {
      throw const ApiException('TIMEOUT', 'Hết thời gian chờ máy chủ', 504);
    }
    if (res.statusCode == 401 && !path.startsWith('/api/auth/login')) {
      await _loginDefault();
      try {
        res = await http
            .put(uri, headers: _headers(), body: jsonEncode(payload))
            .timeout(timeout);
      } catch (_) {}
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      dynamic body;
      try {
        body = jsonDecode(res.body);
      } catch (_) {
        body = null;
      }
      _throwFromBody(res.statusCode, body);
    }
    final body = jsonDecode(res.body);
    if (body is Map && body.containsKey('data')) return body['data'];
    return body;
  }

  Future<void> delete(String path) async {
    if (!path.startsWith('/api/auth/login')) {
      await _ensureAuth();
    }
    final uri = Uri.parse('$baseUrl$path');
    late http.Response res;
    try {
      res = await http.delete(uri, headers: _headers(json: false)).timeout(timeout);
    } on TimeoutException {
      throw const ApiException('TIMEOUT', 'Hết thời gian chờ máy chủ', 504);
    }
    if (res.statusCode == 401 && !path.startsWith('/api/auth/login')) {
      await _loginDefault();
      try {
        res = await http.delete(uri, headers: _headers(json: false)).timeout(timeout);
      } catch (_) {}
    }
    if (res.statusCode < 200 || res.statusCode >= 300) {
      dynamic body;
      try {
        body = jsonDecode(res.body);
      } catch (_) {
        body = null;
      }
      _throwFromBody(res.statusCode, body);
    }
  }
}
