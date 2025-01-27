const db = require('../../database/models')
const path = require('path')
const {validationResult} = require('express-validator')
const formsDataQueries = require('../functions/formsDataQueries')
const coursesQueries = require('../functions/coursesQueries')
const docTemplatesQueries = require('../functions/docTemplatesQueries')
const datesFunctions = require('../functions/datesFunctions')
const profileImagesQueries = require('../functions/profileImagesQueries')
const puppeteer = require('puppeteer')
const archiver = require('archiver')
const fetch = require('cross-fetch')
const dominio = require('../functions/dominio')
const ejs = require('ejs')
const fs = require('fs')
const { send } = require('process')
const sharp = require('sharp')
const readGoogleSheets = require('../functions/readGoogleSheets')
const {addFormsData} = require('../functions/addFormsData')
const {completeFormsData} = require('../functions/completeFormsData')
const {createStudents} = require('../functions/createStudents')

const coursesController = {
    createCourse: async(req,res) => {
        try{
            const forms = await coursesQueries.allCourses()
            return res.render('courses/createCourse',{title:'Crear curso',forms})
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    createTemplate: async(req,res) => {
        try{
            const courses = await coursesQueries.coursesWithTemplate()
            const certificateLogos = await docTemplatesQueries.certificateLogos()
            const credentialLogos = await docTemplatesQueries.credentialLogos()
            const signatures1 = await docTemplatesQueries.signatures1()
            const signatures2 = await docTemplatesQueries.signatures2()

            return res.render('courses/documentationTemplate',{title:'Template',courses,certificateLogos,credentialLogos,signatures1,signatures2})

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    createTemplateProcess: async(req,res) => {
        try{
            const courses = await coursesQueries.coursesWithTemplate()
            const certificateLogos = await docTemplatesQueries.certificateLogos()
            const credentialLogos = await docTemplatesQueries.credentialLogos()
            const signatures1 = await docTemplatesQueries.signatures1()
            const signatures2 = await docTemplatesQueries.signatures2()

            const resultValidation = validationResult(req)

            if (resultValidation.errors.length > 0){                
                return res.render('courses/documentationTemplate',{
                    courses,
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    certificateLogos,
                    credentialLogos,
                    signatures1,
                    signatures2,
                    title:'Template'
                })
            }

            const courseId = req.body.selectCourse
            const certificateName = req.body.certificateName
            const certificateNormatives = req.body.certificateNormatives
            const credentialForehead = req.body.credentialForehead
            const credentialBack = req.body.credentialBack
            const credentialNormatives = req.body.credentialNormatives

            //logo1
            var option1 = ''
            if (req.body.option1 == 'other') {
                option1 = req.files.logo1[0].filename
            }else{
                if (req.body.option1 == 'none') {
                    option1 = ''
                }else{
                    option1 = req.body.option1
                }
            }

            //logo2
            var option2 = ''
            if (req.body.option2 == 'other') {
                option2 = req.files.logo2[0].filename
            }else{
                if (req.body.option2 == 'none') {
                    option2 = ''
                }else{
                    option2 = req.body.option2
                }
            }

            //Signature1 -- doesn't admit nulls
            var option3 = ''
            if (req.body.option3 == 'other') {
                option3 = req.files.signature1[0].filename
            }else{
                option3 = req.body.option3
            }

            //signature2
            var option4 = ''
            if (req.body.option4 == 'other') {
                option4 = req.files.signature2[0].filename
            }else{
                if (req.body.option4 == 'none') {
                    option4 = ''
                }else{
                    option4 = req.body.option4
                }
            }

            //create certificate
            await db.Documents_templates.create({
                id_courses: courseId,
                certificate_logo: option1,
                credential_logo: option2,
                signature1_image: option3,
                signature2_image: option4,
                course_name:certificateName,
                credential_forehead:credentialForehead,
                credential_back:credentialBack,
                certificate_normatives:certificateNormatives,
                credential_normatives:credentialNormatives,
                enabled:1
            })

            const successMessage = true

            return res.render('courses/documentationTemplate',{title:'Template',courses,certificateLogos,credentialLogos,signatures1,signatures2,successMessage})

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    entryData: async(req,res) => {
        try{
            const idCourse = req.params.idCourse
            const course = await coursesQueries.courseName(idCourse) 
            return res.render('courses/entryData',{title:'Iniciar cuestionario',course,idCourse})
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    myCourses: async(req,res) => {
        try{

            const company = req.session.userLogged.users_companies.company_name
            
            //get coursesData
            let coursesData
            
            if (req.session.userLogged.id_users_categories != 4) {
                coursesData = await coursesQueries.courses()
            }else{
                coursesData = await coursesQueries.coursesFiltered(company)
            }

            //get plain data
            coursesData = coursesData.map(course => course.get({ plain: true }))

            //transform data
            coursesData = coursesData.map(course => ({ ...course, pass_grade: parseFloat(course.pass_grade,2)/100}))

            //get unique companies
            coursesData = coursesData.map(course => {
                const uniqueCompanies = [...new Set(course.forms_data.map(fd => fd.company))]
              
                return {
                  ...course,
                  companiesQty: uniqueCompanies.length
                }
              })

            coursesData.forEach(course => {
                course.forms_data = course.forms_data.map(fd => ({ ...fd, grade: parseFloat(fd.grade,2)}))
            })

            //get unique students
            coursesData.forEach(course => {

                //unique students
                const filteredResults = course.forms_data.reduce((acc, current) => {
                    const existingStudent = acc.find(student => student.dni === current.dni)
                    
                    if (!existingStudent || new Date(existingStudent.date) < new Date(current.date)) {
                      if (existingStudent) {
                        acc = acc.filter(student => student.dni !== current.dni)
                      }
                      acc.push(current)
                    }
                  
                    return acc
                  }, [])

                  course.students_results = filteredResults
            })
            //add aditional data
            coursesData.forEach(course => {

                const studentsQty = course.students_results.length
                const passed = course.students_results.filter(s => s.grade >= course.pass_grade).length
                const passedPercentege = studentsQty == 0 ? 0 : Number((passed / studentsQty * 100).toFixed(2))                
                
                course.studentsQty = studentsQty
                course.passed = passed
                course.passedPercentage = passedPercentege
                course.notPassed = studentsQty - passed
                course.notPassedPercentage = Number((100 - passedPercentege).toFixed(2))
                
            })

            coursesData = coursesData.filter( c => c.includes_certificate == 1)
            
            return res.render('courses/myCourses',{title:'Mis cursos',coursesData})

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    openForm: async(req,res) => {
        try{

            const courseData = await coursesQueries.courseData(req.body.idCourse)
            const courseUrl = courseData.url + '?usp=pp_url&entry.' + courseData.dni_entry_id + '=' + req.body.dni

            console.log(courseUrl)

            // const image = await db.Profile_images.findOne({
            //     where:{
            //         dni:req.body.dni
            //     },
            //     raw:true
            // })

            // if (!image) {
            //     await db.Profile_images.create({
            //         dni: req.body.dni,
            //         image: req.file.filename
            //     })
            // }else{
            //     await db.Profile_images.update(
            //         {
            //           dni: req.body.dni,
            //           image: req.file.filename
            //         },
            //         {
            //           where: { id: image.id }
            //         }
            //       )
            // }

            // const inputFolderPath = path.join('public', 'images', 'studentsPhotos')
            // const outputFolderPath = path.join('public', 'images', 'studentsPhotosLQ')

            // /*const files = await fs.promises.readdir(inputFolderPath)

            // for (const file of files) {
            //     const inputFile = `${inputFolderPath}/${file}`;
            //     const outputFile = `${outputFolderPath}/${file}`;
          
            //     await sharp(inputFile)
            //       .resize({ width: 800 }) // Ajusta el tamaño según tus necesidades
            //       .toFile(outputFile);
            //   }*/

            // //get an image of lower quality
            // const imageSize = req.file.size / 1024 //image size in kb
            // const percentage = Math.round(300 * 100 / imageSize) // to get an image of 300kb

            // const filePath = req.file.path

            // const modifiedImageBuffer = await sharp(filePath)
            //     .jpeg({ quality: percentage }) // get a lower quality for the image
            //     .resize(500)
            //     .withMetadata()
            //     .toBuffer()

            // const dirLQ = path.join('public', 'images', 'studentsPhotosLQ') //LQ=Low Quality
            // const fileNameLQ = req.file.filename
            // const filePathLQ = path.join(dirLQ, fileNameLQ)
            
            // fs.writeFileSync(filePathLQ, modifiedImageBuffer)

            // //delete high quality file
            // /*fs.unlink(req.file.path, (err) => {
            //     if (err) {
            //       console.error('Error al eliminar el archivo:', err);
            //     } else {
            //       console.log('Archivo eliminado exitosamente')
            //     }
            //   })

            // //rename low quality file
            // const oldName = fileNameLQ;
            // const newName = req.file.filename;

            // const oldPath = path.join(dirLQ, oldName)
            // const newPath = path.join(dirLQ, newName)

            // fs.rename(oldPath, newPath, (err) => {
            //     if (err) {
            //         console.log('Error al renombrar el archivo.');
            //     } else {
            //         console.log('Archivo renombrado exitosamente.');
            //     }
            // })*/
            
            return res.send("<script>window.location.href = '" + courseUrl + "';</script>")
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    printSelected: async(req,res) =>{
        try{

            //get course and company
            const idCourse = req.params.idCourse
            const course = await coursesQueries.courseName(idCourse)
            const company = req.params.company
            const courseData = await coursesQueries.filtrateCourse(course)
            const companies = await formsDataQueries.companies()

            const body = Object.keys(req.body)
            
            //get idFormsData to print and documents to print
            var idsFormsData = []
            var documents = []
            
            for (let i = 0; i < body.length; i++) {
                if (body[i] == "certificates" || body[i] == "credentials") {
                    documents.push(body[i])
                }else{
                    if (body[i] != "selectAll") {
                        idsFormsData.push(body[i])
                    }
                }
            }

            //get dataToPrint to print
            let dataToPrint = await formsDataQueries.dataToPrint(idsFormsData)

            //create .zip
            const archive = archiver('zip')
            res.attachment(course + '.zip')
            archive.pipe(res)

            const browser = await puppeteer.launch({
                headless: "new", // to avoid open windows
                printBackground: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // to avoid errors
            });

            //print credentials if necessary
            if (documents.includes('credentials')) {
                for (const data of dataToPrint) {

                    const studentData = data.student_data.filter( sd => sd.company == data.company)[0]

                    const dni = data.dni;
                    const name = studentData.last_name + ' ' + studentData.first_name;
                    const fileName = data.company + '_Cred_ ' + name + '_' + dni;
            
                    const url = dominio + "courses/credentials/" + data.id;
            
                    const page = await browser.newPage()
            
                    await page.goto(url, { waitUntil: 'networkidle0' })
                    await page.emulateMediaFeatures([{ name: 'color-gamut', value: 'srgb' }])
            
                    const pdf = await page.pdf({ printBackground: true })
            
                    await page.close();
            
                    // Agregar el archivo PDF al archivo zip
                    archive.append(Buffer.from(pdf), { name: fileName + '.pdf' })
                    //archive.append(pdf, { name: fileName + '.pdf' });
                }
            }

            //print certificates if necessary
            if (documents.includes('certificates')) {
                for (const data of dataToPrint) {

                    const studentData = data.student_data.filter( sd => sd.company == data.company)[0]

                    const dni = data.dni;
                    const name = studentData.last_name + ' ' + studentData.first_name;
                    const fileName = data.company + '_Cert_ ' + name + '_' + dni;
            
                    const url = dominio + "courses/certificates/" + data.id;
            
                    const page = await browser.newPage()
            
                    await page.goto(url, { waitUntil: 'networkidle0' })
                    await page.emulateMediaFeatures([{ name: 'color-gamut', value: 'srgb' }])
            
                    const pdf = await page.pdf({ printBackground: true, landscape: true })
            
                    await page.close();
            
                    // Agregar el archivo PDF al archivo zip
                    archive.append(Buffer.from(pdf), { name: fileName + '.pdf' })
                    //archive.append(pdf, { name: fileName + '.pdf' });
                }
            }
            
            await browser.close()
            await archive.finalize()

        }catch(error){
            console.log(error)
            return res.send(error)
        }
    },
    printSelectedOld: async(req,res) =>{
        try{
            //get course and company
            const idCourse = req.params.idCourse
            const course = await coursesQueries.courseName(idCourse)
            const company = req.params.company
            const courseData = await coursesQueries.filtrateCourse(course)
            const companies = await formsDataQueries.companies()  

            const resultValidation = validationResult(req)

            //get course students
            let studentsData = []
            if (req.session.userLogged.id_users_categories == 1) {
                studentsData = await formsDataQueries.studentsData(course)
            }else{
                studentsData = await formsDataQueries.studentsDataFiltered(company,course)
            }            
                
            let datesStrings = []

            for (let i = 0; i < studentsData.length; i++) {
                let dateString = await datesFunctions.dateToString(studentsData[i].date)
                datesStrings.push({"dateString":dateString})
            }

            if (resultValidation.errors.length > 0){

                return res.render('courses/studentsResults',{title:'Resultados',course,idCourse,studentsData,datesStrings,errors:resultValidation.mapped(),
                oldData: req.body,courseData,companies})
            }

            const body = Object.keys(req.body)

            //get idFormsData to print and documents to print
            var idsFormsData = []
            var documents = []
            
            for (let i = 0; i < body.length; i++) {
                if (body[i] == "certificates" || body[i] == "credentials") {
                    documents.push(body[i])
                }else{
                    if (body[i] != "selectAll") {
                        idsFormsData.push(body[i])
                    }
                }
            }

            //get dataToPrint to print
            const dataToPrint = await formsDataQueries.dataToPrint(idsFormsData)

            //create .zip
            const archive = archiver('zip')
            res.attachment(course + '.zip')
            archive.pipe(res)

            const browser = await puppeteer.launch({
                headless: "new", // to avoid open windows
                printBackground: true,
                args: ['--no-sandbox', '--disable-setuid-sandbox'] // to avoid errors
            });

            //print credentials if necessary
            if (documents.includes('credentials')) {
                for (const data of dataToPrint) {
                    const dni = data.dni;
                    const name = data.last_name + ' ' + data.first_name;
                    const fileName = data.company + '_Cred_ ' + name + '_' + dni;
            
                    const url = dominio + "courses/credentials/" + data.id;
            
                    const page = await browser.newPage()
            
                    await page.goto(url, { waitUntil: 'networkidle0' })
                    await page.emulateMediaFeatures([{ name: 'color-gamut', value: 'srgb' }])
            
                    const pdf = await page.pdf({ printBackground: true })
            
                    await page.close();
            
                    // Agregar el archivo PDF al archivo zip
                    archive.append(pdf, { name: fileName + '.pdf' });
                }
            }

            //print certificates if necessary
            if (documents.includes('certificates')) {
                for (const data of dataToPrint) {
                    const dni = data.dni;
                    const name = data.last_name + ' ' + data.first_name;
                    const fileName = data.company + '_Cert_ ' + name + '_' + dni;
            
                    const url = dominio + "courses/certificates/" + data.id;
            
                    const page = await browser.newPage()
            
                    await page.goto(url, { waitUntil: 'networkidle0' })
                    await page.emulateMediaFeatures([{ name: 'color-gamut', value: 'srgb' }])
            
                    const pdf = await page.pdf({ printBackground: true, landscape: true })
            
                    await page.close();
            
                    // Agregar el archivo PDF al archivo zip
                    archive.append(pdf, { name: fileName + '.pdf' });
                }
            }
            
            await browser.close()
            archive.finalize()

        }catch(error){
            console.log(error)
            return res.send(error)
        }
    },
    processCreateCourse: async(req,res) => {
        try{

            const forms = await coursesQueries.allCourses()

            const resultValidation = validationResult(req)

            if (resultValidation.errors.length > 0){
                
                return res.render('courses/createCourse',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Crear curso',
                    forms
                })
            }

            //get associated forms quantity
            const associatedForms = req.body.selectAssociatedForms
            const associatedFormsQty = associatedForms.reduce((count, element) => {
                if (element !== "default") {
                  return count + 1
                }
                return count
              }, 0)

            //create course
            await db.Courses.create({
                course_name: req.body.courseName,
                url: req.body.url,
                dni_entry_id: req.body.dniEntryId,
                validity: req.body.validity,
                includes_certificate: req.body.includesCertificate ? 1 : 0,
                associated_forms: associatedFormsQty == 0 ? 0 : 1,
                pass_grade:req.body.passGrade,
                enabled:1,
            })

            //create associatons if corresponds
            if (associatedFormsQty != 0) {
                //get created course id
                const courseId = await coursesQueries.courseId(req.body.courseName)
                if (req.body.includesCertificate) {
                    //create associations
                    for (let i = 0; i < associatedForms.length; i++) {
                        if (associatedForms[i] != 'default') {
                            await db.Associated_forms.create({
                                id_forms: courseId,
                                id_associated_form: associatedForms[i]
                            })
                            //get associated course
                            const associatedCourseData = await coursesQueries.courseData(associatedForms[i])
                            //update course
                            await db.Courses.update(
                                {
                                    includes_certificate: 0,
                                    associated_forms:0
                                },
                                {where:{id:associatedForms[i]}}
                            )
                            //delete associations
                            await db.Associated_forms.destroy(
                                {where:{id_forms:associatedForms[i]}}
                            )
                        }   
                    }
                }else{
                    //create associations
                    for (let i = 0; i < associatedForms.length; i++) {
                        if (associatedForms[i] != 'default') {
                            await db.Associated_forms.create({
                                id_forms:associatedForms[i],
                                id_associated_form: courseId
                            })
                        }   
                    }
                }
            }

            const successMessage = true

            return res.render('courses/createCourse',{title:'Crear curso', forms,successMessage,})
            
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    startCourse: async(req,res) => {
        try{
            const refLink = 'startCourse'
            const courses = await coursesQueries.allCourses()
            return res.render('courses/viewCourses',{title:'Iniciar curso',courses,refLink})
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    studentsResults: async(req,res) => {
        try{
            const idCourse = req.params.idCourse
            const company = req.params.company
            const course = await coursesQueries.courseName(idCourse)
            const courseData = await coursesQueries.filtrateCourse(course)
            const companies = await formsDataQueries.companies()

            //get course students
            let studentsData = []
           if (req.session.userLogged.id_users_categories == 1) {
            studentsData = await formsDataQueries.studentsData(course)
           }else{
            studentsData = await formsDataQueries.studentsDataFiltered(company,course)
           }
            
            let datesStrings = []

            // for (let i = 0; i < studentsData.length; i++) {
            //     let dateString = await datesFunctions.dateToString(studentsData[i].date)
            //     datesStrings.push({"dateString":dateString})
            // }

            return res.render('courses/studentsResults',{title:'Resultados',course,idCourse,studentsData,courseData,companies})

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    viewDocument: async(req,res) => {
        try{
            const idFormData = req.params.idFormData
            const typeOfDocument = req.params.typeOfDocument

            //get documents data
            const documentData = await formsDataQueries.studentDataFiltered(idFormData)
            
            //get course name
            const courseName = documentData.form_name

            //get course
            const courseData = await coursesQueries.filtrateCourse(courseName)

            //get course id
            const courseId = courseData.id

            //get certificate template
            const documentTemplate = await db.Documents_templates.findOne({
                where:{id_courses:courseId},
                raw:true
            })
            
            //get validity
            const validity =  courseData.validity

            //get expiration date
            const issueDate = documentData.date
            const issueDateArray = issueDate.split('-')

            const issueDateString = issueDateArray[2] + '/' + issueDateArray[1] + '/' + issueDateArray[0]
            
            //const issueDateString = await datesFunctions.dateToString(issueDate)
            var expirationDateString = '00/00/0000'

           if (validity != 0) {

                const expirationDateArray = documentData.expiration_date.split('-')
                expirationDateString = String(expirationDateArray[2] + '/' + expirationDateArray[1] + '/' + expirationDateArray[0])
                
                // const expirationDate = new Date(issueDate)
                // expirationDate.setMonth(expirationDate.getMonth() + validity)
                // expirationDateString = await datesFunctions.dateToString(expirationDate);
            }
            
            //get student image            
            const studentImage = await profileImagesQueries.imageName(documentData.dni)
            
            //get certificate code
            const courseCode = documentData.course_code
            const date2 = issueDateString.split('/')[0] + issueDateString.split('/')[1] + issueDateString.split('/')[2]
            const studentCode = documentData.student_code
            const documentCode = courseCode + '-' + date2 + '-' + studentCode

            //get month name
            const months = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Nomviembre','Diciembre']
            const month = parseInt(issueDateArray[1])
            const issueMonth = months[month-1]
            const issueDay = parseInt(issueDateArray[2])
            const issueYear = parseInt(issueDateArray[0])

            const studentData = documentData.student_data.filter( sd => sd.company == documentData.company)[0]
            
            if (typeOfDocument == 'certificates') {
                return res.render('courses/certificates',{title:'Certificado',documentCode,documentTemplate,documentData,issueMonth,issueDateString,expirationDateString,studentImage,issueDay,issueYear,studentData})
            }else{
                return res.render('courses/credentials',{title:'Credencial',documentCode,documentTemplate,documentData,issueDateString,expirationDateString,studentImage,studentData})
            }
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },    
    viewCourses: async(req,res) => {
        try{

            const courses = await coursesQueries.allCourses()
            const refLink = 'viewForms'

            for (let i = 0; i < courses.length; i++) {
                const associatedForms = await coursesQueries.courseAssociations(courses[i].id)
                courses[i].associatedForms=associatedForms
            }

            return res.render('courses/viewCourses',{title:'Listado de cursos',courses,refLink})

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    viewStudents: async(req,res) => {
        try{

            const company = req.session.userLogged.users_companies.company_name
            const studentsData = await formsDataQueries.companyStudents(company)

            let selectList = []

            studentsData.forEach(student => {
                selectList.push({"name":student.last_name + ', ' + student.first_name,"dni":student.dni})
            });

            //remove dulpicates
            function areObjectsEqual(obj1, obj2) {
                return obj1.name === obj2.name && obj1.dni === obj2.dni;
              }
              
              const uniqueSelectList = selectList.filter((item, index, self) => {
                return self.findIndex((obj) => areObjectsEqual(obj, item)) === index;
              });

            return res.render('courses/viewStudents',{title:'Mis alumnos',uniqueSelectList})

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    importAllData: async(req,res) => {
        try{
            //ADD GOOGLE SHEETS DATA
            const students = await addFormsData('allData')

            //COMPLETE FORMS DATA
            await completeFormsData()

            //create students
            await createStudents(students)

            return res.redirect('/courses/my-courses/' + req.session.userLogged.users_companies.company_name)

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
}


module.exports = coursesController

