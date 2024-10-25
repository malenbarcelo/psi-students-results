const {body} = require('express-validator')
const db = require('../../database/models')
const path = require('path')
const fs = require('fs')
const coursesQueries = require('../functions/coursesQueries')

const coursesFormsValidations = {
    documentationTemplate: [
        body('selectCourse')
            .custom(async(value,{ req }) => {
                if (req.body.selectCourse == 'default') {
                throw new Error('Seleccione un curso')
                }
                return true
            }),
        body('certificateName')
            .notEmpty().withMessage('Ingrese el nombre del curso tal como irá en el certificado'),
        body('option1')
            .custom(async(value,{ req }) => {
                if (!req.body.option1) {
                    throw new Error('Debe seleccionar una opción para el logo del certificado')
                }
                return true
            }),
        body('option2')
            .custom(async(value,{ req }) => {
                if (!req.body.option2) {
                    throw new Error('Debe seleccionar una opción para el logo de la credencial')
                }
                return true
            }),
        body('option3')
            .custom(async(value,{ req }) => {
                if (!req.body.option3) {
                    throw new Error('Debe seleccionar una opción para la firma 1')
                }
                return true
            }),
        body('option4')
            .custom(async(value,{ req }) => {
                if (!req.body.option4) {
                    throw new Error('Debe seleccionar una opción para la firma 2')
                }
                return true
            }),
        body('logo1').custom((value, { req }) => {            
            let file = req.files.logo1
            let acceptedExtensions = ['.jpg','.jpeg','.png','.gif']
            if(req.body.option1 == 'other'){
                if(!file){
                    throw new Error('Debe seleccionar una imagen para el logo del certificado')
                }else{
                    let fileExtension = req.files.logo1[0].originalname
                    fileExtension = fileExtension.split('.')
                    fileExtension = fileExtension[fileExtension.length - 1]
                    if(!acceptedExtensions.includes('.' + fileExtension)){
                        throw new Error(`Las extensiones aceptadas son: ${acceptedExtensions.join(',')}`)
                    }
                }
            }
            return true}),
        body('logo2').custom((value, { req }) => {            
            let file = req.files.logo2
            let acceptedExtensions = ['.jpg','.jpeg','.png','.gif']
            if(req.body.option2 == 'other'){
                if(!file){
                    throw new Error('Debe seleccionar una imagen para el logo de la credencial')
                }else{
                    let fileExtension = req.files.logo2[0].originalname
                    fileExtension = fileExtension.split('.')
                    fileExtension = fileExtension[fileExtension.length - 1]
                    if(!acceptedExtensions.includes('.' + fileExtension)){
                        throw new Error(`Las extensiones aceptadas son: ${acceptedExtensions.join(',')}`)
                    }
                }
            }
            return true}),
        body('signature1').custom((value, { req }) => {            
            let file = req.files.signature1
            let acceptedExtensions = ['.jpg','.jpeg','.png','.gif']
            if(req.body.option3 == 'other'){
                if(!file){
                    throw new Error('Debe seleccionar una imagen para la firma 1')
                }else{
                    let fileExtension = req.files.signature1[0].originalname
                    fileExtension = fileExtension.split('.')
                    fileExtension = fileExtension[fileExtension.length - 1]
                    if(!acceptedExtensions.includes('.' + fileExtension)){
                        throw new Error(`Las extensiones aceptadas son: ${acceptedExtensions.join(',')}`)
                    }
                }
            }
            return true}),
        body('signature2').custom((value, { req }) => {            
            let file = req.files.signature2
            let acceptedExtensions = ['.jpg','.jpeg','.png','.gif']
            if(req.body.option4 == 'other'){
                if(!file){
                    throw new Error('Debe seleccionar una imagen para la firma 2')
                }else{
                    let fileExtension = req.files.signature2[0].originalname
                    fileExtension = fileExtension.split('.')
                    fileExtension = fileExtension[fileExtension.length - 1]
                    if(!acceptedExtensions.includes('.' + fileExtension)){
                        throw new Error(`Las extensiones aceptadas son: ${acceptedExtensions.join(',')}`)
                    }
                }
            }
            return true}),
    ],
    createCourse: [
        body('courseName')
            .notEmpty().withMessage('Ingrese el nombre del curso')
            .custom(async(value,{ req }) => {
                const course = await db.Courses.findOne({
                    where:{course_name:req.body.courseName},
                    attributes:['id'],
                    raw:true,
                })
                if (course) {
                throw new Error('Ya existe en la base un curso con ese nombre')
                }
                return true
            }),
        body('url')
            .notEmpty().withMessage('Ingrese el enlace del formulario'),
        body('dniEntryId')
            .notEmpty().withMessage('Ingrese el id de prellenado del DNI'),
        body('validity')
            .notEmpty().withMessage('Ingrese la validez del formulario, si el certificado no tiene vencimiento colocar 0')
            .isNumeric().withMessage('La validez debe ser un número entero (cantidad de meses)'),
        body('passGrade')
        .notEmpty().withMessage('Ingrese una nota para la aprobación del curso')
        .isNumeric().withMessage('La nota deber ser numérica (porcentaje). Utilice el punto (.) como separador de decimales')
    ],
    entryData: [
        body('dni')
            .notEmpty().withMessage('Ingrese su DNI')
            .isNumeric().withMessage('El DNI debe ser numérico, sin comas ni puntos'),
        body('image').custom((value, { req }) => {
            let file = req.file
            let acceptedExtensions = ['.jpg','.jpeg','.png','.gif']               
            if(!file){
                throw new Error('Ingrese su foto de perfil')
            }else{
                let fileExtension = path.extname(file.originalname)
                if(!acceptedExtensions.includes(fileExtension)){

                    fs.unlink(file.path, (err) => {
                        if (err) {
                          console.error('Error al eliminar el archivo:', err);
                        }
                      });

                    throw new Error(`Las extensiones aceptadas son ${acceptedExtensions.join(',')}`)
                }
            }
            return true}),
    ],
    printDocuments: [
        body('credentials')
            .custom(async(value,{ req }) => {
                const body = Object.keys(req.body)
                if (!body.includes('credentials') && !body.includes('certificates')) {
                    throw new Error('Debe seleccionar al menos un tipo de documento')
                }
                return true
            }),
        body('selectAll')
            .custom(async(value,{ req }) => {
                const body = Object.keys(req.body)
                let selectedKeys = 0
                for (let i = 0; i < body.length; i++) {
                    if (body[i] != 'credentials' && body[i] != 'certificates') {
                        selectedKeys += 1
                    }
                }
                if (selectedKeys == 0) {
                    throw new Error('Debe seleccionar al menos un alumno')
                }
                return true
            }),
        body('certificateTemplate')
            .custom(async(value,{ req }) => {
                const courseId = req.params.idCourse
                const certificateTemplate = await coursesQueries.certificateTemplate(courseId)
                const courseName = await coursesQueries.courseName(courseId)
                
                const body = Object.keys(req.body)
                if (body.includes('certificates') && !certificateTemplate) {
                    throw new Error('El curso "' + courseName + '" no posee un modelo de certificado para imprimir')
                }
                return true
            }),
        body('credentialTemplate')
            .custom(async(value,{ req }) => {
                const courseId = req.params.idCourse
                const credentialTemplate = await coursesQueries.credentialTemplate(courseId)
                const courseName = await coursesQueries.courseName(courseId)
                const body = Object.keys(req.body)
                if (body.includes('credentials') && !credentialTemplate) {
                    throw new Error('El curso "' + courseName + '" no posee un modelo de credencial para imprimir')
                }
                return true
            }),
    ],
}

module.exports = coursesFormsValidations