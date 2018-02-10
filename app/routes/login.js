const router	= require('express').Router();
const passport	= require('passport');
const mongoose	= require('mongoose');
const User		= mongoose.model('UserBase');

router.post('/', function(req, res, next) {
  passport.authenticate('local',
	function(err, user, info) {
	  if (err) return next(err);
	  if (user) {
		req.logIn(user, function(err) {
		  return err
			? next(err)
			: res.redirect('/');
		});
	  } else {
	  	res.send('unknown user');
		// hanle user not found here
	  } 
	}
  )(req, res, next);
});

module.exports = router;