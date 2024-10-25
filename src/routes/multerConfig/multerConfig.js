const path = require('path')
const multer = require('multer')


//Multer config
const studentPhoto = multer.diskStorage({  
    destination: function (req, file, cb) {
      cb(null, path.resolve('public/images/studentsPhotos'))
    },
    filename: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname)   
      const fileName = req.body.dni
      cb(null, fileName + fileExtension)
    }
})

const certificateTemplate = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/images/documentsImages');
    },
    filename: function (req, file, cb) {
      const fileExtension = path.extname(file.originalname)
      const courseId = req.body.selectCourse
      var fileName = ''
      if (file.fieldname === 'logo1') {
        fileName = courseId + '_logo1'
      }
      if (file.fieldname === 'logo2') {
        fileName = courseId + '_logo2'
      }
      if (file.fieldname === 'signature1') {
        fileName = courseId + '_signature1'
      }
      if (file.fieldname === 'signature2') {
        fileName = courseId + '_signature2'
      }
      cb(null, fileName + fileExtension)
    },
  })

module.exports = [studentPhoto,certificateTemplate]