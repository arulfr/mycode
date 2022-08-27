const http=require('http');
const path = require('path');
const express = require('express');
const session = require('express-session');
const app = express();
const multer = require('multer');
var MySQLStore = require('express-mysql-session')(session);
const db = require('./util/database');

//session time limit
const sessionTime = 1000 * 60 * 60 * 1

const fileStorage = multer.diskStorage({
    destination: (req, file, cb) => {
      if(file.fieldname === 'foto'){
        cb(null, './images/foto');
      }else if(file.fieldname === 'surat_lamaran'){
        cb(null, './images/berkas/surat_lamaran');
      }else if(file.fieldname === 'ijazah'){
        cb(null, './images/berkas/ijazah');
      }else if(file.fieldname === 'ktp'){
        cb(null, './images/berkas/ktp');
      }else if(file.fieldname === 'lampiran'){
        cb(null, './images/berkas/lampiran');
      }else if(file.fieldname === 'gambar'){
        cb(null, './images/gambar');
      }
    },
    filename: (req, file, cb) => {
      cb(null, new Date().toISOString().replace(/:/g, '-') + '-' + file.originalname);
    }
  });



app.set('view engine','ejs');
app.set('views','views'); 

const adminRoutes = require('./routes/admin');
const userRoutes = require('./routes/user');

app.use(express.urlencoded({extended:true}));

var sessionStore = new MySQLStore({}, db);

app.use(session(
    { 
       secret:'secret',
       resave:true,
       saveUninitialized:true,
       store:sessionStore,
       cookie: {
        maxAge: sessionTime,
        sameSite: true,
      }
    }));


app.use((req,res,next)=>{
    res.locals.loggedin = req.session.loggedin;
    res.locals.loggedAdmin = req.session.loggedAdmin;
    res.locals.id_pelamar = req.session.id_pelamar;
    next();
});

app.use(
    multer({ storage: fileStorage }).fields(
      [
          {
              name:'foto',
              maxCount:1
          },
          {
              name: 'surat_lamaran', maxCount:1
          },
          {
              name: 'ijazah', maxCount:1
          },
          {
              name: 'ktp', maxCount:1
          },
          {
              name: 'lampiran', maxCount:1
          },
          {
              name:'gambar',maxcount:1
          }
      ]
    )
  );


app.use('/admin',adminRoutes);
app.use(userRoutes);

app.use(express.static('public'));

// app.use(express.static(__dirname + '/public'));

app.use('/images',express.static(path.join(__dirname,'images')));
app.use('/admin/images',express.static(path.join(__dirname,'images')));

app.use( (req,res,next)=>{
    res.status(404).send('<h1>Page Not Found</h1>');
})

const server = http.createServer(app);

server.listen(3000);