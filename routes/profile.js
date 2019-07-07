const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const User = require('../models/User');
const Profile = require('../models/Profile');

const { check, validationResult } = require('express-validator');

// Api to get current user profile

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

// Api to get profiles of all users

router.get('/', auth, async (req, res) => {
    try {
        const profiles = await Profile.find({})
        .populate('user', ['name', 'avatar']);
    
        res.json(profiles);
    } catch(err){
        console.log(err);
        res.status(500).send('Server error');
    }
});

// Api to get profile os user with particular user id

router.get('/users/:user_id', auth, async (req, res) => {
    try {
        const profile = await Profile.findOne({user: req.params.user_id})
        .populate('user', ['name', 'avatar']);
    
        if(!profile){
            return res.status(400).json({msg: 'Profile not found.'});
        }

        res.json(profile);
    } catch(err){
        if(err.kind == 'ObjectId'){
            return res.status(400).json({msg: 'Profile not found.'});
        }
        console.log(err);
        res.status(500).send('Server error');
    }
});

// Api to create or update profile of current user

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

// Api to delete profile of current user

router.delete('/', auth, async (req, res) => {

    try {
        // Delete profile of user
        await Profile.findOneAndRemove({user: req.user.id});
        // Delete user
        await User.findOneAndRemove({_id: req.user.id});
        res.json({msg: 'User and profile deleted successfully.'});        
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }

})

// Api to add experience to profile of user

router.put('/experience', [ auth,
    // title is required
    check('title', 'Title is required.')
    .not()
    .isEmpty(),
    // company is required
    check('company', 'Company is required.')
    .not()
    .isEmpty(),
    check('from', 'From is required.')
    .not()
    .isEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        let profile = await Profile.findOne({user: req.user.id});

        if(!profile){
            return res.status(400).json({msg: 'Profile not found for this user.'});
        }

        const {
            title,
            company,
            location,
            from,
            to,
            current,
            description 
        } = req.body;

        // Build profile object
        const experience = {
            title,
            company,
            location,
            from,
            to,
            current,
            description
        }

        profile.experience.unshift(experience);

        profile = await profile.save();
        res.json(profile);

    } catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
})

// Api to delete an experience in user profile

router.delete('/experience/:experience_id', auth, async (req, res) => {

    try {
        let profile = await Profile.findOne({user: req.user.id});      
        const index = profile.experience.map(exp => exp.id).indexOf(req.params.experience_id);
        if(index < 0){
            return res.status(400).json({msg: 'Experience not found.'});
        }
        profile.experience.splice(index, 1);
        profile = await profile.save();
        res.json(profile);
        
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }

})

// Api to add education to profile of user

router.put('/education', [ auth,
    // title is required
    check('school', 'Scholl is required.')
    .not()
    .isEmpty(),
    // company is required
    check('degree', 'Degree is required.')
    .not()
    .isEmpty(),
    check('from', 'From is required.')
    .not()
    .isEmpty(),
  ], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
        let profile = await Profile.findOne({user: req.user.id});

        if(!profile){
            return res.status(400).json({msg: 'Profile not found for this user.'});
        }

        const {
            school,
            degree,
            from,
            to,
            fieldofstudy,
            current,
            description
        } = req.body;

        const education = {
            school,
            degree,
            from,
            to,
            fieldofstudy,
            current,
            description
        }

        profile.education.unshift(education);

        profile = await profile.save();
        res.json(profile);

    } catch(err){
        console.log(err);
        res.status(500).send('Server Error');
    }
})

// Api to delete an education in user profile

router.delete('/education/:education_id', auth, async (req, res) => {

    try {
        let profile = await Profile.findOne({user: req.user.id});      
        const index = profile.education.map(exp => exp.id).indexOf(req.params.education_id);
        if(index < 0){
            return res.status(400).json({msg: 'Education not found.'});
        }
        profile.education.splice(index, 1);
        profile = await profile.save();
        res.json(profile);
        
    } catch (err) {
        console.log(err);
        res.status(500).send("Server Error");
    }

})
module.exports = router;