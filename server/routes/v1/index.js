const express = require('express');
const router = express.Router();

router.use('/cars', require('../cars'));
router.use('/newsletter', require('../newsletter'));
router.use('/reviews', require('../reviews'));
router.use('/waitlist', require('../waitlist'));

module.exports = router;