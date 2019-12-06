const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const talkController = require('../controllers/talk');

//GET /talks
router.get('/talks', talkController.getTalks);

//POST /talk
router.post('/talk', [body('title').trim().isLength({ min: 5 })], talkController.createTalk);

router.post('/delete-talk/:talkId', talkController.deleteTalk);

module.exports = router;