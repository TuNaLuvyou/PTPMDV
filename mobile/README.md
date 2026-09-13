# F&B Management - Mobile Application

Ứng dụng di động quản lý & dịch vụ F&B được xây dựng bằng **Flutter**.

## 📁 Cấu trúc Thư mục (Directory Architecture)

```text
mobile/
├── android/              # Cấu hình dự án cho nền tảng Android
├── ios/                  # Cấu hình dự án cho nền tảng iOS
├── web/                  # Cấu hình dự án cho web
├── assets/               # Chứa hình ảnh, biểu tượng và phông chữ
│   ├── images/
│   └── icons/
├── lib/                  # Mã nguồn chính (Dart)
│   ├── main.dart         # Entry point khởi chạy app
│   └── src/
│       ├── core/         # Các thành phần dùng chung (theme, constants, api client)
│       │   ├── constants/
│       │   ├── network/
│       │   └── theme/
│       └── features/     # Quản lý theo từng tính năng (Feature-driven)
│           ├── auth/
│           ├── home/
│           ├── order/
│           └── profile/
├── test/                 # Kiểm thử tự động (Unit test, Widget test)
├── analysis_options.yaml # Cấu hình Linter cho Dart & Flutter
└── pubspec.yaml          # Quản lý dependencies & tài nguyên
```

## 🚀 Cách cài đặt và chạy ứng dụng

1. **Yêu cầu môi trường**:
   - [Flutter SDK](https://docs.flutter.dev/get-started/install) (v3.0.0 trở lên)
   - Android Studio / VS Code có cài đặt plugin Flutter & Dart
   - Thiết bị giả lập (Android Emulator / iOS Simulator) hoặc thiết bị thật.

2. **Cài đặt thư viện (Dependencies)**:
   ```bash
   flutter pub get
   ```

3. **Chạy ứng dụng**:
   ```bash
   flutter run
   ```
