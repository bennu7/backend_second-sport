const passport = require('passport');
const {Strategy : JwtStrategy, ExtractJwt} = require('passport-jwt');
const {User} = require('../models');

const options = {
    jwtFromRequest : ExtractJwt.fromHeader('authorization'),
    secretOrKey : process.env.JWT_SECRET
}

passport.use(new JwtStrategy(options, async(payload, done) => {
    User.findByPk(payload.id)
        .then(user => done(null, user))
        .catch(err => done (err, false));
}))

module.exports = passport;