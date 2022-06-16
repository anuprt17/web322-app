/***********************************************************************
**********
* WEB322 – Assignment 03
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Anupreet Kaur 
  Student ID: 110313210
  Date: 15-06-2022 
*
* Online (Heroku) Link: https://floating-earth-57187.herokuapp.com/

________________________________________________________
*
************************************************************************
********/ 

var express = require("express")
var app = express()
var PORT = process.env.PORT || 8080
var path = require('path')
const multer = require("multer")
const cloudinary = require('cloudinary').v2
const streamifier = require('streamifier')
var blogservice = require(__dirname + "/blog-service.js");

cloudinary.config({
  cloud_name: 'dkqcenczz',
  api_key: '627734421628958',
  api_secret: 'HRgw-gb02ul3l3GBYskcnNOUJDA',
  secure: true
 });

 const upload = multer();

app.get('/', (req, res) => {
  res.redirect('/about')
});

 app.get('/about', (req, res) => {
      res.sendFile(path.join(__dirname + "/views/about.html"));
  });

  app.get('/posts/add', (req, res) => {
    res.sendFile(path.join(__dirname + "/views/addPost.html"));
});

  app.get("/blog", (req, res) => {
    blogservice.getPublishedPosts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.get("/posts", (req, res) => {
  if (req.query.category) {
    blogservice.getPostsByCategory(req.query.category).then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
}
  else if (req.query.minDate) {
  blogservice.getPostsByMinDate(req.query.minDate).then((data) => {
      res.json({data});
  }).catch((err) => {
      res.json({message: err});
    })
}
  else{
  blogservice.getAllPosts().then((data) => {
    res.json({data});
      }).catch((err) => {
    res.json({message: err});
    })
  }
});

app.get('/post/:value', (req,res) => {
  blogservice.getPostById(req.params.value).then((data) => {
      res.json({data});
  }).catch((err) => {
      res.json({message: err});
  })
});

app.get("/categories", (req, res) => {
  blogservice.getCategories().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});

app.post("/posts/add", upload.single("featureImage"), (req,res) => {
  let streamUpload = (req) => {
    return new Promise((resolve, reject) => {
    let stream = cloudinary.uploader.upload_stream(
    (error, result) => {
    if (result) {
    resolve(result);
    } else {
    reject(error);
    }
    }
    );
    streamifier.createReadStream(req.file.buffer).pipe(stream);
 });
};
async function upload(req) {
  let result = await streamUpload(req);
  console.log(result);
  return result;
 }
 upload(req).then((uploaded)=> {
  req.body.featureImage = uploaded.url;
  blogservice.addPost(req.body).then(() => {
    res.redirect("/posts");
})
 });
});


app.use(express.static('public'));

app.use((req, res) => {
    res.status(404).send("Page Not Found");
  });

  blogservice.initialize().then(() => {
    app.listen(PORT, PORT_LISTEN());
}).catch (() => {
    console.log('PROMISE NOT KEPT! SERVER NOT STARTED ');
});

PORT_LISTEN = () => {
  console.log('Express HTTP server is listening to the port', PORT)
}
