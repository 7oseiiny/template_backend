const userModel = require('../model/user');
const { deleteFileFromS3 } = require('../utils/multerS3');
const {  removeFieldsProject, removeFieldsFind } = require('../utils/reusableFunctions');

exports.options =async (req, res, err) => {
    res.send({
        message: "user document",
        data: [
            {
                url: "/api/users",
                verb: "GET",
                description: "Get all users"
            },
            {
                url: "/api/users/:id",
                verb: "GET",
                description: "Get a user by id"
            },
            {
                url: "/api/users",
                verb: "POST",
                description: "Create a new user"
            }
        ]
    })
}


exports.getOne = async (req, res) => {
    let project = removeFieldsProject(["password", "email"],req.body.project)
    let findObj = removeFieldsFind(["password", "email"],req.body)

    try {
        let user = await userModel.findOne(findObj, project);
        res.send({ message: "Retrieved", data: user });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

exports.getPassword = async (req, res) => {
    let permissions= req.user.role.permissions
    let project = `email ${permissions.includes('getpassd')?'password':''}`;
    
    

    try {
        let user = await userModel.findOne({_id:req.user._id}, project);
        res.send({ message: "getpass", data: user });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

exports.getall = async (req, res) => {
    let sortObj = req.body.sort 
    let project = removeFieldsProject(["password", "email"],req.body.project)
    let findObj = removeFieldsFind(["password", "email"],req.body)
    
    try {
        let user = await userModel.find(findObj, project).sort(sortObj);
        res.send({ message: "Retrieved", data: user });
    } catch (err) {
        res.status(500).send({ error: err.message });
    }
};

exports.editImage = async (req, res) => {
    try {
        const imagePath = req.file.path||req.file.location ; // المسار المحلي للصورة
        let user  = await userModel.findOneAndUpdate({_id:req.user._id}, { profileImage: imagePath });
        deleteFileFromS3(user.profileImage)
    
        res.json({ success: true, message: imagePath });
      } catch (error) {
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء رفع الصورة', error });
      }
};


exports.removeImage = async (req, res) => {
    try {
        let user = await userModel.findOne({_id: req.user._id});
        deleteFileFromS3(user.profileImage)
        res.json({ success: true, message: "deleted" });
      } catch (error) {
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء رفع الصورة', error });
      }
};

exports.windowsScript = async (req, res) => {
    try {
        const fs = require('fs');
        const { exec } = require('child_process');
        const path = require('path');

        const userId = req.user._id;
        // اقرأ قالب السكريبت من ملف template
        let script = fs.readFileSync('mobileapp/python/socketio_notification_service.py', 'utf8');
        // استبدل مكان الـ userId في القالب
        script = script.replace('USER_ID_PLACEHOLDER', userId);
        // أرسل الملف للمستخدم
        res.setHeader('Content-Disposition', `attachment; filename=socketio_notification_service_${userId}.py`);
        res.setHeader('Content-Type', 'text/x-python');
        res.send(script);
      } catch (error) {
        res.status(500).json({ success: false, message: 'حدث خطأ أثناء رفع الصورة', error });
      }
};



