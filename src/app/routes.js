const User = require('./models/user');

module.exports = (app, passport, express) => {
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

  app.post('/addPocket',isLoggedIn, (req, res) => {
    User.findById(req.body.id,function(err, user) {
      if (err) {
        return done(err)
      }
      if (!user) {
        console.log("No se encontro");
      }
      user.account.pockets.push({name: req.body.pocketName, pocketBalance: 0})
      user.save()
      res.render('menu',{
        user: user
      })
    })
  })

  app.post('/addGoal',isLoggedIn, (req, res) => {
    User.findById(req.body.id,function(err, user) {
      if (err) {
        return done(err)
      }
      if (!user) {
        console.log("No se encontro");
      }
      user.account.goals.push({name: req.body.goalName, goalDate: req.body.goalDate, goalBalance: req.body.goalBalance, currentBalance: 0, status: false})
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
