import 'package:dio/dio.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:awesome_notifications/awesome_notifications.dart';
import 'dart:async';

class ApiService {
  final Dio _dio = Dio(
    BaseOptions(
      baseUrl: dotenv.env['API_BASE_URL'] ?? 'http://192.168.1.12:3000/api/',
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ),
  );

  String? token;

  void setToken(String? t) {
    token = t;
    if (token != null) {
      _dio.options.headers['Authorization'] = 'Bearer $token';
    } else {
      _dio.options.headers.remove('Authorization');
    }
  }

  Future<Response> post(
    String path,
    Map<String, dynamic> data, {
    Map<String, dynamic>? headers,
  }) async {
    return await _dio.post(
      path,
      data: data,
      options: headers != null ? Options(headers: headers) : null,
    );
  }

  Future<Response> get(String path, {Map<String, dynamic>? headers}) async {
    return await _dio.get(
      path,
      options: headers != null ? Options(headers: headers) : null,
    );
  }

  Timer? _pollingTimer;
  void startNotificationPolling() {
    _pollingTimer?.cancel();
    _pollingTimer = Timer.periodic(const Duration(seconds: 60), (_) async {
      try {
        final response = await get(
          'notifications/latest',
        ); // عدّل المسار حسب باك اندك
        final notification = response.data;
        if (notification != null && notification['title'] != null) {
          AwesomeNotifications().createNotification(
            content: NotificationContent(
              id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
              channelKey: 'basic_channel',
              title: notification['title'],
              body: notification['body'] ?? '',
            ),
          );
        }
      } catch (_) {}
    });
  }

  void stopNotificationPolling() {
    _pollingTimer?.cancel();
  }
}
