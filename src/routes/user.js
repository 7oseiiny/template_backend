const express=require('express');
const router = express.Router();
const userController= require('../controller/user');
const mw= require('../middlewares/authMiddleware');
const multer= require('../utils/multer');
const s3= require('../utils/multerS3');


router.options('/', 
    userController.options
);

router.get('/', 
    userController.getall
);

router.get('/getOne', 
    userController.getOne
);

router.get('/getpass',
    mw.authMiddleware,
    mw.authorize("super admin"),
    userController.getPassword
);

router.put('/edit-image',
    mw.authMiddleware,
    multer.upload.single('profileImage'), 
    userController.editImage
);

router.put('/edit-image-s3',
    mw.authMiddleware,
    s3.upload.single('profileImage'), 
    userController.editImage
);

router.delete('/remove-image-s3',
    mw.authMiddleware, 
    userController.removeImage
);

router.post('/windows-script',
    mw.authMiddleware, 
    userController.windowsScript 
);

router.get('*', (req,res,err)=>{
    res.send('user api not found')
});

module.exports =router