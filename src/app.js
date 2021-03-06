const express = require('express')
const app = express()

const path = require('path')
const mongoose = require('mongoose')
const passport = require('passport')
const flash = require('connect-flash')
const morgan = require('morgan')
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');

//connecting to dbs
const { url } = require('./config/database.js');
mongoose.connect( url, {useNewUrlParser: true})
  .then(db => console.log('DB connected'))
  .catch(err => console.log(err))

require('./config/passport.js')(passport)
//settings
app.set('port', process.env.PORT || 3000)
app.set('views', path.join(__dirname,'views'))
app.set('view engine', 'ejs')

//middlewares
app.use(morgan('dev'))
app.use(cookieParser())
app.use(bodyParser.urlencoded({extended: false}))
app.use(session({
  secret: 'Frappi',
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(flash())

//routes
require('./app/routes')(app, passport, express)

//static files
app.use(express.static(path.join(__dirname, 'public')))

//starting the Server
app.listen(app.get('port'),() =>{
  console.log('Server on port '+app.get('port'))
})
