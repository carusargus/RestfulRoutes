var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer"); 
var mongoose       = require("mongoose");
var express    =require("express");
var app            = express();


app.set("view engine", "ejs");  //package installed so we don't have to constantly type 'fileName.ejs'
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended:true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer()); 
//SETTING UP mongoose, telling it where to connect to 
//mongoose.connect("mongodb://localhost/restful_blog") is depreciated produces the following warning: `open()` is deprecated in mongoose >= 4.11.0, use `openUri()` instead, or set the `useMongoClient` option if using `connect()` or `createConnection()`. See http://mongoosejs.com/docs/connections.html#use-mongo-client
//mongoose.connect("mongodb://localhost/restful_blog"); 
mongoose.connect('mongodb://localhost/restful_blog', { useMongoClient: true });

//Create mongoose schema which will have: title, image, body, created on Date. 
var blogSchema = new mongoose.Schema({
    title: String,
    image: String,
    body: String,
    created: {type:Date, default: Date.now}
}); 
//Compile our schema into a Model...NB: the word in quotes "Blog", must be singular, when compiled it will create a plural collection i.e. blogs 
var Blog = mongoose.model("Blog", blogSchema); 


// commenting the creation out for now as I do not want to create a new blog everytime I run the server 
// Create a single Blog, NB: these methods e.g. create are from the mongoose model which give us access to all these methods 
// Blog.create({
//     title: "Kittens ",
//     image: "https://farm4.staticflickr.com/3202/3145316907_338dfcfc08.jpg",
//     body: "This is a blog about kitiies"
// });

//RESTful Routes
app.get("/", function(req, res){
   res.redirect("/blogs") ; 
});



//Create our Index route as a GET request 
app.get("/blogs", function(req, res){
    
    // req.body.blog.body = req.sanitize(req.body.blog.body); 
    
    Blog.find({}, function(err, blogs){
        if(err){
            console.log(err);
        }else {
             //we are passing the data in the above function, blogs, that came back from the DB from our .find() &
             //whatever comes back we are sending back under the name blogs, this being the 1st blogs, the data we're passing being the 2nd blogs
             res.render("index", {blogs:blogs}); 
        }
        
    }); 
  
});


//New Route we just render the same form everytime no look up in DB or send data
app.get("/blogs/new", function(req, res) {
    res.render("new");
});

//Create
app.post("/blogs", function(req, res) {
    //req.body.blog is 1st argument which it takes that data & creates a new blog, when done calls the callback function
    Blog.create(req.body.blog, function(err, newBlog){
        if(err){
            console.log(err);
        } else {
            res.redirect("/blogs")
        }
    });
    
    
    //redirect to index
});

//Show Route
app.get("/blogs/:id", function(req, res) {
//   res.send("Show page") ;  
Blog.findById(req.params.id, function(err, foundBlog){
    if(err){
        console.log(err);
    } else {
        res.render("show", {blog: foundBlog})
    }
    
    });
});


//Edit Route
app.get("/blogs/:id/edit", function(req, res) {
    Blog.findById(req.params.id, function(err, foundBlog){
        if(err){
            console.log(err);
        }else {
            res.render("edit", {blog:foundBlog});
        }
    });
    
}); 

// //Update Route
app.put("/blogs/:id", function(req, res){
    //  req.body.blog.body = req.sanitize(req.body.blog.body); 
    //Error: Can't set headers after they are sent. was because I was used res twice? 
    // res.send("UPDATED ROUTE"); 
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
      if(err){
          console.log(err);  
        //   res.redirect("/blogs");
          res.redirect("/blogs/"+ req.params.id);
      }else{
          res.redirect("/blogs/"+ req.params.id);
      }
  });
});


//Delete Route
app.delete("/blogs/:id", function(req, res){
    // res.send("destroed route"); 
    // //Delete blog
    Blog.findByIdAndRemove(req.params.id, function(err){
        if(err){
            console.log(err); 
            res.redirect("/blogs"); 
        }else{
            res.redirect("/blogs"); 
        }
    });
    
  
}); 




app.listen(process.env.PORT, process.env.IP, function(){
   console.log("Server is running! ") ; 
});