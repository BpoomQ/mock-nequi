module.exports = (app, passport) => {
  app.get('/', (req, res)=>{
    res.render('index',{
      loginMessage: req.flash('loginMessage'),
      siginMessage: req.flash('siginMessage')
    })
  })

  app.post('/login', async(req, res) =>{
  })

  app.post('/add', async (req, res) => {

  })
  app.get('/test', async (req, res) => {
    res.render('menu');
  })

}
