const bcrypt = require('bcryptjs');
const User = require('../models/User');

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// POST /api/users
exports.createUser = async (req, res, next) => {
  try {
    const { username, email, password } = req.body || {};

    const problems = [];
    if (typeof username !== 'string' || username.trim().length < 3) {
      problems.push('username must be at least 3 characters');
    }
    if (typeof email !== 'string' || !EMAIL_PATTERN.test(email.trim())) {
      problems.push('email is not valid');
    }
    if (typeof password !== 'string' || password.length < 8) {
      problems.push('password must be at least 8 characters');
    }
    if (problems.length > 0) {
      return res.status(400).json({ error: 'Validation failed', details: problems });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      username: username.trim(),
      email: email.trim().toLowerCase(),
      password: passwordHash,
    });

    // The password (even hashed) is never sent back.
    return res.status(201).json({
      message: 'User created',
      user: { id: user._id, username: user.username, email: user.email, createdAt: user.createdAt },
    });
  } catch (err) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern || {})[0] || 'value';
      return res.status(409).json({ error: 'Conflict', message: `This ${field} is already registered` });
    }
    return next(err);
  }
};
