var async = require('async');
const { body,validationResult } = require('express-validator');
const bcrypt = require("bcryptjs");
const Member = require('../models/member');
var Message = require('../models/message');
const passport = require("passport");
require('../controllers/passport')(passport);

const avatars=[
    {pic:'/avatar/avatar.png'},
    {pic:'/avatar/avatar8.png'},
    {pic:'/avatar/Avatar12.png'},
    {pic:'/avatar/Avatar16.png'},
    {pic:'/avatar/Avatar18.png'},
    {pic:'/avatar/Avatar28.png'},
    {pic:'/avatar/Avatar34.png'},
    {pic:'/avatar/Avatar36.png'},
]

exports.index = function(req, res) {
    Message.find({})
    .sort({date_of_creation : -1})
    .populate('creator')
    .populate({
        path:'comments',
        populate: { path: 'creator' }
    })
    .exec(function (err, messages) {
      if (err) { return next(err); }
      //Successful, so render
      res.render("index", {title:'OnlyMember', user: req.user , messages:messages});
    })
};

// Display list of all Members.
exports.member_list = function(req, res, next) {
    async.parallel({
        member: function(callback) {
            Member.find({ 'isMember': true })
              .sort({username : 1})
              .exec(callback);
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Successful, so render
        res.render('members', { title: 'Total Members', user:req.user , members: results.member } );
    });
};

// Display detail page for a specific Member.
exports.member_detail = function(req, res, next) {
    async.parallel({
        member: function(callback) {
            Member.findById(req.params.id)
              .exec(callback)
        },
        member_messages: function(callback) {
          Message.find({ 'creator': req.params.id })
          .sort({date_of_creation : -1})
          .populate('creator')
          .populate({
            path:'comments',
            populate: { path: 'creator' }
          })
          .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); } // Error in API usage.
        if (results.member==null) { // No results.
            var err = new Error('Member not found');
            err.status = 404;
            return next(err);
        }
        // Successful, so render.
        res.render('member_detail', { title: 'Member Detail', member: results.member, member_messages: results.member_messages, user:req.user } );
    });
};

// Display Member create form on GET.
exports.member_log_in_get = function(req, res) {
    res.render('logIn_member',{title:'Log In', message: req.flash('error')});
};

// Handle Member create on POST.
exports.member_log_in_post = function(req, res, next) {
  passport.authenticate('local', {
    successRedirect:"/",
    failureRedirect: "/member/login",
    failureFlash: true
  })(req, res, next);
};

// Display Member create form on GET.
exports.member_create_get = function(req, res) {
    res.render('create_member',{title:'Sign Up', avatars: avatars});
};

// Handle Member create on POST.
exports.member_create_post =[
    // Convert the profile pic to an array.
    (req, res, next) => {
        if(!(req.body.avatar instanceof Array)){
            if(typeof req.body.avatar ==='undefined')
            req.body.avatar = [];
            else
            req.body.avatar = new Array(req.body.avatar);
        }
        next();
    }, 

    // Validate and sanitize fields.
    body('username', 'Username must not be empty, and can have max 20 characters.').trim().isLength({ min: 1 , max: 20 }).escape(),
    body('password', 'Password must be at least 8 character.').trim().isLength({ min: 8 }).escape(),
    body('confPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
          throw new Error('Password confirmation does not match password');
        }
        return true;
    }),
    body('avatar').custom((value, { req }) => {
        if (req.body.avatar.length !== 1) {
          throw new Error('You have to select 1 profile pic');
        }
        return true;
    }),

     // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req);

        var password1='';
        bcrypt.hash(req.body.password, 10, (err, hashedPassword) => {
            if (err) { 
                return next(err);
            }
            password1=hashedPassword;
            const member = new Member({
                username: req.body.username,
                password: password1,
                profile_pic: req.body.avatar[0],
            })

            if (!errors.isEmpty()) {
                res.render('create_member', { title: 'Sign Up', member:member , avatars: avatars, errors: errors.array() });
            }else{
                Member.findOne({ 'username': req.body.username })
                .exec( function(err, found_username) {
                   if (err) { return next(err); }
        
                   if (found_username) {
                     const message = [{msg:'Username already taken'}];
                     // Member username exists, redirect to its detail page.
                     res.render('create_member', { title: 'Sign Up', member:member , avatars: avatars, errors: message });
                   }
                   else {
                    // Data from form is valid. Save member.
                    member.save(function (err) {
                        if (err) { return next(err); }
                        res.redirect('/member/login');
                        });
                   }
            })
            }
        })  
}];

// Handle Member log out on POST.
exports.member_log_out_post = function(req, res) {
    req.logout(function (err) {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  }

// Display Member update form on GET.
exports.member_update_get = function(req, res) {
    async.parallel({
        member: function(callback) {
            Member.findById(req.params.id).exec(callback);
        },
        }, function(err, results) {
            if (err) { return next(err); }
            if (results.member==null) { // No results.
                var err = new Error('Member not found');
                err.status = 404;
                return next(err);
            }
            // Success.
            res.render('create_member', { title: 'Edit Profile', member:results.member , avatars: avatars, user:req.user});
        })
};

// Handle Member update on POST.
exports.member_update_post = [
    // Convert the profile pic to an array.
    (req, res, next) => {
        if(!(req.body.avatar instanceof Array)){
            if(typeof req.body.avatar ==='undefined')
            req.body.avatar = [];
            else
            req.body.avatar = new Array(req.body.avatar);
        }
        next();
    }, 

    // Validate and sanitize fields.
    body('username', 'Username must not be empty, and can have max 20 characters.').trim().isLength({ min: 1 , max: 20 }).escape(),
    body('avatar').custom((value, { req }) => {
        if (req.body.avatar.length !== 1) {
          throw new Error('You have to select 1 profile pic');
        }
        return true;
    }),

     // Process request after validation and sanitization.
    (req, res, next) => {

        // Extract the validation errors from a request.
        const errors = validationResult(req)
        const member = new Member({
            username: req.body.username,
            profile_pic: req.body.avatar[0],
            isMember:true,
            _id:req.params.id
        })

        if (!errors.isEmpty()) {
            res.render('create_member', { title: 'Edit Profile', member:member , avatars: avatars, user:req.user, errors: errors.array()});
        }else{
            Member.findOne({ 'username': req.body.username })
            .exec( function(err, found_username) {
                if (err) { return next(err); }
    
                if (found_username && found_username.id!==req.params.id) {
                    const message = [{msg:'Username already taken'}];
                    // Member username exists, redirect to its detail page.
                    res.render('create_member', { title: 'Edit Profile', member:member , avatars: avatars, user:req.user, errors: message});
                }
                else {
                // Data from form is valid. Update member.
                Member.findByIdAndUpdate(req.params.id, member, {}, function (err,theMember) {
                    if (err) { return next(err); }
                    res.redirect(`/member/${req.params.id}`);
                });
                }
            })
        }
}];

// Handle Member delete on Get.
exports.member_delete_get = function(req, res) {
    async.parallel({
        member: function(callback) {
            Member.findById(req.params.id)
              .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            Member.findByIdAndRemove(req.params.id, function deleteMember(err) {
                if (err) { return next(err); }
                Message.remove({creator:req.params.id}, function deleteMessages(err) { 
                    if (err) { return next(err); } 
                    res.redirect('/members')
                });
            })
        }
    });
};

// Handle Member upgrade on Get.
exports.member_upgrade_get = function(req, res) {
    async.parallel({
        member: function(callback) {
            Member.findById(req.params.id)
              .exec(callback)
        },
    }, function(err, results) {
        if (err) { return next(err); }
        // Success
        else {
            const member = new Member({
                isMember:true,
                _id:req.params.id
            })
            Member.findByIdAndUpdate(req.params.id, member, {}, function (err,theMember) {
                if (err) { return next(err); }
                res.redirect(`/members`);
            });
        }
    });
};
