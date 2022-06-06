var Message = require('../models/message');
const { body,validationResult } = require('express-validator');
var async = require('async');

// Display detail page for a specific Message.
exports.message_detail = function(req, res) {
    res.send('NOT IMPLEMENTED: Message detail: ' + req.params.id);
};

// Display Message create form on GET.
exports.message_create_get = function(req, res) {
    res.render('create_message',{title:'New Message', user: req.user});
};

// Handle Message create on POST.
exports.message_create_post = [

    // Validate and sanitize fields.
    body('title').trim().isLength({ min: 1, max:30}).escape().withMessage('Title must be specified, and must be maximum 30 character long.'),
    body('message').trim().isLength({ min: 1, max:300}).escape().withMessage('Message must be specified, and must be maximum 300 character long.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('create_message', { title: 'New Message', user: req.user, message: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            var message = new Message(
                {
                    title: req.body.title,
                    message: req.body.message,
                    creator: req.user.id
                });
            message.save(function (err) {
                if (err) { return next(err); }
                // Successful - redirect to new actor record.
                res.redirect('/');
            });
        }
    }
];

// Handle Message delete on Get.
exports.message_delete_post = function(req, res) {
    async.parallel({
        message: function(callback) {
            Message.findById(req.params.id)
              .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            Message.findByIdAndRemove(req.params.id, function deleteMessage(err) {
                if (err) { return next(err); }
                res.redirect('/')
            })
        }
    });
};

// Display Message update form on GET.
exports.message_update_get = function(req, res) {
    // Get message for form.
    async.parallel({
        message: function(callback) {
            Message.findById(req.params.id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.message==null) { // No results.
                var err = new Error('Message not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('create_message', { title: 'Update Message', user:req.user, message: results.message });
        });
};

// Handle Message update on POST.
exports.message_update_post = [

    // Validate and sanitize fields.
    body('title').trim().isLength({ min: 1 }).escape().withMessage('Title must be specified.'),
    body('message').trim().isLength({ min: 1 }).escape().withMessage('Message must be specified.'),

    // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            // There are errors. Render form again with sanitized values/errors messages.
            res.render('create_message', { title: 'New Message', user: req.user, message: req.body, errors: errors.array() });
            return;
        }
        else {
            // Data from form is valid.
            var message = new Message(
                {
                    title: req.body.title,
                    message: req.body.message,
                    _id: req.params.id
                });
            Message.findByIdAndUpdate(req.params.id, message, {}, function (err) {
                if (err) { return next(err); }
                // Successful - redirect to book detail page.
                res.redirect('/');
            });
        }
    }
];
