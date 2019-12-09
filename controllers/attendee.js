const { validationResult } = require('express-validator');
const Talk = require('../models/talk');
const Attendee = require('../models/attendee');
const io = require('../socket');

exports.getAttendees = async (req, res, next) => {

    try {

        const totalItems = await Talk.find().countDocuments();
        const attendees = await Attendee.find().populate('talks').sort({ createdAt: -1 })
        if (!attendees) {
            const error = new Error("Attendees not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            attendees: attendees,
            totalItems: totalItems
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.addAttendee = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Vallidation Failed');
        error.statusCode = 422;
        throw error;
    }

    const name = req.body.name;
    const email = req.body.email;

    //validation passed
    const attendee = new Attendee({
        name: name,
        email: email,
        talks: []
    });

    try {
        await attendee.save();
        io.getIO().emit('attendee', { action: 'createAttendee', attendee: attendee });
        res.status(201).json({
            message: "Attendee created successfully",
            attendee: attendee
        });
    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.addAttendeeToTalk = async (req, res, next) => {
    const attendeeId = req.params.attendeeId;
    const talkId = req.params.talkId;

    //check for validity
    try {

        const attendee = await Attendee.findById(attendeeId);
        if (!attendee) {
            const error = new Error("Invalid attendee Id");
            error.statusCode = 404;
            throw error;
        }
        const talk = await Talk.findById(talkId);
        if (!talk) {
            const error = new Error("Invalid talk Id");
            error.statusCode = 404;
            throw error;
        }

        //attendee has been addes to talk?
        const result = talk.attendees.filter(attendee => {
            return attendee._id === attendeeId;
        });

        if (result && result.length > 0) {
            res.status(201).json({
                message: "Attendee already added to Talk"
            });
        } else {

            //do the add
            attendee.talks.push(talk);
            talk.attendees.push(attendee);

            await attendee.save();
            await talk.save();

            res.status(201).json({
                message: "Attendee successully added to Talk"
            });
        }

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};