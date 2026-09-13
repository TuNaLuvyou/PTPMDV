import 'package:flutter/material.dart';
import 'core/models/branch.dart';
import 'core/models/tenant.dart';
import 'core/state/branch_scope.dart';
import 'core/state/tenant_scope.dart';
import 'core/state/user_scope.dart';
import 'core/theme/app_theme.dart';
import 'features/auth/presentation/login_screen.dart';
import 'features/auth/presentation/splash_screen.dart';

class FBManagementApp extends StatefulWidget {
  const FBManagementApp({super.key});

  @override
  State<FBManagementApp> createState() => _FBManagementAppState();
}

class _FBManagementAppState extends State<FBManagementApp> {
  // Tenant = null khi chưa đăng nhập; chỉ được set sau khi login thành công
  // (tenant được suy từ tài khoản do Platform Admin tạo).
  final ValueNotifier<Tenant?> _selectedTenant = ValueNotifier<Tenant?>(null);
  final ValueNotifier<Branch?> _selectedBranch = ValueNotifier<Branch?>(null);
  final ValueNotifier<UserModel?> _currentUser = ValueNotifier<UserModel?>(null);

  @override
  void dispose() {
    _selectedTenant.dispose();
    _selectedBranch.dispose();
    _currentUser.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'F&B Platform',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.lightTheme,
      builder: (context, child) => UserScope(
        notifier: _currentUser,
        child: TenantScope(
          notifier: _selectedTenant,
          child: BranchScope(
            notifier: _selectedBranch,
            child: child ?? const SizedBox.shrink(),
          ),
        ),
      ),
      home: const SplashScreen(),
    );
  }
}
