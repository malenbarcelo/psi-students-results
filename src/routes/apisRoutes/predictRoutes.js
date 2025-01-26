const express = require('express')
const predictController = require('../../controllers/apis/predictController.js')
const router = express.Router()

//students
router.get('/students/companies/:string',predictController.companies)

module.exports = router