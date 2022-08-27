const { promise } = require('bcrypt/promises');
const db = require('../util/database');

module.exports = class User{
    constructor(){
    }

    registerUser(nama,username,password){
        //return console.log(password).promise()
        return db.execute('insert into tb_pelamar(nama,username,password) VALUES(?,?,?)',[nama,username,password]);
    }

    static loginUser(username,password){
        return db.execute('select * from  tb_pelamar where username=?',[username]);
    }

    postBiodata(id_pelamar,nama_lengkap,tgl_lahir,tempat_lahir,telepon,alamat,pendidikan,foto){
        return db.execute('insert into tb_biodata(id_pelamar,nama_lengkap,tgl_lahir,tempat_lahir,telepon,alamat,pendidikan,foto,created_at) values(?,?,?,?,?,?,?,?,?)',
                        [id_pelamar,nama_lengkap,tgl_lahir,tempat_lahir,telepon,alamat,pendidikan,foto,new Date().toISOString().slice(0,10)]);
    }

    static getBiodataUser(id_pelamar){
        return db.execute(`select * from tb_biodata 
                            inner join tb_pelamar on tb_biodata.id_pelamar = tb_pelamar.id_pelamar 
                            where tb_biodata.id_pelamar=?`,[id_pelamar]);
    }

    static getBiodata(id_pelamar){
        return db.execute(`select * from tb_biodata where tb_biodata.id_pelamar=?`,[id_pelamar])
    }

    static getBerkas(id_pelamar){
       return db.execute(`select * from tb_berkas where id_pelamar=?`,[id_pelamar])
    }

    static uploadBerkas(id_pelamar,surat_lamaran,ijazah,ktp,lampiran){
        return db.execute('insert into tb_berkas(id_pelamar,surat_lamaran,ijazah,ktp,lampiran) values(?,?,?,?,?)',[id_pelamar,surat_lamaran,ijazah,ktp,lampiran]);
    }

    static updateSession(session,username){  
        return db.execute('update tb_pelamar set session=? where username = ?',[session,username]);
    }

    static insertSeleksi(id_pelamar){
        return db.execute('insert into tb_seleksi(id_pelamar,seleksi_berkas,seleksi_soal,seleksi_wawancara) values(?,1,1,1)',[id_pelamar]);
    }

    static getStatusPelamar(id){
        return db.execute('select * from tb_seleksi where id_pelamar=?',[id]);
    }

    static getSoal(){
        return db.execute('select * from tb_soal');
    }

    static addNilai(id_pelamar,benar,salah,persentase,tanggal){
        return db.execute('insert into tb_nilai(id_pelamar,benar,salah,persentase,tanggal) values(?,?,?,?,?)',[id_pelamar,benar,salah,persentase,tanggal]);
    }

    static updateNilai(benar,salah,persentase,tanggal,id_pelamar){
        return db.execute('update tb_nilai set benar=?,salah=?,persentase=?,tanggal=? where id_pelamar=?',[benar,salah,persentase,tanggal,id_pelamar]);
    }

    static updateSeleksiSoal(status,id_pelamar){
         return db.execute('update tb_seleksi set seleksi_soal=? where id_pelamar=?',[status,id_pelamar])
    }

    static inputJawaban(id_pelamar,id_soal,pilihan){
        return db.execute('insert into tb_jawaban(id_pelamar,id_soal,jawaban) values(?,?,?)',[id_pelamar,id_soal,pilihan]);
    }

    static getJawaban(id_pelamar){
        return db.execute('select * from tb_jawaban where id_pelamar=?',[id_pelamar]);
    }

    static getNilai(id_pelamar){
        return db.execute('select * from tb_nilai where id_pelamar=?',[id_pelamar])
    }
    
    static jadwalWawancara(){
        return db.execute('select * from tb_wawancara');
    }

}