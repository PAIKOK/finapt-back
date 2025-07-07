const express = require('express');
const router = express.Router();
const { registerUser, loginUser } = require('../controllers/authController');
const protect = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);

// Protected route to get current user info
router.get('/me', protect, (req, res) => {
    res.json({ user: req.user });
});

module.exports = router;
