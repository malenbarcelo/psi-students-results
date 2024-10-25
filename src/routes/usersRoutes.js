const express = require('express')
const usersController = require('../controllers/usersController.js')
const router = express.Router()
const userFormsValidations = require('../validations/userFormsValidations.js')
const authMiddleware = require('../middlewares/authMiddleware.js')
const admMiddleware = require('../middlewares/admMiddleware.js')

router.get('/',usersController.login)
router.post('/login',userFormsValidations.loginFormValidations,usersController.processLogin)
router.get('/logout',usersController.logout)
router.get('/create-administrator',admMiddleware,usersController.createAdministrator)
router.post('/create-administrator',admMiddleware,userFormsValidations.createAdmFormValidations,usersController.processCreateAdministrator)
router.post('/change-password',userFormsValidations.changePswFormValidations,usersController.processChangePassword)
router.get('/delete-administrator',admMiddleware,usersController.deleteAdministrator)
router.post('/delete-administrator',admMiddleware,userFormsValidations.deleteAdministratorFormValidations,usersController.processDeleteAdministrator)
router.get('/restore-password',admMiddleware,usersController.restorePassword)
router.post('/restore-password',admMiddleware,userFormsValidations.restorePswFormValidations,usersController.processRestorePassword)

module.exports = router

