const express = require('express')
const getController = require('../../controllers/apis/getController.js')
const admMiddleware = require('../../middlewares/admMiddleware.js')
const router = express.Router()

//students
router.get('/students',admMiddleware,getController.students)

module.exports = router