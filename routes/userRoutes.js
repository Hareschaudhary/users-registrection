const express = require('express');
const { createUser } = require('../controllers/userController');

const router = express.Router();

router.post('/', createUser); // POST /api/users

module.exports = router;
