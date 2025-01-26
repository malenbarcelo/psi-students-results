const express = require('express')
const updateController = require('../../controllers/apis/updateController.js')
const admMiddleware = require('../../middlewares/admMiddleware.js')
const router = express.Router()

//students
router.post('/students',admMiddleware,updateController.students)

module.exports = router