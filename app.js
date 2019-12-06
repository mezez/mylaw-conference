const express = require('express');
const mongoose = require('mongoose');
const attendeeRoutes = require('./routes/attendee');
const talkRoutes = require('./routes/talk');
const bodyParser = require('body-parser');

const app = express();


app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*'); //you an replace the wildcard with specifi urls or domains.
    //multiple domains can be seperated with commas
    res.setHeader('Access-Control-Allow-Methods', '*'); //methods can be replaced with POST, PUT, PATCH, DELETE
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use(bodyParser.urlencoded({ extended: true })); //for x-www-form-urlencoded (form) data
app.use(bodyParser.json()); //for json data

app.use(attendeeRoutes);
app.use(talkRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});


mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@learn-zuf6u.mongodb.net/conference?retryWrites=true&w=majority`, { useNewUrlParser: true, useUnifiedTopology: true })
    //mongoose.connect('mongodb://localhost/talk', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(result => {

        const server = app.listen(process.env.PORT || 3000);

        //socketio connection
        const io = require('./socket').init(server);
        io.on('connection', socket => {
            //function will be executed for every new client that connects
            console.log('client connected');
        })
    })
    .catch(err => {
        console.log(err);

    });

