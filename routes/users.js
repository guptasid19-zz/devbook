const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const gravatar = require('gravatar');
const jwt = require('jsonwebtoken');
const config = require('config');

const User = require('../models/User');

const { check, validationResult } = require('express-validator');

router.post('/', [
    // name is required
    check('name', 'Name is required.')
    .not()
    .isEmpty(),
    // Email must be of correct format
    check('email', 'Email format should be correct.')
    .isEmail(),
    // password must be at least 5 chars long
    check('password', 'Password must be atleast 5 characters long.')
    .isLength({ min: 5 })
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const { email, name, password } = req.body;

        const user = await User.findOne({email});

        if(user){
            res.status(400).send({errors: [{msg: 'User already exists'}]});
        }

        
        const avatar = gravatar.url('emerleite@gmail.com', {s: '200', r: 'pg', d: 'mm'});

        let new_user = new User({
            name,
            email,
            password,
            avatar
        })

        const salt = await bcrypt.genSalt(10);
        new_user.password = await bcrypt.hash(password, salt);

        await new_user.save();
        const payload = {
            user: {
                id: new_user.id
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