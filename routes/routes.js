'use strict';

const express = require('express');
const router = express.Router();
const UserController = require('../controllers/user');
const md_auth = require('../middleware/authenticated');

const multiparty = require('connect-multiparty');
const md_upload = multiparty({ uploadDir: './uploads/users'});

router.get('/ruta', UserController.prueba);
router.post('/save', UserController.save);
router.post('/login', UserController.login);
router.put('/update', md_auth.authenticated , UserController.update);
router.post('/upload-avatar', [md_auth.authenticated, md_upload], UserController.uploadAvatar);
router.get('/avatar/:fileName', UserController.avatar);
router.get('/users', UserController.getUsers);
router.get('/user/:userId', UserController.getUser);

module.exports = router;