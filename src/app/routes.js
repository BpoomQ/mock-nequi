const User = require('./models/user');
const Transfer = require('./models/transfer');

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
    User.find({},"local.email",function(err, users){
      if(err){ res.status(500).send() }
      res.render('menu',{
        user: req.user,
        users: users
      })
    })
  })

  app.post('/addMoney', isLoggedIn, (req, res) => {
    var id = req.body.userId
    User.findById({_id: id},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = user.account.accountBalance + parseInt(req.body.money)
      user.account.accountBalance = amount
      user.save()
      res.redirect('/menu')
    })
  })

  app.post('/addPocket',isLoggedIn, (req, res) => {
    User.findById(req.body.id,function(err, user) {
      if (err) {
        return done(err)
      }
      user.account.pockets.push({name: req.body.pocketName, pocketBalance: 0})
      user.save()
      res.redirect('/menu')
    })
  })

  app.post('/addGoal',isLoggedIn, (req, res) => {
    User.findById(req.body.userId,function(err, user) {
      if (err) {
        return done(err)
      }
      user.account.goals.push({
        name: req.body.goalName,
        goalDate: req.body.goalDate,
        goalBalance: req.body.goalBalance,
        currentBalance: 0,
        status: true
      })
      user.save()
      res.redirect('/menu')
    })
  })

  app.get('/colchon', isLoggedIn, (req, res) =>{
    res.render('mattress',{
      user: req.user
    })
  })
  app.post('/returnMoneyToAccount',isLoggedIn, (req,res)=>{
    User.findById({_id: req.body.userId},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = parseInt(req.body.money)
      user.account.mattress.mattressBalance -= amount
      user.account.accountBalance += amount
      user.save()
      res.redirect('/colchon')
    })
  })

  app.post('/addMoneyToMattress',isLoggedIn, (req, res) =>{
    User.findById({_id: req.body.userId},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = parseInt(req.body.money)
      user.account.mattress.mattressBalance += amount
      user.account.accountBalance -= amount
      user.save()
      res.redirect('/colchon')
    })
  })

  app.get('/bolsillos/:userId/:pocketId', isLoggedIn,(req, res) => {
    User.findById(req.params.userId,"account.pockets", function(err, user) {
      for (var i = 0; i < user.account.pockets.length; i++) {
        if(user.account.pockets[i].id == req.params.pocketId){
          pocket = (user.account.pockets[i]);
          User.findById(req.params.userId, function(err, user) {
            User.find({},"local.email",function(err, users){
              if(err){ res.status(500).send() }
              res.render('pocket',{
                user, pocket, users
              })
            })
          }
        )}
      }
    })
  })

  app.get('/metas/:userId/:goalId', isLoggedIn,(req, res) => {
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

  app.post('/goal-accomplished/:userId/:goalId', isLoggedIn,(req, res) => {
    var userId = req.params.userId
    var goalId = req.body.goalId
    User.findById(userId, function(err, user) {
      var goal= user.account.goals.id(goalId)
      if(goal.status){
        var amount = goal.currentBalance
        user.account.accountBalance += amount
        goal.status = !goal.status
        user.save()
      }
      res.redirect('/menu')
    })
  })

  app.post('/deletePocket/:userId/:pocketId', isLoggedIn,(req, res) => {
    User.findById(req.params.userId, function(err, user) {
      var pocket = req.body.pocketId
      var pockets = user.account.pockets
      for (var i = 0; i < pockets.length; i++) {
        if(pockets[i]._id==pocket){
          var amount = pockets[i].pocketBalance
          user.account.accountBalance += amount
        }
      }
      user.account.pockets.id(req.params.pocketId).remove()
      user.save()
      res.redirect('/menu')
    })
  })

  app.post('/addCurrencyGoal',isLoggedIn, (req, res) =>{
    User.findById({_id: req.body.userId},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = parseInt(req.body.money)
      user.account.goals.id(req.body.idGoal).currentBalance += amount
      user.account.goals.id(req.body.idGoal).goalBalance -= amount
      user.account.accountBalance -= amount
      goal = user.account.goals.id(req.body.idGoal)
      user.save()
      res.redirect('/metas/'+req.body.userId+'/'+req.body.idGoal)
    })
  })

  app.post('/addCurrencyPocket',isLoggedIn, (req, res) =>{
    User.findById({_id: req.body.userId},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = parseInt(req.body.money)
      user.account.pockets.id(req.body.pocketId).pocketBalance += amount
      user.account.accountBalance -= amount
      user.save()
      res.redirect('/bolsillos/'+req.body.userId+'/'+req.body.pocketId)
    })
  })

  app.get('/bolsillos', isLoggedIn, (req, res) =>{
    res.render('pocketList',{
      user: req.user
    })
  })
  app.get('/metas', isLoggedIn, (req, res) =>{
    res.render('goalList',{
      user: req.user
    })
  })

  app.post('/transfer/pocket', isLoggedIn, (req, res) => {
    var sender = req.body.userId
    var addressee = req.body.addressee
    var amount = parseInt(req.body.amount)
    var pocket = req.body.pocketId
    console.log(pocket);
    User.findById(sender,function (err,currencyUser) {
      if (err) {
        return done(err)
      }
      User.findById(addressee, function(err, addresseeUser){
        if (err) {
          return done(err)
        }
        console.log(currencyUser.account.pockets.id(pocket));
        currencyUser.account.pockets.id(pocket).pocketBalance -= amount
        addresseeUser.account.accountBalance += amount
        currencyUser.save()
        addresseeUser.save()
        var transfer = new Transfer({
          sender : sender,
          addressee : addressee,
          amount : amount
        })
        transfer.save()
        res.redirect("/menu")
      })
    })
  })

  app.post('/transfer', isLoggedIn, (req, res) => {
    var sender = req.body.userId
    var addressee = req.body.addressee
    var amount = parseInt(req.body.amount)
    User.findById(sender,function (err,currencyUser) {
      if (err) {
        return done(err)
      }
      User.findById(addressee, function(err, addresseeUser){
        if (err) {
          return done(err)
        }
        currencyUser.account.accountBalance -= amount
        addresseeUser.account.accountBalance += amount
        currencyUser.save()
        addresseeUser.save()
        var transfer = new Transfer({
          sender : sender,
          addressee : addressee,
          amount : amount
        })
        transfer.save()
        res.redirect("/menu")
      })
    })
  })

  app.get('/transfers',isLoggedIn, (req, res)=>{
    Transfer.find({}, function(err, transfers){
      if (err) {
        return done(err)
      }
      User.find({},function(err, users){
        res.render('transfer-history',{
          user: req.user,
          transfers: transfers,
          users: users
        })
      })
    })
  })

  app.post('/withdrawals', isLoggedIn, (req, res) => {
    var id = req.body.userId
    User.findById({_id: id},function(err, user){
      if (err) {
        res.status(500).send()
      }
      var amount = user.account.accountBalance - parseInt(req.body.money)
      user.account.accountBalance = amount
      user.save()
      res.redirect('/menu')
    })
  })

  app.post('/withdrawals/pocket',isLoggedIn, (req, res) =>{
    var amount = parseInt(req.body.money)
    var pocket = req.body.pocketId
    console.log(pocket);
    User.findById({_id: req.body.userId},function(err, user){
      if (err) {
        res.status(500).send()
      }
      user.account.pockets.id(pocket).pocketBalance -= amount
      user.save()
      res.redirect('/bolsillos/'+req.body.userId+'/'+req.body.pocketId)
    })
  })

}

function isLoggedIn (req, res, next) {
	if (req.isAuthenticated()) {
		return next();
	}
	res.redirect('/');
}
