const Admin = require('../model/admin');
const bcrypt = require('bcrypt');
const fs = require('fs');
const res = require('express/lib/response');

exports.getIndex = (req,res,next)=>{
    //res.send('<h1>Hello World</h1>');
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }
    Admin.fetchAdmin()
    .then(([rows,fieldData])=>{
            //console.log(rows);
            res.render('template/base',{
                    admin:rows,
                    docTitle:'Index',
                    getUrl:'index',
                    path:'/index'
                });
    })
    .catch(err=>console.log(err))
   
};

exports.postLogin = (req,res,next) =>{
    Admin.loginAdmin(req.body.username,req.body.password).then( async([rows,fieldData])=>{
        if(rows==false){
            res.redirect('/admin/login');
        }
        if(bcrypt.compareSync(req.body.password,rows[0].password)){
            req.session.loggedAdmin = true;
            res.redirect('/admin');
        }else{
            res.redirect('/admin/login');
        }
    })
}

exports.pushAdmin = (req,res,next)=>{
    res.render('template/base',{
        docTitle:'Index',
        path:'/admin/add',
        getUrl:'add'
    })
}

exports.addAdmin = (req,res,next)=>{
    // console.log(req.body);
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password,salt);
    const admin = new Admin();
    admin.save(req.body.username,hash).then(()=>{
        res.redirect('/admin');
    }).catch(err=>console.log(err));
}

exports.getLogin = (req,res,next) =>{
    res.render('admin/login',{
        path:'/admin/login'
    })
}

exports.getPelamar = (req,res,next) =>{
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }
    Admin.getPelamar().then(([rows,fieldData])=>{
        //console.log(JSON.stringify(new Date(rows[0].created_at)))
            res.render('template/base',{
                path:'/admin/pelamar',
                getUrl:'pelamar',
                query : rows
            });
    })
}

exports.cekBerkas = async(req,res,next) =>{
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    const id = req.params.idPelamar;
    let dataBerkas=[];
    await Admin.getBerkas(id).then(([rows,fieldData])=>{
        if(rows.length != 0){
            dataBerkas.push(rows[0]);
        }else{
            dataBerkas = null;
        }
        
    });
    if(dataBerkas != null){
            await Admin.getSeleksi(id).then(([rows,fieldData])=>{
                //console.log(dataBerkas)
                dataBerkas.map(row=>{
                    row.seleksi = [];
                    row.seleksi.push(rows[0]);
                });
            })
    }

   //console.log(dataBerkas);

    await res.render('template/base',{
        path:'/admin/cekBerkas',
        getUrl:'cekBerkas',
        data:dataBerkas
    });
    
}

exports.getBerkasLamaran = async(req,res,next) =>{
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }
    const id = await req.params.idPelamar;
    const berkas = await req.params.kodeBerkas;
    let data = await [];
    await Admin.getBerkas(id).then(([rows,fieldData])=>{
        data.push(rows[0]);        
    })
    await Admin.getPelamar(id).then(([rows,fieldData])=>{
        data.forEach(row=>{
            row.biodata = [];
            row.biodata.push(rows[0]);
        })
    })

    let file;
    if(berkas=='suratLamaran'){ 
        file = fs.createReadStream(data[0].surat_lamaran);
        res.setHeader('Content-Disposition', 'attachment; filename=surat_lamaran_'+data[0].biodata[0].nama_lengkap+'.pdf');
    }else if(berkas=='ijazah'){
        file = fs.createReadStream(data[0].ijazah);
        res.setHeader('Content-Disposition', 'attachment; filename=ijazah_'+data[0].biodata[0].nama_lengkap+'.pdf');
    }else if(berkas=='ktp'){
        file = fs.createReadStream(data[0].ktp);
        res.setHeader('Content-Disposition', 'attachment; filename=ktp_'+data[0].biodata[0].nama_lengkap+'.pdf');
    }else if(berkas=='lampiran'){
        file = fs.createReadStream(data[0].lampiran);
        res.setHeader('Content-Disposition', 'attachment; filename=lampiran_'+data[0].biodata[0].nama_lengkap+'.pdf');
    }
    res.setHeader('Content-Type', 'application/pdf');
    file.pipe(res);
}


exports.statusPelamar = async(req,res,next) => {
    const id = req.params.idPelamar;
    Admin.getStatusPelamar(id).then(([rows,fieldData])=>{
        res.render('template/base',{
            path:'/admin/statusPelamar',
            getUrl:'statusPelamar',
            data : rows
        });
    })
}


exports.konfirmasiBerkas = (req,res,next) =>{
    Admin.konfimasiBerkas(req.body.seleksi_berkas,req.body.id_pelamar).then(()=>{
        return res.redirect(`/admin/cekBerkas/${req.body.id_pelamar}`)
    })
}

exports.soalSeleksi = (req,res,next) =>{
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    Admin.soalSeleksi().then(([rows,fieldData])=>{
        res.render('template/base',{
            path:'/admin/soal_seleksi',
            getUrl:'dataSoal',
            data:rows,
        })
    })
}

exports.inputSoal = (req,res,next) =>{
    
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    res.render('template/base',{
        getUrl:'inputSoal',
    });
}

exports.postSoal = (req,res,next) =>{
    let gambar;

    req.files.gambar == undefined ? gambar = '' : gambar = req.files.gambar[0].path;

    Admin.postSoal(req.body.soal,gambar,req.body.pil_a,req.body.pil_b,req.body.pil_c,req.body.pil_d,req.body.kunci).then(()=>{
        res.redirect('/admin/soal_seleksi');
    })
    
}

exports.pesertaLulus = async(req,res,next)=>{
    
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    let data = [];
    await Admin.pesertaLulus().then(([rows,fieldData])=>{
        rows.forEach(row=>{
            row.biodata = [];
            data.push(row);
        })
    })

    await Admin.getPelamar().then(([rows,fieldData])=>{
        data.forEach(i=>{
            let biodata = rows.find(row=>row.id_pelamar == i.id_pelamar);
            i.biodata.push(biodata);
        }) 
    })

    console.log(data);

   await res.render('template/base',{
        getUrl:'pesertaLulus',
        data:data
    })
}

exports.jadwalWawancara = (req, res,next) => {
    let index = 0;
    // return res.json(req.body)
    // let tgl = req.body.tgl_wawancara.split(" ");
    req.body.id_pelamar.forEach(i=>{
        Admin.jadwalWawancara(i,req.body.tgl_wawancara,req.body.jam_wawancara,req.body.lokasi).then(()=>{
            res.redirect('/admin/peserta_lulus');
        })
        index++;
    })
    
}

exports.inputKetWawancara = (req,res,next) => {
    
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    res.render('template/base',{
        getUrl:'inputKetWawancara',
        id:req.params.idPelamar,
    })
}

exports.dataWawancara = async(req,res,next) =>{
    
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }
    
    let data = [];
    await Admin.dataWawancara().then(([rows,fieldData])=>{
        rows.forEach(row=>{
            row.biodata = [];
            row.seleksi = [];
            data.push(row);
        })
    })

    await Admin.getPelamar().then(([rows,fieldData])=>{
        if(!req.session.loggedAdmin){
            return res.redirect('/admin/login');
        }
        //console.log(rows)
        data.forEach(row=>{
            let filData  = rows.find(i=>i.id_pelamar == row.id_pelamar);
            //console.log(filData)
            row.biodata.push(filData)
        })
        //
    });

    await Admin.getStatusPelamarAll().then(([rows,fieldData])=>{
        if(!req.session.loggedAdmin){
            return res.redirect('/admin/login');
        }
        data.forEach(row=>{
            let filData = rows.find(i=>i.id_pelamar == row.id_pelamar);
            row.seleksi.push(filData);
        })
    })

    //console.log(data[0].seleksi[0]);
    //return res.json(data);
    //res.send({success:true,message:'berhasi',data:data});
    res.render('template/base',{
        getUrl:'dataWawancara',
        data:data
    })
    
}


exports.postWawancara = (req,res,next) => {
    Admin.postWawancara(req.body.id_pelamar,req.body.keterangan,req.body.pilihan[0]).then(()=>{
        res.redirect('/admin/data_wawancara');
    })
}

exports.dataKaryawan = async(req, res) => {
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }
    
    let data = [];

    await Admin.dataKaryawan().then(([rows,fieldData])=>{
        data.push(...rows);
    })
    
    await Admin.getPelamar().then(([rows,fieldData])=>{
        data.forEach(index=>{
            index.biodata = [];
            index.status_aktif == 1 ? index.status_aktif ='Aktif' :index.status_aktif ==2 ? index.status_aktif = 'non AKtif' :'';
            index.status_karyawan == 1 ? index.status_karyawan ='Kontrak' :index.status_karyawan == 2 ? index.status_karyawan = 'Tetap' :'';
            let filData = rows.find(i=>i.id_biodata == index.id_biodata);
            index.biodata.push(filData) 
        })
    })

    await Admin.dataKontrak().then(([rows,fieldData])=>{
        data.forEach(index=>{
            index.tgl_awal = '-'
            index.tgl_akhir = '-'
            let cek = rows.some(row=>row.id_karyawan == index.id_karyawan);
            if(cek){
                let kontrak = rows.find(row => row.id_karyawan == index.id_karyawan)
                index.tgl_awal = kontrak.tgl_awal.split('-').reverse().join('-');
                index.tgl_akhir =  kontrak.tgl_akhir.split('-').reverse().join('-');
            }
        })
    })

    res.render('template/base',{
        getUrl:'dataKaryawan',
        data:data
    })


}

exports.inputDataKaryawan = async(req, res) => {
    
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

        let data = [];
        let karyawan = [];
        
        await Admin.dataKaryawan().then(([rows,fieldData])=>{
            karyawan.push(...rows);
        })
 
        await Admin.getStatusPelamarAll().then(([rows,fieldData])=>{
            //console.log(rows)
            let filData = rows.filter((i)=>i.seleksi_wawancara == 2);
            filData.forEach(row=>{
                row.biodata = [];
                data.push(row);
            })
        })
    
        await Admin.getPelamar().then(([rows,fieldData])=>{
            data.forEach(async(row,index)=>{
                let filData  = await rows.find(i=>i.id_pelamar == row.id_pelamar);
                let cek;

                if(karyawan.length > 0){
                    cek = karyawan.some(i=>i.id_biodata == filData.id_biodata);
                }else if(karyawan.length == 0){
                    cek = false
                }

                if(cek == true){
                    data.splice(index,1);
                }else{
                    row.biodata.push(filData)
                }
            })
            //
        });

    
        res.render('template/base',{
            getUrl:'inputDataKaryawan',
            data:data
        })
}

exports.inputKaryawan = async (req, res,next) => {
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    req.body.id_biodata == undefined ? req.body.id_biodata = [] : req.body.id_biodata;
    const status_aktif = 1;
    let id_biodata = [];
    id_biodata.push(...req.body.id_biodata);
    // console.log(id_biodata);
    if(id_biodata.length == 0){
        res.redirect('/admin/input_data_karyawan')
    }
    await id_biodata.forEach( async(index)=>{
        await Admin.inputKaryawan(index,req.body.masuk_kerja,status_aktif,req.body.status_karyawan)
        
    })

    if(req.body.status_karyawan == 1){
        await Admin.dataKaryawanLimit(id_biodata.length).then(([rows,fieldData])=>{
                //console.log(rows);
                rows.forEach(row=>{
                        Admin.inputKontrak(row.id_karyawan,row.id_biodata,req.body.tgl_awal,req.body.tgl_akhir);
                    })
        });
        res.redirect('/admin/dataKaryawan'); 
    }else{
        res.redirect('/admin/dataKaryawan'); 
    }
}

exports.updateKaryawan = async(req, res,next ) => {
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    let id_karyawan = req.params.idKaryawan;
    let dataKaryawan = [];

   await Admin.getKaryawanById(id_karyawan).then(([rows,fieldData])=>{
        dataKaryawan.push(...rows);
    })

    await Admin.getPelamar().then(([rows,fieldData])=>{
        dataKaryawan.forEach(i=>{
            i.biodata = [];
            let filData = rows.find(row=>row.id_biodata == i.id_biodata);
            i.biodata.push(filData);
        })
    })

    await Admin.dataKontrakById(id_karyawan).then(([rows,filData]) =>{ 
        dataKaryawan.forEach(row=>{
            row.tgl_awal = '';
            row.tgl_akhir = '';
            if(row.status_karyawan == 1){
                row.tgl_awal = rows[0].tgl_awal
                row.tgl_akhir = rows[0].tgl_akhir
            }
         })
    })

    res.render('template/base',{
        getUrl:'updateKaryawan',
        data:dataKaryawan
    })
}

exports.updatePostKaryawan = async(req,res,next) =>{
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    let data = req.body;
    let dataKontrak = [];
    await Admin.dataKontrak().then(([rows,fieldData])=>{
        dataKontrak.push(...rows);
    })

    if(data.status_karyawan == 1){
        let cek = dataKontrak.some(i=>i.id_karyawan == data.id_karyawan);
        if(cek){
            await Admin.updateKontrak(data.id_karyawan,data.tgl_awal,data.tgl_akhir)
        }else{
            await Admin.inputKontrak(data.id_karyawan,data.id_biodata,data.tgl_awal,data.tgl_akhir)
        }
        
    }else if(data.status_karyawan == 2){
        let cek = dataKontrak.some(i=>i.id_karyawan == data.id_karyawan);
        if(cek){
            await Admin.deleteKontrak(data.id_karyawan)
        }
    }

    await Admin.updatePostKaryawan(data.id_karyawan,data.id_biodata,data.status_aktif,data.status_karyawan,data.nama_lengkap,data.alamat,data.pendidikan,data.telepon)
    .then(()=>{
        res.redirect('/admin/dataKaryawan');
    })

}

exports.deleteKaryawan = async(req, res) =>{
    if(!req.session.loggedAdmin){
        return res.redirect('/admin/login');
    }

    let dataKontrak = [];
    let id = req.params.idKaryawan;
    let cek = false;

    await Admin.dataKontrak().then(([rows,fieldData])=>{
        dataKontrak.push(...rows);
    })

    let dataCek = dataKontrak.some(i=>i.id_karyawan == id);

    if(dataCek){
        await Admin.deleteKontrak(id);
    }

    await Admin.deleteKaryawan(id).then(()=>{
        res.redirect('/admin/dataKaryawan');
    })
}

exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/admin/login');
    });
  };

exports.prosesLaporan = async(req, res) =>{
    let page = req.params.page;
    res.render('template/base',{
        getUrl:'prosesLaporan',
        getPage:page
    })
}

exports.laporan = async(req, res) =>{
    //console.log(req.body.laporan+'-'+req.body.tanggal);
    let data = [];
    let newData = [];
    let tanggal = '';
    if(req.body.laporan === 'data_pelamar'){
        tanggal = req.body.tanggal.split('-');
       await Admin.getPelamarByDate(new Date(tanggal[0]) ,new Date(tanggal[1])).then(([rows,fieldData])=>{
            data.push(...rows);
        })
        // newData = data.filter(row=>{
        //     return row.created_at >= new Date(tanggal[0]) && row.created_at <= new Date(tanggal[1]);
        // })
    }else if(req.body.laporan === 'lulus_seleksi_berkas'){
        tanggal = req.body.tanggal.split('-');
        await Admin.getPelamarByDate(new Date(tanggal[0]) ,new Date(tanggal[1])).then(([rows,fieldData])=>{
            data.push(...rows);
        })

        await Admin.getStatusPelamarAll().then(([rows,fieldData])=>{
            data.forEach(i=>{
                let filData = [...rows].find(row=>row.id_pelamar == i.id_pelamar);
                i.seleksi_berkas = filData.seleksi_berkas;
            })
        })
        data = data.filter(i=>i.seleksi_berkas == 2);
    }else if(req.body.laporan === 'lulus_seleksi_soal'){
        tanggal = req.body.tanggal.split('-');
        await Admin.getPelamarByDate(new Date(tanggal[0]) ,new Date(tanggal[1])).then(([rows,fieldData])=>{
            data.push(...rows);
        })
        await Admin.getStatusPelamarAll().then(([rows,fieldData])=>{
            data.forEach(i=>{
                let filData = [...rows].find(row=>row.id_pelamar == i.id_pelamar);
                i.seleksi_soal = filData.seleksi_soal;
            })
        })
        data = data.filter(i=>i.seleksi_soal == 2);
    }else if(req.body.laporan == 'lulus_seleksi_wawancara'){
        tanggal = req.body.tanggal.split('-');
        await Admin.getPelamarByDate(new Date(tanggal[0]) ,new Date(tanggal[1])).then(([rows,fieldData])=>{
            data.push(...rows);
        })
        await Admin.getStatusPelamarAll().then(([rows,fieldData])=>{
            data.forEach(i=>{
                let filData = [...rows].find(row=>row.id_pelamar == i.id_pelamar);
                i.seleksi_wawancara = filData.seleksi_wawancara;
            })
        })
        data = data.filter(i=>i.seleksi_wawancara == 2);
    }else if(req.body.laporan == 'laporan_data_karyawan'){
        tanggal = req.body.tanggal.split('-');
        await Admin.dataKaryawan().then(([rows,fieldData])=>{
           data = [...rows].filter(row=>{
                return new Date(row.masuk_kerja) >= new Date(tanggal[0]) && new Date(row.masuk_kerja) <= new Date(tanggal[1]);
            })
            data.push(...newData);
        });

        await Admin.getPelamar().then(([rows,fieldData])=>{
            data.forEach(row=>{
                let newData =  [...rows].filter(i=>i.id_biodata === row.id_biodata);
                row.biodata = newData;
            })
        });
    }else if(req.body.laporan == 'laporan_karyawan_kontrak'){
        await Admin.dataKaryawan().then(([rows,fieldData])=>{
            data = [...rows].filter(row=>{
                 return row.status_karyawan == 1
             })
         });
 
         await Admin.getPelamar().then(([rows,fieldData])=>{
             data.forEach(row=>{
                 let newData =  [...rows].filter(i=>i.id_biodata === row.id_biodata);
                 row.biodata = newData;
             })
         });
        //  console.log(data);
    }else if(req.body.laporan == 'laporan_karyawan_tetap'){
        await Admin.dataKaryawan().then(([rows,fieldData])=>{
            data = [...rows].filter(row=>{
                 return row.status_karyawan == 2
             })
         });
 
         await Admin.getPelamar().then(([rows,fieldData])=>{
             data.forEach(row=>{
                 let newData =  [...rows].filter(i=>i.id_biodata === row.id_biodata);
                 row.biodata = newData;
             })
         });
        //  console.log(data);
    }else if(req.body.laporan == 'laporan_wawancara'){
        tanggal = req.body.tanggal.split('-');
        await Admin.dataWawancara().then(([rows,fieldData])=>{
            data = [...rows].filter(row=>{
                 return new Date(row.tgl_wawancara) >= new Date(tanggal[0]) && new Date(row.tgl_wawancara) <= new Date(tanggal[1]);
             })
         });
 
         await Admin.getPelamar().then(([rows,fieldData])=>{
             data.forEach(row=>{
                 let newData =  [...rows].filter(i=>i.id_pelamar === row.id_pelamar);
                 row.biodata = newData;
             })
         });

         await Admin.getStatusPelamarAll().then(([rows,fieldData])=>{
            data.forEach(row=>{
                let dataStatus = [...rows].filter(i=>i.id_pelamar === row.id_pelamar);
                row.status = dataStatus;
            })
         })
        // console.log(data[0].biodata);
    }

    res.render('laporan/laporan',{
        getUrl:'index',
        laporan:req.body.laporan,
        data:data,
        date : tanggal
    })
}