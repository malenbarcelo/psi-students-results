const express = require('express')
const path = require('path')
const publicPath =  path.resolve('./public')
const cors = require('cors')
const session = require('express-session')
const FileStore = require('session-file-store')(session);
const bcrypt = require('bcryptjs')
const userLoggedMiddleware = require('./src/middlewares/userLoggedMiddleware.js')
const apisRoutes = require('./src/routes/apisRoutes.js')
const getRoutes = require('./src/routes/apisRoutes/getRoutes.js')
const updateRoutes = require('./src/routes/apisRoutes/updateRoutes.js')
const predictRoutes = require('./src/routes/apisRoutes/predictRoutes.js')
const usersRoutes = require('./src/routes/usersRoutes.js')
const coursesRoutes = require('./src/routes/coursesRoutes.js')
const studentsRoutes = require('./src/routes/studentsRoutes.js')
const { google } = require('googleapis')
const dotenv = require('dotenv')
const cron = require('node-cron')

//Controllers
const cronController = require('./src/controllers/cronController.js')

const app = express()

//use public as statis
app.use(express.static(publicPath))

//use cors to allow any website to connet to my app
app.use(cors())

//get forms info as objects
app.use(express.urlencoded({extended:false}))
app.use(express.json())

//set views folder in src/views
app.set('views', path.join(__dirname, 'src/views'));

//set templates extension (ejs)
app.set('view engine','ejs')

//configure session
app.use(session({
    //store: new FileStore(),
    secret:'secret',
    resave: false,
    saveUninitialized: false,
    //cookie: { secure: false } // Change to true in PRD to use HTTPS
}))

//middlewares
app.use(userLoggedMiddleware)

//get forms data
cron.schedule('*/15 * * * *', cronController.getFormsData)
//cron.schedule('*/0.5 * * * *', cronController.sendExpirationEmails)
//cronController.sendExpirationEmails()
//cronController.getFormsData()

//Declare and listen port
const APP_PORT = 3000
app.listen(APP_PORT,() => console.log("Servidor corriendo en puerto " + APP_PORT))

//Routes
app.use('/',usersRoutes)
app.use('/apis',apisRoutes)
app.use('/apis/get',getRoutes)
app.use('/apis/update',updateRoutes)
app.use('/apis/predict',predictRoutes)
app.use('/users',usersRoutes)
app.use('/courses',coursesRoutes)
app.use('/students',studentsRoutes)


//console.log(bcrypt.hashSync('user1',10))

