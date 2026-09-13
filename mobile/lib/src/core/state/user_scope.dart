import 'package:flutter/material.dart';
import '../../features/auth/presentation/login_screen.dart';

/// Giữ thông tin người dùng đang đăng nhập trên toàn app.
class UserScope extends InheritedNotifier<ValueNotifier<UserModel?>> {
  const UserScope({
    super.key,
    required ValueNotifier<UserModel?> notifier,
    required super.child,
  }) : super(notifier: notifier);

  static UserScope? maybeOf(BuildContext context) =>
      context.dependOnInheritedWidgetOfExactType<UserScope>();

  /// Đọc scope mà không tạo dependency.
  static UserScope? read(BuildContext context) =>
      context.getInheritedWidgetOfExactType<UserScope>();

  static ValueNotifier<UserModel?>? notifierOf(BuildContext context) =>
      read(context)?.notifier;

  static UserModel? currentUser(BuildContext context) =>
      maybeOf(context)?.notifier?.value;

  /// Kiểm tra có phải Admin / Quản trị viên hay không.
  static bool isAdmin(BuildContext context) {
    final user = currentUser(context);
    if (user == null) return false;
    return user.isManager;
  }

  static void setUser(BuildContext context, UserModel? user) {
    final notifier = notifierOf(context);
    if (notifier != null) {
      notifier.value = user;
    }
  }
}
