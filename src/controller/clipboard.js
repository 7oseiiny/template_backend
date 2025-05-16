const { default: axios } = require("axios");
const Clipboard = require("../model/clipboard");
const notification = require('../notifications/index');
exports.createClipboard = async (req, res) => {
    try {
        req.body.user = req.user._id;
        const filePath = req.file?.path || req.file?.location;
        req.body.content = filePath || req.body.content;

        const clipboard = await Clipboard.create(req.body);

        // ابعت الرد للمستخدم مباشرة
        res.send({ message: "clipboard created", data: clipboard });

        // شغل النوتيفيكيشن والإشعار في الخلفية
        notification.notify(req.user._id, req.body.content);

        // Firebase admin init
        const admin = require('firebase-admin');
        const serviceAccount = require('./clipboard-e0270-0d5e87c13be7.json');

        // تأكد من عدم إعادة التهيئة إذا كانت مهيأة من قبل
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.cert(serviceAccount),
            });
        }

        const message = {
            notification: {
                title: 'Hello',
                body: req.body.content,
            },
            token: 'cKDA_Kv4QjeNtjCy8s2C39:APA91bHHvopiZxBfBdNfLuobcsCSyFLbQKJh8E3VxsLPTYJ-zVbkoOC6_m7224EtITM77gagNgPQQvV2N7nBueaqsyf8eVMJDzPqO6qRd7F_gi4MWXdqCUM',
        };

        // إرسال الإشعار
        admin.messaging().send(message)
            .then((response) => {
                console.log('Successfully sent message:', response);
            })
            .catch((error) => {
                console.error('Error sending message:', error);
            });

    } catch (err) {
        // إرسال الرد لو حصل خطأ في إنشاء الكليب
        if (!res.headersSent) {
            res.status(500).send({ error: err.message });
        } else {
            console.error('حدث خطأ بعد إرسال الرد:', err);
        }
    }
};

exports.getAllClipboard = async (req, res) => {
    try {
        const userId = req.user._id;
        const limit = parseInt(req.query.limit) || 5;
        const skip = parseInt(req.query.skip) || 0;

        const clipboards = await Clipboard.find({ user: userId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await Clipboard.countDocuments({ user: userId });

        res.send({
            message: "All clipboards",
            data: clipboards,
            total
        });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};


exports.deleteClipboard = async (req, res) => {
    try {
        
        let clipboards = await Clipboard.deleteOne({_id:req.body._id});
        res.send({ message: "deleted", data: clipboards });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

