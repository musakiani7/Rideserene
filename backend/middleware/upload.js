const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Create subdirectories for different file types
const dirs = ['profiles', 'licenses', 'documents', 'cars', 'insurance', 'chat'];
dirs.forEach(dir => {
  const dirPath = path.join(uploadDir, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
});

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let folder = 'uploads/';
    
    switch (file.fieldname) {
      case 'profilePicture':
        folder += 'profiles/';
        break;
      case 'driverLicense':
        folder += 'licenses/';
        break;
      case 'identityDocument':
        folder += 'documents/';
        break;
      case 'carPictures':
        folder += 'cars/';
        break;
      case 'insuranceDocument':
        folder += 'insurance/';
        break;
      case 'chatImage':
      case 'image':
        folder += 'chat/';
        break;
      default:
        folder += 'others/';
    }
    
    cb(null, folder);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // For chat images and profile pictures, only allow image types
  if (file.fieldname === 'chatImage' || file.fieldname === 'image' || file.fieldname === 'profilePicture') {
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype && (file.mimetype.startsWith('image/') || allowedImageTypes.test(file.mimetype));

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (.png, .jpg, .jpeg, .gif, .webp) are allowed!'));
    }
    return;
  }

  // For other files, allow images and PDFs
  const allowedTypes = /jpeg|jpg|png|pdf/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only .png, .jpg, .jpeg and .pdf files are allowed!'));
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

// Chat-specific upload (images only, 10MB max)
const chatImageUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'uploads/chat/');
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, 'chat-' + uniqueSuffix + path.extname(file.originalname));
    }
  }),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max for chat images
  },
  fileFilter: (req, file, cb) => {
    // More lenient check - accept if mimetype is image/ OR if extension matches
    const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedImageTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = file.mimetype && file.mimetype.startsWith('image/');

    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files (.png, .jpg, .jpeg, .gif, .webp) are allowed!'));
    }
  },
});

module.exports = { upload, chatImageUpload };
