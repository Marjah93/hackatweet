const express = require('express');
const uid2 = require('uid2');
const bcrypt = require('bcrypt');

const User = require('../models/users');

const router = express.Router();

router.get('/test', (req, res) => {
  res.json({ result: true, message: 'Users route works' });
});

router.post('/signup', (req, res) => {
  const { firstname, username, password } = req.body;

  if (!firstname || !username || !password) {
    return res.json({
      result: false,
      error: 'Missing or empty fields',
    });
  }

  User.findOne({ username }).then((existingUser) => {
    if (existingUser) {
      return res.json({
        result: false,
        error: 'Username already exists',
      });
    }

    const newUser = new User({
      firstname,
      username,
      password: bcrypt.hashSync(password, 10),
      token: uid2(32),
    });

    newUser.save().then((savedUser) => {
      res.json({
        result: true,
        user: {
          _id: savedUser._id,
          firstname: savedUser.firstname,
          username: savedUser.username,
          token: savedUser.token,
        },
      });
    });
  });
});

router.post('/signin', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.json({
      result: false,
      error: 'Missing or empty fields',
    });
  }

  User.findOne({ username }).then((user) => {
    if (!user || !bcrypt.compareSync(password, user.password)) {
      return res.json({
        result: false,
        error: 'User not found or wrong password',
      });
    }

    res.json({
      result: true,
      user: {
        _id: user._id,
        firstname: user.firstname,
        username: user.username,
        token: user.token,
      },
    });
  });
});

module.exports = router;