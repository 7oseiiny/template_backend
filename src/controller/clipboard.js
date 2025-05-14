const Clipboard = require("../model/clipboard");
const notification = require('../notifications/index');

exports.createClipboard = async (req, res) => {
    try {
        req.body.user = req.user._id;
        const filePath = req.file?.path||req.file?.location
        req.body.content = filePath||req.body.content; // المسار المحلي للصورة
        let clipboard = await Clipboard.create(req.body);
        res.send({ message: "clipboard created", data: clipboard });
        notification.notify(req.user._id,'clipboard created')
        
    } catch (err) {
        res.status(500).send({ error: err.message });
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

