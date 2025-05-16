from winotify import Notification, audio
import socketio
import os
import pyperclip

sio = socketio.Client()

@sio.event
def connect():
    print("Socket.IO Connected")

@sio.event
def disconnect():
    print("Socket.IO Disconnected")

@sio.on('notification')
def on_notification(data):
    try:
        title = data.get('title', 'تنبيه')
        body = data.get('body', str(data))
    except Exception:
        title = 'تنبيه'
        body = str(data)
    # نسخ نص الإشعار إلى الحافظة عند الاستقبال
    pyperclip.copy(body)
    # زر فتح التطبيق يفتح متصفح الإنترنت على رابط معين
    browser_url = "http://192.168.1.12:3000/clipboard"  # يمكنك تغييره للرابط المطلوب
    toast = Notification(app_id="Microsoft.Windows.Explorer",
                         title=title,
                         msg=body,
                         duration="short")
    toast.set_audio(audio.Default, loop=False)
    toast.add_actions(label="فتح المتصفح", launch=browser_url)
    toast.show()

if __name__ == "__main__":
    user_id = "68014aaac0887c89d80c62a9"
    sio.connect(f'http://192.168.1.12:3000?userId={user_id}', transports=['websocket'])
    print("Listening for notifications...")
    try:
        sio.wait()
    except KeyboardInterrupt:
        print("Exiting...")
        sio.disconnect()
