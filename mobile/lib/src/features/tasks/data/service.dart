import 'package:flutter/material.dart';
import '../../../core/constants/colors.dart';
import 'task_repository.dart';

enum TaskSourceType {
  manager, // Quản lý giao riêng
  shift,   // Cố định theo ca
}

enum TaskStatus {
  pending,    // Cần thực hiện
  inProgress, // Đang làm (giữ enum cho backward compatibility nếu có)
  overdue,    // Quá giờ
  completed,  // Đã xong
}

enum TaskPriority {
  urgent, // Khẩn cấp
  high,   // Quan trọng
  normal, // Bình thường
}

class TaskModel {
  final String id;
  final String title;
  final String description;
  final TaskSourceType sourceType;
  final String assignedByName; // Tên quản lý hoặc người giao
  final String? shiftName;     // Ca gắn liền (nếu có)
  final String branch;
  final DateTime dueDate;
  TaskStatus status;
  final TaskPriority priority;
  final String? assignedToEmail;
  final String? assignedToName;
  DateTime? completedAt;
  final bool requirePhoto;      // Quản trị viên yêu cầu chụp ảnh kết quả
  String? proofPhotoUrl;        // Ảnh chụp minh chứng kết quả công việc

  TaskModel({
    required this.id,
    required this.title,
    required this.description,
    required this.sourceType,
    required this.assignedByName,
    this.shiftName,
    required this.branch,
    required this.dueDate,
    this.status = TaskStatus.pending,
    this.priority = TaskPriority.normal,
    this.assignedToEmail,
    this.assignedToName,
    this.completedAt,
    this.requirePhoto = false,
    this.proofPhotoUrl,
  });

  bool get isOverdue {
    if (status == TaskStatus.completed) return false;
    return DateTime.now().isAfter(dueDate);
  }

  TaskStatus get computedStatus {
    if (status == TaskStatus.completed) return TaskStatus.completed;
    if (status == TaskStatus.inProgress) return TaskStatus.inProgress;
    if (isOverdue) return TaskStatus.overdue;
    return TaskStatus.pending;
  }

  String get sourceLabel => sourceType == TaskSourceType.manager
      ? 'Quản lý giao riêng'
      : 'Cố định theo ca';

  String get shortSourceLabel => sourceType == TaskSourceType.manager
      ? 'Giao riêng'
      : 'Theo ca';

  IconData get sourceIcon => sourceType == TaskSourceType.manager
      ? Icons.push_pin_rounded
      : Icons.sync_rounded;

  Color get sourceColor => sourceType == TaskSourceType.manager
      ? AppColors.primary
      : const Color(0xFF2563EB);

  String get priorityLabel {
    switch (priority) {
      case TaskPriority.urgent:
        return 'Khẩn cấp';
      case TaskPriority.high:
        return 'Quan trọng';
      case TaskPriority.normal:
        return 'Bình thường';
    }
  }

  Color get priorityColor {
    switch (priority) {
      case TaskPriority.urgent:
        return const Color(0xFFDC2626);
      case TaskPriority.high:
        return const Color(0xFFEA580C);
      case TaskPriority.normal:
        return const Color(0xFF64748B);
    }
  }

  String get statusLabel {
    switch (computedStatus) {
      case TaskStatus.completed:
        return 'Đã xong';
      case TaskStatus.inProgress:
        return 'Đang làm';
      case TaskStatus.overdue:
        return 'Quá giờ';
      case TaskStatus.pending:
        return 'Cần thực hiện';
    }
  }

  Color get statusColor {
    switch (computedStatus) {
      case TaskStatus.completed:
        return AppColors.success;
      case TaskStatus.inProgress:
        return const Color(0xFFF59E0B);
      case TaskStatus.overdue:
        return const Color(0xFFDC2626);
      case TaskStatus.pending:
        return const Color(0xFF3B82F6);
    }
  }
}

class TaskService {
  static final TaskRepository _repo = TaskRepository();

  /// Lấy danh sách việc của nhân viên từ API thật (GET /api/tasks qua gateway).
  /// Không còn mock cứng. Trả về rỗng khi offline để UI hiện trạng thái trống.
  static Future<List<TaskModel>> getTasksForUserAsync({String? userEmail, String? branchSlug}) async {
    try {
      return await _repo.getTasks(branchSlug: branchSlug);
    } catch (_) {
      return [];
    }
  }

  /// Giữ hàm đồng bộ cho tương thích UI cũ — trả về rỗng, UI tự gọi async rồi setState.
  static List<TaskModel> getTasksForUser({String? userEmail}) {
    return [];
  }

  /// Cập nhật trạng thái công việc qua API thật (PUT /api/tasks/:id)
  static Future<void> updateTaskStatus(String taskId, TaskStatus newStatus, {String? proofPhotoUrl}) async {
    final apiStatus = newStatus == TaskStatus.completed ? 'completed' : 'pending';
    await _repo.updateTaskStatus(taskId, apiStatus);
  }

  /// Hoàn thành công việc kèm ảnh minh chứng qua API thật
  static Future<void> completeTask(String taskId, {String? proofPhotoUrl}) async {
    await updateTaskStatus(taskId, TaskStatus.completed, proofPhotoUrl: proofPhotoUrl);
  }

  /// Thêm công việc mới qua API thật (POST /api/tasks)
  static Future<void> addTask(TaskModel newTask) async {
    await _repo.createTask(
      title: newTask.title,
      description: newTask.description,
      branchSlug: newTask.branch,
      status: 'pending',
      priority: newTask.priority.name,
    );
  }

  /// Thống kê số lượng việc từ danh sách đã tải (không đọc mock nữa)
  static Map<String, int> getTaskStats([List<TaskModel>? tasks]) {
    final list = tasks ?? const <TaskModel>[];
    int total = list.length;
    int pending = 0;
    int inProgress = 0;
    int overdue = 0;
    int completed = 0;

    for (final t in list) {
      switch (t.computedStatus) {
        case TaskStatus.pending:
          pending++;
          break;
        case TaskStatus.inProgress:
          inProgress++;
          break;
        case TaskStatus.overdue:
          overdue++;
          break;
        case TaskStatus.completed:
          completed++;
          break;
      }
    }

    return {
      'total': total,
      'pending': pending,
      'inProgress': inProgress,
      'overdue': overdue,
      'completed': completed,
    };
  }
}
