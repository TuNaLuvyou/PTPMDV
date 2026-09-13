import 'package:flutter/material.dart';
import '../models/tenant.dart';

/// Giữ thương hiệu (tenant) đang được chọn trên toàn app.
///
/// Giá trị:
/// - `Tenant`: đang đăng nhập tenant cụ thể (mặc định tenant đầu tiên mẫu).
class TenantScope extends InheritedNotifier<ValueNotifier<Tenant?>> {
  const TenantScope({
    super.key,
    required ValueNotifier<Tenant?> notifier,
    required super.child,
  }) : super(notifier: notifier);

  static TenantScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<TenantScope>();

  /// Đọc scope mà không tạo dependency (dùng trong event handler).
  static TenantScope? read(BuildContext context) =>
      context.getInheritedWidgetOfExactType<TenantScope>();

  static ValueNotifier<Tenant?>? notifierOf(BuildContext context) =>
      read(context)?.notifier;

  static Tenant? selectedTenant(BuildContext context) =>
      maybeOf(context)?.notifier?.value;

  /// Tên thương hiệu đang chọn.
  static String label(BuildContext context) =>
      selectedTenant(context)?.name ?? kTenants.first.name;

  static void select(BuildContext context, Tenant tenant) {
    final notifier = notifierOf(context);
    if (notifier != null) {
      notifier.value = tenant;
    }
  }
}