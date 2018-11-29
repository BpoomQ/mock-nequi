module.exports = (app, passport) => {
  app.get('/', (req, res)=>{
    res.render('index',{
      loginMessage: req.flash('loginMessage'),
      siginMessage: req.flash('siginMessage')
    })
  })

  app.post('/add', passport.authenticate('local-singin',{
    successRedirect: '/menu',
    failureRedirect: '/',
    failureFlash: true
  }))

  //app.post('/login', passport.authenticate(''))

  app.post('/add', async (req, res) => {

  })
  app.get('/menu', (req, res) => {
    res.render('menu',{
      user: req.user
    })
  })

}
