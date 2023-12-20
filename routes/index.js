var express = require('express');
var router = express.Router();
var userModel = require('./users')
var postModel = require('./posts')
const passport = require('passport');
const path = require('path');
const multer = require('multer');
const localStrategy = require('passport-local');
const posts = require('./posts');
const fs = require('fs')
const crypto = require('crypto')
const mailer = require('../nodem.js')
passport.use(new localStrategy(userModel.authenticate()))
/* GET home page. */

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, './public/images/uploads')
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname)
    cb(null, uniqueSuffix)
  }
})

const upload = multer({ storage: storage })

router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/forgot', function(req, res, next) {
  res.render('forgot');
});
router.post('/forgot', async function(req, res, next) {
  const user = await userModel.findOne({email:req.body.email})
  if(!user){
    res.send("we have sent you an mail if email exist")
  }
  else{
    crypto.randomBytes(80, async function(err,buff){
      let key = buff.toString('hex')
      user.key = key;
      await user.save()
      mailer(req.body.email,user._id,key)
      res.send("sent")
      
    })
  }
});
router.get('/check/:user', function(req, res, next) {
  userModel.findOne({username:req.params.user})
  .then(function(user){
    if(user)
    res.json(true)
    else
    res.json(false)
  })
});
router.post('/update',isLoggedIn , function(req, res, next) {
  userModel.findOneAndUpdate({username:req.session.passport.user} , {username:req.body.username} , {new:true})
  .then(function(updatedUser){
    req.login(updatedUser,function(err){
      console.log(next)
      if(err) {return next(err)  }
      return res.redirect('/profile')
    })
  })
});
router.get('/edit',isLoggedIn, function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(foundUser){
    res.render("edit",{foundUser});
  })
});
router.post('/uploads',isLoggedIn,upload.single('image') ,function(req, res, next) {
  userModel.findOne({username:req.session.passport.user})
  .then(function(userDets){
    if(userDets.image !== 'def.png')
    fs.unlinkSync(`./public/images/uploads/${userDets.image}`)
  userDets.image = req.file.filename;
  userDets.save()
  .then(function(){
    res.redirect('back')
  })
  })
});
router.get('/login', function(req, res, next) {
  res.render('login')
});
router.get('/profile', isLoggedIn ,function(req, res, next) {
  userModel
  .findOne({username:req.session.passport.user})
  .populate('posts')
  .then(function(userDets){
    res.render('profile', {userDets})
  })
});
router.post('/post', isLoggedIn ,function(req, res, next) {
  userModel
  .findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel.create({
      post:req.body.post,
      userid:foundUser._id
    })
    .then(function(createdPost){
      foundUser.posts.push(createdPost._id)
      foundUser.save()
    })
    .then(function(){
      res.redirect("back")
    })
  })
});
router.get('/feed', isLoggedIn ,function(req, res, next) {
  userModel
  .findOne({username:req.session.passport.user})
  .then(function(user){
    postModel.find()
    .populate('userid')
    .then(function(allPosts){
      res.render('feed',{allPosts,user})
    })
  })
});
router.get('/like/:postid', isLoggedIn ,function(req, res, next) {
  userModel
  .findOne({username:req.session.passport.user})
  .then(function(foundUser){
    postModel
    .findOne({_id:req.params.postid})
    .then(function(foundPost){
      if(foundPost.likes.indexOf(foundUser._id)=== -1){
        foundPost.likes.push(foundUser._id)
      }
      else
      foundPost.likes.splice(foundPost.likes.indexOf(foundUser._id))
      foundPost.save()
    })
    .then(function(){
      res.redirect("back")
    })
  })
});
router.post('/register', function(req, res, next) {
  var newUser = new userModel({
    username: req.body.username,
    age: req.body.age,
    email : req.body.email,
    image:req.body.image
  })
  userModel.register(newUser,req.body.password)
  .then(function(u){
    passport.authenticate('local')(req,res,function(){
      res.redirect("/login")
    })
  })
  .catch(function(e){
    res.send(e);
  })
});
router.post('/login', passport.authenticate('local',{
  successRedirect: '/profile',
  failureRedirect: '/login'
}),function(req,res,next){});

router.get('/logout', function(req, res, next) {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.redirect('/login');
  });
});
function isLoggedIn(req,res,next){
  if(req.isAuthenticated()){
    return next();
  }
  else{
    res.redirect('/')
  }
}
module.exports = router;
