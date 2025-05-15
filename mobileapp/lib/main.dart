import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/home_screen.dart';
import 'notifications/notification_service.dart';
import 'package:awesome_notifications/awesome_notifications.dart';
import 'package:local_notifier/local_notifier.dart';
import 'dart:io';
import 'package:device_info_plus/device_info_plus.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await Firebase.initializeApp(); // تهيئة Firebase
  await NotificationService.initialize();
  await localNotifier.setup(appName: 'Clipboard App');
  // إشعار تجريبي عند بدء التطبيق باستخدام local_notifier
  LocalNotification(
    title: 'اختبار (local_notifier)',
    body: 'هذا إشعار تجريبي من local_notifier',
  ).show();

  // طلب صلاحية الإشعارات على أندرويد (API 33+)
  if (Platform.isAndroid) {
    final androidInfo = await DeviceInfoPlugin().androidInfo;
    if (androidInfo.version.sdkInt >= 33) {
      await AwesomeNotifications().requestPermissionToSendNotifications();
    }
  }

  // إعداد استقبال إشعارات FCM
  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  runApp(const MyApp());
}

// دالة لمعالجة الإشعارات في الخلفية
Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
  await NotificationService.showLocalNotification(
    message.notification?.title ?? 'تنبيه',
    message.notification?.body ?? '',
  );
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    // طلب صلاحية FCM عند التشغيل
    FirebaseMessaging.instance.requestPermission();
    // استقبال الإشعارات أثناء foreground
    FirebaseMessaging.onMessage.listen((RemoteMessage message) {
      NotificationService.showLocalNotification(
        message.notification?.title ?? 'تنبيه',
        message.notification?.body ?? '',
      );
    });
    return MaterialApp(
      title: 'Flutter Demo',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(seedColor: Colors.deepPurple),
      ),
      initialRoute: '/login',
      routes: {
        '/login': (context) => LoginScreen(),
        '/register': (context) => RegisterScreen(),
      },
    );
  }
}
