const express = require('express');
const router = express.Router();
const { getDashboardData, getTrendsData } = require('../controllers/dashboardController');
const auth = require('../middleware/authMiddleware');

router.get('/', auth, getDashboardData);
router.get('/trends', auth, getTrendsData);

module.exports = router;
