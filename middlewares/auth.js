const jwt = require('jsonwebtoken')
module.exports = {
    userAuthentication(req, res, next) {
        const cookie = req.headers.authorization
        if (!cookie) {
            return res.status(401).send({
                message: "UnAuthenticated"
            })
        }
        jwt.verify(cookie, process.env.JWT_USER_SECRETKEY, (err, decode) => {
            if (err) {
                return res.status(401).send({
                    message: "UnAuthenticated"
                })
            }
            if (decode) {
                req.headers.userId = decode._id
                next()
            } else {
                return res.status(401).send({
                    message: "UnAuthenticated"
                })
            }
        });

    }


    
}