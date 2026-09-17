import 'package:go_router/go_router.dart';
import '../models/user.dart';
import '../../features/auth/presentation/splash_screen.dart';
import '../../features/auth/presentation/login_screen.dart';
import '../../features/main/presentation/main_navigation_screen.dart';

class AppRouter {
  static final GoRouter router = GoRouter(
    initialLocation: '/',
    routes: [
      GoRoute(
        path: '/',
        builder: (context, state) => const SplashScreen(),
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/main',
        builder: (context, state) {
          final user = state.extra as UserModel? ??
              const UserModel(
                name: 'Trần Minh Tuấn',
                email: 'admin@company.com',
                role: 'admin',
                roleTitle: 'Quản trị viên',
              );
          return MainNavigationScreen(currentUser: user);
        },
      ),
    ],
  );
}
