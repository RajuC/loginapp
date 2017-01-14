var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local'),Strategy;

var User = require('../models/user')
// get homepage
// register
router.get('/register', function(req, res){
	res.render('register');
})
// login
router.get('/login', function(req, res){
	res.render('login');
})


// register user
router.post('/register', function(req, res){
	var name = req.body.username;
	var email = req.body.email;
	var password = req.body.password;
	var passwordConf = req.body.password_confirm;
	console.log(req.body);

	//validation
	req.checkBody('username', 'Name is required').notEmpty();
	req.checkBody('email', 'Email is required').notEmpty();
	req.checkBody('email', 'Email is not valid').isEmail();
	req.checkBody('password', 'Password is required').notEmpty();
	req.checkBody('password_confirm', 'Passwords do not match').equals(req.body.password);

	var errors = req.validationErrors();

	if(errors) {
		console.log('one of the fields are missings!!');
		console.log(errors);
		res.render('register',{
			errors:errors
		});
	}
	else {
		var newUser = new User({
			username: name,
			email: email,
			password: password
		});

		User.createUser(newUser, function(err, user){
			if(err) throw err;
			console.log(user);
		});

		req.flash('success_msg', 'You are registered and can now login');
		res.redirect('/users/login');
	}
});


passport.use(new LocalStrategy(
  function(username, password, done) {
  	console.log("usernameee")
  	console.log(username)
  	User.getUserByName(username, function(err, user){
  		console.log(user);
  		console.log(username);
  		if(err) throw err;
  		if(!user){
  			return done(null, false, {message: 'Unknown User'});
  		}
  		console.log("i am here0");
  		User.comparePassword(password, user.password, function(err, isMatch){
  			if(err) throw err;
  			if(isMatch) {
  				return done(null, user);
  			}else {
  				return done(null, false, {message: 'Invalid  User Password'});
  			}
  		});
  	});
  }
));


passport.serializeUser(function(user, done) {
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  User.getUserById(id, function(err, user) {
    done(err, user);
  });
});

router.post('/login',
  passport.authenticate('local',{successRedirect:'/', failureRedirect:'/users/login', failureFlash:true}),
  function(req, res) {
    res.redirect('/');
  });


router.get('/logout', function(req, res){
	req.logout();
	req.flash('success_msg', 'You are Logged Out');

	res.redirect('/users/login');
});



module.exports = router;