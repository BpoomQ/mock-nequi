const LocalStrategy = require('passport-local').Strategy
const User = require('../app/models/user');

module.exports = function (passport) {

  passport.serializeUser(function(user,done){
    done(null,user.id)
  })

  passport.deserializeUser(function(id,done){
    User.findById(id, function(err,user){
      done(err,user)
    })
  })

  //sign in
  passport.use('local-signin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, email, password, done) {
    User.findOne({'local.email': email}, function(err,user){
      if (err){
        return done(err)
      }
      if (user){
        return done(null, false, req.flash('signinMessage','Ya existe un usuario registrado con ese email.'))
      } else {
        var newUser = new User()
        newUser.local.name = req.body.name
        newUser.local.lastName = req.body.lastName
        newUser.local.email = req.body.email
        newUser.local.password = newUser.hashingPassword(req.body.password)
        newUser.save( function(err) {
          if (err) { throw err; }
          return done(null, newUser)
        })
      }
    })
  }))

  //log in
  passport.use('local-login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
  },
  function (req, email, password, done) {
    User.findOne({'local.email':email},function(err,user){
      if(err){return done(err)}
      if(!user){
        return done(null, false, req.flash('loginMessage','No se encontro un usuario registrado con ese email'))
      }
      if (!user.validatePassword(password)) {
        return done(null, false, req.flash('loginMessage','Usuario o Contraseña incorrecta'))
      }
      return done(null, user)
    })
  }))
}
