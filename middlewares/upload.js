const multer = require('multer');
const storage = multer.memoryStorage()

const upload = multer({
    storage: storage,
    fileFilter: (req, file, callback) => {
        if (file.mimetype == 'image/png' || file.mimetype == 'image/jpg' || file.mimetype == 'image/jpeg') {
            callback(null, true);
        } else {
            callback(null, false);
            callback(new Error('only png, jpg, and jped allowed to upload!'));
        }
    },
    onError: function (err, next) {
        console.log('error', err);
        next(err);
    }
});

module.exports = upload
//upload.single('image');


// const multer = require('multer');
// const upload = multer();

// module.exports = upload.single('image');
