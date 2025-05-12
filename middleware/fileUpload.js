const multer = require('multer');
const path = require('path');

// Set up storage for uploaded images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images'); // Save images in public/uploads
    },
    filename: function (req, file, cb) {
        const name = file.originalname.split('.')[0]; // Remove the extension
    const ext = path.extname(file.originalname);
    const uniqueName = name + '-' + Date.now() + ext; 
    cb(null, uniqueName);
    }
});

// File filter to allow only specific image types
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif'];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only JPG, JPEG, PNG, and GIF images are allowed'), false);
    }
};

// Configure multer with storage, file filter, and file size limit
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 2 * 1024 * 1024 } // Limit file size to 2MB
}).single('image'); // Expecting a single file named 'image'

module.exports = upload;
