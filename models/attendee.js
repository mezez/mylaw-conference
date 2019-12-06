const mongoose = require('mongoose');
const Schema = mongoose.Schema;

attendeeSchema = new Schema(
    {
        name: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true
        },
        talks: [{
            type: Schema.Types.ObjectId,
            ref: 'Talk'
        }],
    },
    { timestamps: true }
);

module.exports = mongoose.model('Attendee', attendeeSchema);