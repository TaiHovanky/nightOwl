module.exports = function(db){
    return {
        requireAuthentication: function(req, res, next){
            var token = req.get('Auth');
            db.user.findByToken(token).then(function(user){
                req.user = user;
                next();
            }, function(err){
                res.status(401).send();
            });
        } //runs before callback function in app route runs
    }; // check for token, decrypt token to get user ID and type out of token
} 

//findByToken is a custom class