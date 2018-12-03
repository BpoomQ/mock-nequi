module.exports = (app, passport) => {
  app.get('/', (req, res) => {
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

  app.post('/login', passport.authenticate('local-login',{
    successRedirect: '/menu',
    failureRedirect: '/',
    failureFlash: true
  }))

  app.get('/logout', (req, res) => {
    req.logout()
    res.redirect('/')
  })

  app.get('/menu', isLoggedIn, (req, res) => {
    res.render('menu',{
      user: req.user
    })
  })

  app.post('/addMoney', isLoggedIn, (req, res) => {
    var id = req.body.idUser
    User.findById({_id: id},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = user.account.accountBalance + parseInt(req.body.money)
      user.account.accountBalance = amount
      user.save()
      res.render('menu',{
        user: user
      })
    })
  })
  
}

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}
