const express = require('express')
const apisController = require('../controllers/apisController.js')
const userMiddleware = require('../middlewares/userMiddleware.js')
const path = require('path')
const multer = require('multer')
const router = express.Router()

//Multer config
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, path.resolve('public/images/studentsPhotos'))
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now()    
      const fileExtension = path.extname(file.originalname)   
      const fileName = req.params.dni     
      cb(null, fileName + fileExtension)
    }
})

const upload = multer({storage: storage})


router.get('/students-results-passed/:company/:courseName',userMiddleware,apisController.studentsResultsPassed)
router.get('/students-results-not-passed/:company/:courseName',userMiddleware,apisController.studentsResultsNotPassed)
router.get('/student-data/:company/:dni',userMiddleware,apisController.studentData)
router.get('/find-image/:dni',apisController.findImage)
router.get('/course-data/:idCourse',apisController.courseData)
router.post('/upload-image/:dni',upload.single('image'),apisController.uploadImage)


//version 2.0
router.get('/students-results/:company/:courseName',userMiddleware,apisController.studentsResults)
router.get('/students/predict-full-names/:courseName/:string',apisController.predictNames)


module.exports = router
