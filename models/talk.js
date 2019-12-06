const mongoose = require('mongoose');
const Schema = mongoose.Schema;

talkSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    attendees: [{
        type: Schema.Types.ObjectId,
        ref: 'Attendee'
    }],

},
    { timestamps: true }
);

module.exports = mongoose.model('Talk', talkSchema);