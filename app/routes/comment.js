const router	= require('express').Router();
const passport	= require('passport');
const mongoose	= require('mongoose');
const auth		= require('../middleware/authentication');
const util		= require('../lib/util');
const Errors	= require('../lib/error');
const Comment	= mongoose.model('Comment');
const Post		= mongoose.model('Post');

router.post('/add', auth.isAuthenticated, async (req, res, next) => {
	let comment = new Comment({
		user: req.user._id,
		post: req.body.post,
		text: req.body.text
	});
	try {
		util.checkObjectId(comment.post);
		util.checkText(comment.text);
		let post = await Post.findById(comment.post);
		post ? await comment.save() : util._throw(new Errors.ObjectNotFound('Post'));
	} catch (e) {
		return next(e);
	}
	res.send('Comment created');
});

router.post('/edit', auth.isAdmin, async (req, res, next) => {
	let commentId = req.body.comment;
	try {
		util.checkObjectId(commentId);
		let comment = await Comment.findById(commentId);
		util.checkText(req.body.text);
		comment 
			? await comment.update({ text: req.body.text })
			: util._throw(new Errors.ObjectNotFound('Comment'));
	} catch (e) {
		return next(e);
	}
	res.send('Comment has been updated');
});

router.post('/delete', auth.isAdmin, async (req, res, next) => {
	let commentId = req.body.comment;
	try {
		util.checkObjectId(commentId);
		let comment = await Comment.findById(commentId);
		comment 
			? await comment.update({ isDeleted: true })
			: util._throw(new Errors.ObjectNotFound('Comment'));
	} catch (e) {
		return next(e);
	}
	res.send('Comment has been deleted');
});

router.get('/list', async (req, res, next) => {
	let perPage = Number.parseInt(req.query.perpage) || 5;
	let page = Number.parseInt(req.query.page) || 0;
	let postId = req.query.post;
	try {
		util.checkObjectId(postId);
		var comments = await Comment.find({ 'post': postId })
			.where('isDeleted').ne(true)
			.limit(perPage)
			.skip(perPage * page)
			.lean();
	} catch (e) {
		return next(err);
	}
	res.json(comments);
});

module.exports = router;