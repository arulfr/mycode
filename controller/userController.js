const User = require('../model/user');
const bcrypt = require('bcrypt');
const alert = require('alert');


exports.getHome = (req,res,next) =>{
    res.render('template/base_user',{
        path:'/',
        getUrl:'index'
    });
}


exports.getRegister = (req,res,next) =>{
    res.render('template/base_user',{
        path:'/register',
        getUrl:'register'
    });
}


exports.postRegister = (req,res,next) =>{
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(req.body.password,salt);
    const user  = new User;
    user.registerUser(req.body.nama,req.body.username,hash).then(()=>{
        res.redirect('/register');
    })
}

exports.getLogin = (req,res,next) =>{
    res.render('template/base_user',{
        path:'/login',
        getUrl:'login'
    });
}

exports.postLogin = (req,res,next) =>{
    User.loginUser(req.body.username,req.body.password).then( async([rows,fieldData])=>{
        //console.log(rows==false);
        if(rows==false){
            return res.redirect('/login');
        }
        //console.log(bcrypt.compareSync(req.body.password,rows[0].password))
        if(bcrypt.compareSync(req.body.password,rows[0].password)){
            req.session.loggedin = true;
            req.session.id_pelamar = rows[0].id_pelamar;

            // let today = new Date();
            // today.setHours(today.getHours()+1);
            // let sessionStore = today.getTime();
            // dataUser = [];
        //    await User.updateSession(sessionStore,req.body.username).then(([rows,fieldData])=>{
                
        //     });
            //console.log(req.session.loggedin);
            res.redirect('/getBiodata');
        }else{
            res.redirect('/login');
        }
    })
}

exports.getBiodata = async(req,res,next) =>{
    //console.log(req.session.loggedin);
    if(!req.session.loggedin){
        return res.redirect('/login');
    }
    let cek;
    let data=[];
    await User.getBiodata(req.session.id_pelamar).then(([rows,fieldData])=>{
       // data.push(rows[0]);
            if(rows.length){
                cek = true;
                data.push(rows[0]);
            }else{
                cek =false
                data=null;
            }
    });
    if(data != null){
            await User.getBerkas(req.session.id_pelamar).then(([rows,fieldData])=>{
                if(rows.length !== 0){
                    data.forEach(row=>{
                        row.berkas = [];
                        row.berkas.push(rows[0])
                    })
                }else{
                    data.forEach(row=>{
                        row.berkas = [];
                    })
                }
                    // console.log(data)
                });
    }
    

    // if(data[0].berkas.value == undefined){
    //     data[0].berkas.value=null
    // }
    //console.log(data[0].berkas.length)
    await res.render('template/base_user',{
            path:'/getBiodata',
            getUrl:'biodata',
            cek:cek,
            data:data
        })    
}

exports.postBiodata =  async(req,res,next) =>{
    const user = new User;
    const foto = req.files.foto[0];
    //console.log(foto.path);
    await User.insertSeleksi(req.body.id_pelamar);
    await user.postBiodata(req.body.id_pelamar,req.body.nama_lengkap,req.body.tgl_lahir,req.body.tempat_lahir,req.body.telepon,req.body.alamat,req.body.pendidikan,foto.path)
    .then(()=>{
        res.redirect('/getBiodata')
    })
}


exports.uploadBerkas = (req,res,next) =>{   
            //console.log(data[0]);
            if(!req.session.loggedin){
                return res.redirect('/login');
            }
        res.render('template/base_user',{
                path:'/uploadBerkas',
                getUrl:'uploadBerkas',
            })
}

exports.postBerkas = (req,res,next) =>{
    //console.log(req.session.id_pelamar );
    const surat_lamaran = typeof req.files.surat_lamaran != undefined ? req.files.surat_lamaran :'';
    const ijazah = typeof req.files.ijazah != undefined ? req.files.ijazah :'';
    const ktp = typeof req.files.ktp != undefined ? req.files.ktp :'';
    const lampiran = typeof req.files.lampiran != undefined ? req.files.lampiran :'';
    // req.files.surat_lamaran[0].path.length != 0 && req.files.ijazah[0].path.length != 0 && req.files.ktp[0].path.length != 0 && req.files.lampiran[0].path.length != 0
      if(surat_lamaran == '' || ijazah =='' || ktp =='' || lampiran == ''){
        res.redirect('/uploadBerkas');
      }
        User.uploadBerkas(req.session.id_pelamar,surat_lamaran[0].path,ijazah[0].path,ktp[0].path,lampiran[0].path).then(()=>{
            res.redirect('/getBiodata');
        });
}

exports.prosesRekrutmen = (req,res,next) =>{
    User.getStatusPelamar(req.session.id_pelamar).then(([rows,fieldData])=>{
        res.render('template/base_user',{
            path:'/proses_rekrutmen',
            getUrl:'prosesRekrutmen',
            data : rows
        });
    })
}

exports.soalSeleksi = async(req,res,next) =>{
    // ======================= cek dulu validasinya ======================================================================
    await User.getBiodataUser(req.session.id_pelamar).then(([rows,fieldData])=>{
        if(rows.length == 0){
           // alert('Silahkan Isi Biodata Lebih Dulu');
            res.redirect('/getBiodata');
        }
    })
    await User.getStatusPelamar(req.session.id_pelamar).then(([rows,fieldData])=>{
        if(rows[0].seleksi_berkas == 1){
            res.redirect('/proses_rekrutmen');
        }
    })
    //========================================================================================================================

    let dataSoal = [];
    await User.getSoal().then(([rows,fieldData])=>{
        rows.forEach(row=>{
            row.cek = false;
            dataSoal.push(row);
        })
    });

    await User.getJawaban(req.session.id_pelamar).then(([rows,fieldData])=>{
        //console.log(rows);
        rows.forEach(row => {
            let data = dataSoal.find(i=>i.id_soal == row.id_soal);
            data.cek = true;
        });
    })

    //console.log(dataSoal);
    await res.render('template/base_user',{
        getUrl:'soal_seleksi',
        data : dataSoal
    });
}

exports.jawabSoal = async(req, res, next) => {
    let index = 0;

    let dataSoal = [];
    await User.getSoal().then(([rows,fieldData])=>{
        rows.forEach(row=>{
            dataSoal.push(row);
        })
    })

    let verifikasi = [];
    await User.getNilai(req.session.id_pelamar).then(([rows,fieldData])=>{
        rows.forEach(row=>{
            verifikasi.push(row);
        })
    })

    // console.log(verifikasi);
    // console.log(verifikasi.length);

    let nilaiPersoal = Math.round(100/+dataSoal.length);
    let benar =0;
    let salah = 0;
    let nilai = 0; 

    if(verifikasi.length != 0){
        benar = await +verifikasi[0].benar;
        salah = await +verifikasi[0].salah;
        nilai = await +verifikasi[0].persentase;
    }

    await req.body.pilihan.forEach(row=>{
        //console.log(req.body.pilihan[index]);
            User.inputJawaban(req.session.id_pelamar,req.body.id_soal[index],req.body.pilihan[index]);
            if(req.body.pilihan[index] == req.body.kunci ){
                benar += 1;
                nilai += nilaiPersoal;
            }else{
                salah += 1;
            }
            index++;
        })

    if(verifikasi.length != 0){
        await User.updateNilai(benar,salah,nilai,new Date().toISOString().slice(0,10),req.session.id_pelamar).then(()=>{
            res.redirect('/soal_seleksi');
        }) 
    }else{
        await User.addNilai(req.session.id_pelamar,benar,salah,nilai,new Date().toISOString().slice(0,10)).then(()=>{
            res.redirect('/soal_seleksi');
        })
    }
    
    //console.log(req.body);

    if(nilai >= 80 ){
        await User.updateSeleksiSoal(2,req.session.id_pelamar)
    }else if(nilai <= 80){
        await User.updateSeleksiSoal(1,req.session.id_pelamar)
    }
    
}

exports.jadwalWawancara= async(req,res,next) =>{
    let data = [];
    await User.jadwalWawancara().then(([rows,fieldData])=>{
        let filData = [...rows].filter(row=>row.id_pelamar === req.session.id_pelamar);
        if(filData.length > 0) {
            data.push(...filData);
        }
    })

    await User.getBiodataUser(req.session.id_pelamar).then(([rows,fieldData])=>{
        data.forEach(row=>{
            row.biodata = [...rows];
        })
    })

    await res.render('template/base_user',{
        getUrl:'jadwalWawancara',
        data : data
    });
}


exports.postLogout = (req, res, next) => {
    req.session.destroy(err => {
      console.log(err);
      res.redirect('/login');
    });
  };
