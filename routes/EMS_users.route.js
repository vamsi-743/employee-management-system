const express = require('express');
const controller = require('../controllers/EMS_users.controller');
const router = express.Router();

router.post('/ems_signup', controller.signupUser);
router.post('/ems_get_all_users', controller.getUsers);
router.get('/ems_get_user/:id', controller.getUserById);
router.put('/ems_update_user/:id', controller.updateUser);
router.delete('/ems_delete_user/:id', controller.deleteUser);
router.post('/ems_signin', controller.signinUser);
router.post('/ems_create_user', controller.createUser);

module.exports = router;
