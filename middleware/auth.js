const jwt = require('jsonwebtoken');
const config = require('config');

//checks the token and returns the users data from that token
module.exports = function(req, res, next) {
    //get token from header
    const token = req.header('x-auth-token');

    //check if not token
    if(!token) {
        return res.status(401).json({ msg: 'No token, authorization denied' });
    }

    //verify token
    try {
        //decoding the user
        const decoded = jwt.verify(token, config.get('jwtSecret'));

        req.user = decoded.user;
        next();
    }catch(err) {
        res.status(401).json({ msg: 'Token is not valid' });
    }
};
