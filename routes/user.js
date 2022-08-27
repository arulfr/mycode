const express = require('express');

const router = express.Router();

const userController = require('../controller/userController');

router.get('/',userController.getHome);

router.get('/register',userController.getRegister);

router.post('/register',userController.postRegister);

router.get('/login',userController.getLogin);

router.post('/login',userController.postLogin);

router.get('/getBiodata',userController.getBiodata);

router.post('/postBiodata',userController.postBiodata);

router.get('/uploadBerkas',userController.uploadBerkas);

router.post('/uploadBerkas',userController.postBerkas);

router.get('/proses_rekrutmen',userController.prosesRekrutmen);

router.post('/logout',userController.postLogout);

router.get('/soal_seleksi',userController.soalSeleksi);

router.post('/jawabSoal',userController.jawabSoal);

router.get('/jadwal_wawancara',userController.jadwalWawancara)

module.exports = router;