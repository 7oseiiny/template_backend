import 'package:awesome_notifications/awesome_notifications.dart';
import 'package:local_notifier/local_notifier.dart';

class NotificationService {
  static Future<void> initialize() async {
    AwesomeNotifications().initialize(null, [
      NotificationChannel(
        channelKey: 'basic_channel',
        channelName: 'Basic Notifications',
        channelDescription: 'Notification channel for app',
        importance: NotificationImportance.High,
      ),
    ]);
  }

  static Future<void> showLocalNotification(String title, String body) async {
    // إشعار AwesomeNotifications (للأندرويد)
    await AwesomeNotifications().createNotification(
      content: NotificationContent(
        id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
        channelKey: 'basic_channel',
        title: title,
        body: body,
      ),
    );
    // إشعار local_notifier (لويندوز)
    LocalNotification(title: title, body: body).show();
  }

  static Future<String?> getToken() async {
    // لا يوجد توكن على ويندوز
    return null;
  }
}
