const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../models/User');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res) => {
    try{
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch(err){
        console.log(err);
        res.json(500).json({msg: 'Server Error'});
    }
})


router.post('/', [
    // Email must be of correct format
    check('email', 'Email format should be correct.')
    .isEmail(),
    // password must be given to sign in
    check('password', 'Password is required to sign in.')
    .exists()
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, password } = req.body;

        const user = await User.findOne({email});

        if(!user){
            res.status(400).json({msg: 'Invalid credentials'});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            res.status(400).json({msg: 'Invalid credentials.'})
        }
        const payload = {
            user: {
                id: user.id
            }
        }
        jwt.sign(
            payload,
            config.get('jwtSecret'),
            { expiresIn: 360000 },
            (err, token) => {
                if(err){
                    throw err;
                }
                res.json({ token });
        });
    } catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;