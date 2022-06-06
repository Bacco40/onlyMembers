var express = require('express');
var router = express.Router();

// Require controller modules.
var member_controller = require('../controllers/memberController');
var message_controller = require('../controllers/messageController');
var comment_controller = require('../controllers/commentController');

/// MEMBER ROUTES ///

// GET catalog home page.
router.get('/', member_controller.index);

// GET request for creating a Member. NOTE This must come before routes that display Member (uses id).
router.get('/member/create', member_controller.member_create_get);

// POST request for creating Member.
router.post('/member/create', member_controller.member_create_post);

// GET request for log in a Member. NOTE This must come before routes that display Member (uses id).
router.get('/member/login', member_controller.member_log_in_get);

// POST request for log in a Member.
router.get('/member/logout', member_controller.member_log_out_post);

// POST request for log out Member.
router.post('/member/login', member_controller.member_log_in_post);

// GET request to update Member.
router.get('/member/:id/update', member_controller.member_update_get);

// POST request to update Member.
router.post('/member/:id/update', member_controller.member_update_post);

// GET request for one Member.
router.get('/member/:id', member_controller.member_detail);

// GET request for list of all Member items.
router.get('/members', member_controller.member_list);

// GET request to delete Comment.
router.get('/member/:id/delete', member_controller.member_delete_get);

// GET request to delete Comment.
router.get('/member/:id/upgrade', member_controller.member_upgrade_get);

/// MESSAGE ROUTES ///

// GET request for creating Message. NOTE This must come before route for id (i.e. display message).
router.get('/message/create', message_controller.message_create_get);

// POST request for creating Message.
router.post('/message/create', message_controller.message_create_post);

// GET request to delete Message.
router.get('/message/:id/delete', message_controller.message_delete_post);

// GET request to update Message.
router.get('/message/:id/update', message_controller.message_update_get);

// POST request to update Message.
router.post('/message/:id/update', message_controller.message_update_post);

// GET request for one Message.
router.get('/message/:id', message_controller.message_detail);

/// COMMENT ROUTES ///

//GET request for creating Comment.
router.post('/comment/:id/create', comment_controller.comment_create_post);

// GET request to delete Comment.
router.get('/comment/:id/delete', comment_controller.comment_delete_get);

module.exports = router;

