const express = require('express');
const { body, check } = require('express-validator');
const router = express.Router();
const attendeeController = require('../controllers/attendee');
const Attendee = require('../models/attendee');

//GET /talks
router.get('/attendees', attendeeController.getAttendees);

//POST /talk
router.post('/attendee', [body('name').trim().isLength({ min: 5 }), check('email').isEmail().normalizeEmail().custom((value, { req }) => {

    return Attendee.findOne({ email: value }).then(attendeeDoc => {
        // A attendee already exists with the email
        if (attendeeDoc) {
            //return new Promise.reject(new Error('Email exists already'));
            let promise = new Promise((resolve, reject) => {
                reject(new Error('Email exists already'));
            });

            return promise;
        }
    });
}).withMessage('Please enter a valid email'),], attendeeController.addAttendee);

router.post('/add-to-talk/:attendeeId/:talkId/', attendeeController.addAttendeeToTalk);

module.exports = router;