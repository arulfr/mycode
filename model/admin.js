const db = require('../util/database');

module.exports = class Admin{
    // constructor(id,username,password){
    //     this.id = id;
    //     this.username = username ;
    //     this.password = password;
    // }

    save(username,password){
        //admin.push(this)
        return db.execute('INSERT INTO tb_admin(username,password) VALUES(?,?)',[username,password]);
    }

    static fetchAdmin(){
        return db.execute("SELECT * FROM tb_admin");
    }

    static loginAdmin(username,password){
        return db.execute('select * from  tb_admin where username=?',[username]);
    }

    static getPelamar(){
        return db.execute('select * from tb_biodata order by id_biodata desc');
    }

    static getBerkas(id){
        return db.execute('select * from tb_berkas where id_pelamar=?',[id]);
    }

    static getStatusPelamar(id){
        return db.execute('select * from tb_seleksi where id_pelamar=?',[id]);
    }

    static getStatusPelamarAll(){
        return db.execute('select * from tb_seleksi');
    }

    static konfimasiBerkas(seleksi_berkas,id_pelamar){
        return db.execute('update tb_seleksi set seleksi_berkas=? where id_pelamar = ?',[seleksi_berkas,id_pelamar]);
    }

    static getSeleksi(id){
        return db.execute('select * from tb_seleksi where id_pelamar=?',[id]);
    }

    static soalSeleksi(){
        return db.execute('select * from tb_soal order by id_soal desc');
    }

    static postSoal(soal,gambar,pil_a,pil_b,pil_c,pil_d,kunci){
        return db.execute('insert into tb_soal(soal,gambar,pil_a,pil_b,pil_c,pil_d,kunci) values(?,?,?,?,?,?,?)',[soal,gambar,pil_a,pil_b,pil_c,pil_d,kunci]);
    }

    static pesertaLulus(){
        return db.execute('select * from tb_seleksi where seleksi_berkas = 2 and seleksi_soal=2 and seleksi_wawancara = 1');
    }

    static getPelamarById(id){
        return db.execute('select * from tb_biodata where id_pelamar=? order by id_biodata desc',[id]);
    }

    static jadwalWawancara(id_pelamar,tgl_wawancara,jam_wawancara,lokasi){
        return db.execute('insert into tb_wawancara(id_pelamar,tgl_wawancara,jam_wawancara,lokasi) values(?,?,?,?)',[id_pelamar,tgl_wawancara,jam_wawancara,lokasi]);
    }

    static dataWawancara(){
        return db.execute('select * from tb_wawancara')
    }

    static postWawancara(id_pelamar,keterangan,pilihan){
         db.execute('update tb_wawancara set keterangan=? where id_pelamar=?',[keterangan,id_pelamar]);
       return db.execute('update tb_seleksi set seleksi_wawancara=? where id_pelamar=?',[pilihan,id_pelamar]);
    }

    static dataKaryawan(){
        return db.execute('select * from tb_karyawan order by id_karyawan desc');
    }

    static inputKaryawan(id_biodata,masuk_kerja,status_aktif,status_karyawan){
        return db.execute('insert into tb_karyawan(id_biodata,masuk_kerja,status_aktif,status_karyawan) values(?,?,?,?)',[id_biodata,masuk_kerja,status_aktif,status_karyawan])
    }

    static dataKaryawanLimit(limit){
        return db.execute('select * from tb_karyawan order by id_karyawan desc limit ?',[limit]);
    }

    static inputKontrak(id_karyawan,id_biodata,tgl_awal,tgl_akhir){
        return db.execute('insert into tb_kontrak(id_karyawan,id_biodata,tgl_awal,tgl_akhir) values(?,?,?,?)',[id_karyawan,id_biodata,tgl_awal,tgl_akhir]);
    }

    static dataKontrak(){
        return db.execute('select * from tb_kontrak');
    }

    static dataKontrakById(id){
        return db.execute('select * from tb_kontrak where id_karyawan = ?',[id]);
    }

    static getKaryawanById(id_karyawan){
        return db.execute('select * from tb_karyawan where id_karyawan = ?',[id_karyawan]);
    }

    static updateKontrak(id_karyawan,tgl_awal,tgl_akhir){
        return db.execute('update tb_kontrak set tgl_awal = ?, tgl_akhir = ? where id_karyawan = ?',[tgl_awal,tgl_akhir,id_karyawan]);
    }

    static updatePostKaryawan(id_karyawan,id_biodata,status_aktif,status_karyawan,nama_lengkap,alamat,pendidikan,telepon){
        db.execute('update tb_karyawan set status_aktif = ?, status_karyawan = ? where id_karyawan = ?',[status_aktif,status_karyawan,id_karyawan]);
        return db.execute('update tb_biodata set nama_lengkap=?,alamat=?,pendidikan=?,telepon=? where id_biodata=?',[nama_lengkap,alamat,pendidikan,telepon,id_biodata]);
    }

    static deleteKontrak(id_karyawan){
        return db.execute('delete from tb_kontrak where id_karyawan = ?',[id_karyawan]);
    }   

    static deleteKaryawan(id_karyawan){
        return db.execute('delete from tb_karyawan where id_karyawan = ?',[id_karyawan]);
    }

    static getPelamarByDate(tgl_awal,tgl_akhir){
        return db.execute('select * from tb_biodata where created_at between ? and ?',[tgl_awal,tgl_akhir]);
    }

    static getNilai(){
        return db.execute('select * from tb_nilai');
    }

}