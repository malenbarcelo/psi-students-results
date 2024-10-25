const express = require('express')
const path = require('path')
const coursesController = require('../controllers/coursesController.js')
const router = express.Router()
const coursesFormsValidations = require('../validations/coursesFormsValidations.js')
const multer = require('multer')
const multerConfig = require('./multerConfig/multerConfig.js')
const admMiddleware = require('../middlewares/admMiddleware.js')
const userMiddleware = require('../middlewares/userMiddleware.js')

const uploadStugentPhoto = multer({storage: multerConfig[0]})
const uploadCertTemplate = multer({storage: multerConfig[1]})

router.get('/my-courses/:company',userMiddleware,coursesController.myCourses)
router.get('/students-results/:company/:idCourse',userMiddleware,coursesController.studentsResults)
router.post('/students-results/:company/:idCourse',userMiddleware,coursesFormsValidations.printDocuments,coursesController.printSelected)
router.get('/view-courses',admMiddleware,coursesController.viewCourses)
router.get('/create-course',admMiddleware,coursesController.createCourse)
router.post('/create-course',admMiddleware,coursesFormsValidations.createCourse,coursesController.processCreateCourse)
router.get('/start-course',coursesController.startCourse)
router.get('/start-course/:idCourse',coursesController.entryData)

router.get('/view-students/:company',userMiddleware,coursesController.viewStudents)
router.get('/:typeOfDocument/:idFormData',coursesController.viewDocument)
router.get('/create-template',admMiddleware,coursesController.createTemplate)
router.post('/create-template',admMiddleware,uploadCertTemplate.fields([{ name: 'logo1', maxCount: 1 }, { name: 'logo2', maxCount: 1 },{ name: 'signature1', maxCount: 1 },{ name: 'signature2', maxCount: 1}]),coursesFormsValidations.documentationTemplate,coursesController.createTemplateProcess)
router.get('/import-data',admMiddleware,coursesController.importAllData)

//APIS
//router.post('/start-course/:idCourse',uploadStugentPhoto.single('image'),coursesController.openForm)

module.exports = router

