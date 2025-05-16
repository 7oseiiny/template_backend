import socketio
from win10toast import ToastNotifier

# إعداد التوستر للإشعارات
toaster = ToastNotifier()

sio = socketio.Client()

@sio.event
def connect():
    print("Socket.IO Connected")

@sio.event
def disconnect():
    print("Socket.IO Disconnected")

@sio.on('notification')  # اسم الحدث كما في الباك اند

def on_notification(data):
    try:
        title = data.get('title', 'تنبيه')
        body = data.get('body', str(data))
    except Exception:
        title = 'تنبيه'
        body = str(data)
    toaster.show_toast(title, body, duration=10, threaded=True)

if __name__ == "__main__":
    # عدل الرابط ليكون رابط Socket.IO الخاص بك
    user_id = "68014aaac0887c89d80c62a9"  # ضع هنا userId المطلوب
    sio.connect(f'http://192.168.1.12:3000?userId={user_id}', transports=['websocket'])
    print("Listening for notifications...")
    try:
        sio.wait()
    except KeyboardInterrupt:
        print("Exiting...")
        sio.disconnect()
