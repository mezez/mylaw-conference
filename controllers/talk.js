const { validationResult } = require('express-validator');
const Talk = require('../models/talk');
const Attendee = require('../models/attendee');
const io = require('../socket');

exports.getTalks = async (req, res, next) => {

    try {

        const totalItems = await Talk.find().countDocuments();
        const talks = await Talk.find().populate('attendees').sort({ createdAt: -1 })
        if (!talks) {
            const error = new Error("Talks not found");
            error.statusCode = 404;
            throw error;
        }
        res.status(200).json({
            talks: talks,
            totalItems: totalItems
        });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    }
};

exports.createTalk = async (req, res, next) => {

    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const error = new Error("Validation failed");
        console.log(errors.array());

        error.statusCode = 422;
        throw error;
    }

    const title = req.body.title;

    //create talk in the database

    const talk = new Talk({
        title: title,
        attendee: []
    });

    try {
        await talk.save()

        io.getIO().emit('posts', { action: 'create', talk: talk }); //sends a message 
        res.status(201).json({
            message: "Talk created successfullly",
            talk: talk,
        });
    }
    catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err); //this will take the code to the next express error handling middleware
        //console.log(err)
    }


};



exports.deleteTalk = async (req, res, next) => {
    const talkId = req.params.talkId;
    try {
        const talk = await Talk.findById(talkId).populate('attendees');
        console.log(talk.attendees);

        if (!talk) {
            const error = new Error("Talk not found");
            error.statusCode = 404;
            throw error;
        }

        await Talk.findByIdAndRemove(talkId);

        //delete the reference in the attendees collection
        const { attendees } = talk;
        attendees.forEach(async attendee => {
            const result = await Attendee.findById(attendee._id);

            result.talk.pull(talk._id);
            await result.save();
        });

        io.getIO().emit('talks', { action: "delete", data: talkId });
        res.status(200).json({ message: "talk deleted successfully" });

    } catch (err) {
        if (!err.statusCode) {
            err.statusCode = 500;
        }
        next(err);
    };

};