const express = require('express');
const router = express.Router();

router.use('/auth', require('./auth'));
router.use('/cars', require('./cars'));
router.use('/bookings', require('./bookings'));
router.use('/admin', require('./admin'));
router.use('/newsletter', require('../newsletter'));
router.use('/reviews', require('../reviews'));
router.use('/promos', require('../promos'));
router.use('/wishlist', require('../wishlist'));
router.use('/event-admin', require('../eventAdmin'));

module.exports = router;