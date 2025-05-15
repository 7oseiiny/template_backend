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

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await dotenv.load(fileName: ".env");
  await NotificationService.initialize(); // هذا السطر مهم جداً
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

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
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
