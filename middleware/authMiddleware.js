const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    const authHeader = req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const token = authHeader.split(' ')[1];

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // assuming decoded token contains user info like _id
        next();
    } catch (err) {
        console.error('JWT verification failed:', err);
        res.status(401).json({ message: 'Token is not valid' });
    }
};

module.exports = auth;
