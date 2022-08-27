const express = require('express');

const router = express.Router();

const adminController = require('../controller/adminController');

router.get('/',adminController.getIndex);

router.get('/add',adminController.pushAdmin);

router.post('/postLogin',adminController.postLogin);

router.post('/addAdmin',adminController.addAdmin);

router.get('/login',adminController.getLogin);

router.get('/pelamar',adminController.getPelamar);

router.get('/cekBerkas/:idPelamar',adminController.cekBerkas);

router.get('/Berkaslamaran/:idPelamar/:kodeBerkas',adminController.getBerkasLamaran);

router.get('/statusPelamar/:idPelamar',adminController.statusPelamar);

router.post('/konfimasiBerkas',adminController.konfirmasiBerkas);

router.get('/soal_seleksi',adminController.soalSeleksi);

router.get('/input_soal',adminController.inputSoal);

router.get('/peserta_lulus',adminController.pesertaLulus);

router.post('/jadwal_wawancara',adminController.jadwalWawancara);

router.get('/data_wawancara',adminController.dataWawancara);

router.get('/input_ket_wawancara/:idPelamar',adminController.inputKetWawancara);

router.post('/postWawancara',adminController.postWawancara);

router.post('/postSoal',adminController.postSoal);

router.get('/dataKaryawan',adminController.dataKaryawan);

router.get('/input_data_karyawan',adminController.inputDataKaryawan);

router.post('/inputKaryawan',adminController.inputKaryawan);

router.get('/updateKaryawan/:idKaryawan',adminController.updateKaryawan);

router.post('/updateKaryawan',adminController.updatePostKaryawan);

router.get('/deleteKaryawan/:idKaryawan',adminController.deleteKaryawan);

router.get('/proses_laporan/:page',adminController.prosesLaporan);

router.post('/laporan',adminController.laporan);

router.post('/logout',adminController.postLogout);

module.exports = router;