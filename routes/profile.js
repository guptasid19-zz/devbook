const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const Profile = require('../models/Profile');

const { check, validationResult } = require('express-validator');

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.user.id})
        .populate('user', ['name', 'avatar']);

        if(!profile){
            res.status(400).json({msg: 'Profile not found.'});
        }
    
        res.json(profile);
    } catch(err){
        console.log(err);
        res.status(500).send('Server error');
    }
});


router.post('/', [ auth,
    // status is required
    check('status', 'Status is required.')
    .not()
    .isEmpty(),
    // skills are required
    check('skills', 'Skills are required.')
    .not()
    .isEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        const {
            company,
            status,
            website,
            location,
            skills,
            bio,
            githubusername,
            youtube,
            twitter,
            linkedin,
            instagram,
            facebook  
        } = req.body;

        // Build profile object
        const profileFields = {};
        profileFields.user = req.user.id;
        if(company) profileFields.company = company;
        if(status) profileFields.status = status;
        if(website) profileFields.website = website;
        if(location) profileFields.location = location;
        if(bio) profileFields.bio = bio;
        if(githubusername) profileFields.githubusername = githubusername;
        
        profileFields.social = {};
        if(youtube) profileFields.social.youtube = youtube;
        if(twitter) profileFields.social.twitter = twitter;
        if(linkedin) profileFields.social.linkedin = linkedin;
        if(instagram) profileFields.social.instagram= instagram;
        if(facebook) profileFields.social.facebook = facebook;
        if(skills){
            profileFields.skills = skills.split(',').map(skill => skill.trim());
        }

        // Check if profile exists

        let profile = await Profile.findOne({user: profileFields.user});

        // Update profile if it exists

        if(profile){
           profile = await Profile.findOneAndUpdate(
               { user: profileFields.user },
               { $set: profileFields },
               { new: true }
           );

           return res.json(profile);
        }
        // Create new profile

        profile = new Profile(profileFields);    
        profile = await profile.save();
        res.json(profile);
    } catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
})

module.exports = router;