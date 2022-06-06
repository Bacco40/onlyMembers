var Comment = require('../models/comment');
var Message = require('../models/message');
var async = require('async');
var mongoose = require('mongoose');
const { body,validationResult } = require('express-validator');

// Handle Comment create on GET.
exports.comment_create_post = [

    // Validate and sanitize fields.
    body('comment').trim().isLength({ min: 1 }).escape().withMessage('Comment must be specified.'),

    // Process request after validation and sanitization.
    (req, res, next) => {
        
        console.log(req.body)

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            Message.find({})
            .sort({date_of_creation : -1})
            .populate('creator')
            .populate('comments')
            .exec(function (err, messages) {
                if (err) { return next(err); }
                // There are errors. Render form again with sanitized values/errors messages.
                res.render('index', {user: req.user, comment: req.body, errors: errors.array() , messages:messages, messageId:req.params.id});
                return;
            })
        }
        else {
            // Data from form is valid.
            var idComment = mongoose.Types.ObjectId();

            var comment = new Comment(
                {
                    _id: idComment,
                    comment: req.body.comment,
                    creator: req.user.id,
                    message_ref: req.params.id
                });
            comment.save(function (err) {
                if (err) { return next(err); }
                //Successful
                Message.findById(req.params.id, function(err, message) {
                    if (err) return res.send(err);
                    message.comments.push(comment);
                    message.save(function(err) {
                      if (err) { return res.send(err); }
                      res.redirect('/');
                    })
                });
            })
        }
    }
];

// Handle Comment delete on GET.
exports.comment_delete_get = function(req, res) {
    async.parallel({
        comment: function(callback) {
            Comment.findById(req.params.id)
              .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            Comment.findByIdAndRemove(req.params.id, function deleteComment(err,comment) {
                if (err) { return next(err); }
                //Successful
                Message.findById(results.comment.message_ref, function(err, message) {
                    if (err) return res.send(err);
                    message.comments.pull(comment);
                    message.save(function(err) {
                      if (err) { return res.send(err); }
                      res.redirect('/');
                    })
                });
            })
        }
    });
};
