const multer = require('multer');

exports.fileIjazah = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './images/berkas/ijazah');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
  });

  exports.fileKtp = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './images/berkas/ktp');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
  });

  exports.fileSuratlamaran = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './images/berkas/surat_lamaran');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
  });

  exports.fileLampiran = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, './images/berkas/lampiran');
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
  });
