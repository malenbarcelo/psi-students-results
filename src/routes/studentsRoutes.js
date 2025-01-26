const express = require('express')
const studentsController = require('../controllers/studentsController.js')
const router = express.Router()
const authMiddleware = require('../middlewares/authMiddleware.js')
const admMiddleware = require('../middlewares/admMiddleware.js')

router.get('/',admMiddleware,studentsController.students)

module.exports = router

