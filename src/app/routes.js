module.exports = (app, passport) => {
  app.get('/', (req, res)=>{
    res.render('index',{
      loginMessage: req.flash('loginMessage'),
      signinMessage: req.flash('signinMessage')
    })
  })

  app.post('/add', passport.authenticate('local-signin',{
    successRedirect: '/menu',
    failureRedirect: '/',
    failureFlash: true
  }))

  //app.post('/login', passport.authenticate(''))

  app.get('/logout', (req, res)=>{
    req.logout()
    res.redirect('/')
  })

  app.get('/menu', isLoggedIn, (req, res) => {
    res.render('menu',{
      user: req.user
    })
  })

}

function isLoggedIn(req,res,next) {
  if (req.isAuthenticated()) {
    return next
  }
  return res.redirect('/')
}
