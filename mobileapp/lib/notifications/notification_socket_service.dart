import 'package:socket_io_client/socket_io_client.dart' as IO;
import 'package:awesome_notifications/awesome_notifications.dart';
import 'package:local_notifier/local_notifier.dart';

class NotificationSocketService {
  IO.Socket? _socket;

  void connect({required String userId, required String serverUrl}) {
    _socket = IO.io(
      serverUrl,
      IO.OptionBuilder()
          .setTransports(['websocket'])
          .disableAutoConnect()
          .setQuery({'userId': userId})
          .build(),
    );
    _socket!.connect();
    _socket!.onConnect((_) {
      print('Socket connected');
    });
    _socket!.on('notification', (data) {
      print('Notification data: $data'); // لعرض الداتا في الكونسول
      // إذا كانت الداتا نص فقط
      if (data is String) {
        // إشعار local_notifier (ويندوز)
        LocalNotification(title: 'تنبيه', body: data).show();
        // إشعار awesome_notifications (أندرويد)
        AwesomeNotifications().createNotification(
          content: NotificationContent(
            id: DateTime.now().millisecondsSinceEpoch.remainder(10000),
            channelKey: 'basic_channel',
            title: 'تنبيه',
            body: data,
          ),
        );
      } else if (data is Map) {
        LocalNotification(
          title: data['title'] ?? 'تنبيه',
          body: data['body'] ?? '',
        ).show();
        AwesomeNotifications().createNotification(
          content: NotificationContent(
            id: DateTime.now().millisecondsSinceEpoch.remainder(100000),
            channelKey: 'basic_channel',
            title: data['title'] ?? 'تنبيه',
            body: data['body'] ?? '',
          ),
        );
      }
    });

    _socket!.onDisconnect((_) => print('Socket disconnected'));
  }

  void disconnect() {
    _socket?.disconnect();
    _socket = null;
  }
}
