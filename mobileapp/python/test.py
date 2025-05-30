from winotify import Notification, audio
import socketio
import os
import pyperclip
import requests
import time

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
    # إرسال النص إلى API clipboard
    try:
        url = "http://192.168.1.12:3000/api/clipboard"
        headers = {
            "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxNGFhYWMwODg3Yzg5ZDgwYzYyYTkiLCJyb2xlIjoiNjdmZTVjZjdmM2RhMzgxYjdkZDQ3MGQzIiwiaWF0IjoxNzQ3NDEwOTk5fQ.DKgs-6bK-Kx-7VCRBLXSKLAq3TQE3s_6dZxd55xG8_Y",
            "Content-Type": "application/json"
        }
        data = {
            "content": body,
            "type": "text"
        }
        requests.post(url, json=data, headers=headers, timeout=3)
    except Exception as e:
        print("Clipboard API error:", e)
    # زر فتح التطبيق يفتح متصفح الإنترنت على رابط معين
    browser_url = "http://192.168.1.12:3000/clipboard"  # يمكنك تغييره للرابط المطلوب
    toast = Notification(app_id="Microsoft.Windows.Explorer",
                         title=title,
                         msg=body,
                         duration="short")
    toast.set_audio(audio.Default, loop=False)
    toast.add_actions(label="فتح المتصفح", launch=browser_url)
    toast.show()

# إعدادات API
API_URL = "http://192.168.1.12:3000/api/clipboard"
API_HEADERS = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJfaWQiOiI2ODAxNGFhYWMwODg3Yzg5ZDgwYzYyYTkiLCJyb2xlIjoiNjdmZTVjZjdmM2RhMzgxYjdkZDQ3MGQzIiwiaWF0IjoxNzQ3NDEwOTk5fQ.DKgs-6bK-Kx-7VCRBLXSKLAq3TQE3s_6dZxd55xG8_Y",
    "Content-Type": "application/json"
}

def monitor_clipboard():
    last_content = None
    while True:
        try:
            content = pyperclip.paste()
            if content and content != last_content:
                last_content = content
                data = {"content": content, "type": "text"}
                try:
                    requests.post(API_URL, json=data, headers=API_HEADERS, timeout=3)
                    print(f"Copied and sent: {content}")
                except Exception as e:
                    print("Clipboard API error:", e)
        except Exception as e:
            print("Clipboard read error:", e)
        time.sleep(1)  # تحقق كل ثانية

if __name__ == "__main__":
    user_id = "68014aaac0887c89d80c62a9"  # سيتم استبداله ديناميكياً من الباك اند
    sio.connect(f'http://192.168.1.12:3000?userId={user_id}', transports=['websocket'])
    print("Listening for notifications...")
    try:
        monitor_clipboard()
        sio.wait()
    except KeyboardInterrupt:
        print("Exiting...")
        sio.disconnect()
