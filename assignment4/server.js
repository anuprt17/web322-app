/***********************************************************************
**********
* WEB322 – Assignment 04
* I declare that this assignment is my own work in accordance with Seneca Academic
Policy. No part * of this assignment has been copied manually or electronically from any
other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Anupreet Kaur 
  Student ID: 110313210
  Date: 07-07-2022 
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
const blogData = require("./blog-service");
const exphbs = require('express-handlebars');
const stripJs = require('strip-js');

cloudinary.config({
  cloud_name: 'dkqcenczz',
  api_key: '627734421628958',
  api_secret: 'HRgw-gb02ul3l3GBYskcnNOUJDA',
  secure: true
 });

 const upload = multer();

 app.engine('.hbs', exphbs.engine({ extname: '.hbs',
helpers:{
  navLink: function(url, options){
    return '<li' +
    ((url == app.locals.activeRoute) ? ' class="active" ' : '') +
    '><a href="' + url + '">' + options.fn(this) + '</a></li>'; },
   equal: function (lvalue, rvalue, options) {
    if (arguments.length < 3)
    throw new Error("Handlebars Helper equal needs 2 parameters");
    if (lvalue != rvalue) {
    return options.inverse(this);
    } else {
    return options.fn(this);
    }
   },
   safeHTML: function(context){
    return stripJs(context);
   }   
  } 
}));

 app.set('view engine', '.hbs');

 app.use(function(req,res,next){
  let route = req.path.substring(1);
  app.locals.activeRoute = "/" + (isNaN(route.split('/')[1]) ? route.replace(/\/(?!.*)/, "") : route.replace(/\/(.*)/, ""));
  app.locals.viewingCategory = req.query.category;
  next();
 });
 

app.get('/', (req, res) => {
  res.redirect('/blog')
});

 app.get('/about', (req, res) => {
      res.render(path.join(__dirname + "/views/about.hbs"));
  });

  app.get('/posts/add', (req, res) => {
    res.render(path.join(__dirname + "/views/addPost.hbs"));
});

  /*app.get("/blog", (req, res) => {
    blogservice.getPublishedPosts().then((data) => {
        res.json({data});
    }).catch((err) => {
        res.json({message: err});
    })
});*/

app.get('/blog', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // get the latest post from the front of the list (element 0)
      let post = posts[0]; 

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;
      viewData.post = post;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})

});

app.get('/blog/:id', async (req, res) => {

  // Declare an object to store properties for the view
  let viewData = {};

  try{

      // declare empty array to hold "post" objects
      let posts = [];

      // if there's a "category" query, filter the returned posts by category
      if(req.query.category){
          // Obtain the published "posts" by category
          posts = await blogData.getPublishedPostsByCategory(req.query.category);
      }else{
          // Obtain the published "posts"
          posts = await blogData.getPublishedPosts();
      }

      // sort the published posts by postDate
      posts.sort((a,b) => new Date(b.postDate) - new Date(a.postDate));

      // store the "posts" and "post" data in the viewData object (to be passed to the view)
      viewData.posts = posts;

  }catch(err){
      viewData.message = "no results";
  }

  try{
      // Obtain the post by "id"
      viewData.post = await blogData.getPostById(req.params.id);
  }catch(err){
      viewData.message = "no results"; 
  }

  try{
      // Obtain the full list of "categories"
      let categories = await blogData.getCategories();

      // store the "categories" data in the viewData object (to be passed to the view)
      viewData.categories = categories;
  }catch(err){
      viewData.categoriesMessage = "no results"
  }

  // render the "blog" view with all of the data (viewData)
  res.render("blog", {data: viewData})
});

app.get("/posts", (req, res) => {
  if (req.query.category) {
    blogservice.getPostsByCategory(req.query.category).then((data) => {
        //res.json({data});
        res.render("posts", {posts: data})
    }).catch((err) => {
       // res.json({message: err});
       res.render("posts", {message: "no results"});
    })
}
  else if (req.query.minDate) {
  blogservice.getPostsByMinDate(req.query.minDate).then((data) => {
      //res.json({data});
      res.render("posts", {posts: data})
  }).catch((err) => {
      //res.json({message: err});
      res.render("posts", {message: "no results"});

    })
}
  else{
  blogservice.getAllPosts().then((data) => {
    //res.json({data});
    res.render("posts", {posts: data})
      }).catch((err) => {
    //res.json({message: err});
    res.render("posts", {message: "no results"});
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
        //res.json({data});
        res.render("categories", {categories: data});
    }).catch((err) => {
        //res.json({message: err});
        res.render("categories",{message: "no results"});
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
   // res.status(404).send("Page Not Found");
   res.status(404).render("404")
  });

  blogservice.initialize().then(() => {
    app.listen(PORT, PORT_LISTEN());
}).catch (() => {
    console.log('PROMISE NOT KEPT! SERVER NOT STARTED ');
});

PORT_LISTEN = () => {
  console.log('Express HTTP server is listening to the port', PORT)
}
