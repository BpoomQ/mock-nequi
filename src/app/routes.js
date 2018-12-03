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

  app.get('/colchon', isLoggedIn, (req, res) =>{
    res.render('mattress',{
      user: req.user
    })
  })
  app.post('/returnMoneyToAccount',isLoggedIn, (req,res)=>{
    User.findById({_id: req.body.idUser},function(err, user){
      if (err) {
        res.status(500).send()
      }
      console.log(req.body);
      var amount = parseInt(req.body.money)
      user.account.mattress.mattressBalance -= amount
      user.account.accountBalance += amount
      user.save()
      res.render('mattress',{
        user: user
      })
    })
  })

  app.post('/addMoneyToMattress',isLoggedIn, (req, res) =>{
    User.findById({_id: req.body.idUser},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = parseInt(req.body.money)
      user.account.mattress.mattressBalance += amount
      user.account.accountBalance -= amount
      user.save()
      res.render('mattress',{
        user: user
      })
    })
  })

  app.get('/bolsillo/:userId/:pocketId', isLoggedIn,(req, res) => {
    User.findById(req.params.userId,"account.pockets", function(err, user) {
      console.log(user)
      for (var i = 0; i < user.account.pockets.length; i++) {
        if(user.account.pockets[i].id == req.params.pocketId){
          pocket = (user.account.pockets[i]);
          User.findById(req.params.userId, function(err, user) {
            res.render('pocket',{
              user, pocket
            })
          }
        )}
      }
    })
  })

  app.get('/meta/:userId/:goalId', isLoggedIn,(req, res) => {
    User.findById(req.params.userId,"account.goals", function(err, user) {
      for (var i = 0; i < user.account.goals.length; i++) {
        if(user.account.goals[i].id == req.params.goalId){
          goal = (user.account.goals[i]);
          User.findById(req.params.userId, function(err, user) {
            res.render('goals',{
              user, goal
            })
          }
        )}
      }
    })
  })

  app.post('/deleteGoal/:userId/:goalId', isLoggedIn,(req, res) => {
    User.findById(req.params.userId, function(err, user) {
      //var amount = parseInt(user.account.goals.goalBalance)
      //user.account.accountBalance += amount
      user.account.goals.pull(req.params.goalId)
      user.save()
      res.render('menu',{
        user: user
      })
    })
  })

  app.post('/deletePocket/:userId/:pocketId', isLoggedIn,(req, res) => {
    User.findById(req.params.userId, function(err, user) {
      //var amount = parseInt(user.account.pockets.pocketBalance)
      //user.account.accountBalance += amount
      user.account.pockets.id(req.params.pocketId).remove()
      user.save()
      res.render('menu',{
        user: user
      })
    })
  })

  app.post('/addCurrencyGoal',isLoggedIn, (req, res) =>{
    User.findById({_id: req.body.idUser},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = parseInt(req.body.money)
      user.account.goals.id(req.body.idGoal).currentBalance += amount
      user.account.accountBalance -= amount
      goal = user.account.goals.id(req.body.idGoal)
      user.save()
      res.render('goals',{
        user, goal
      })
    })
  })

  app.post('/addCurrencyPocket',isLoggedIn, (req, res) =>{
    User.findById({_id: req.body.idUser},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = parseInt(req.body.money)
      user.account.pockets.id(req.body.pocketId).pocketBalance += amount
      user.account.accountBalance -= amount
      pocket = user.account.pockets.id(req.body.pocketId)
      user.save()
      res.render('pocket',{
        user, pocket
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
