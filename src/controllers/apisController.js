const db = require('../../database/models')
const sequelize = require('sequelize')
const formsDataQueries = require('../functions/formsDataQueries')
const associatedFormsQueries = require('../dbQueries/associatedFormsQueries')
const coursesQueries = require('../functions/coursesQueries')
const profileImagesQueries = require('../dbQueries/profileImagesQueries')
const dateFunctions = require('../functions/datesFunctions')
const path = require('path')
const sharp = require('sharp')
const fs = require('fs')
const { google } = require('googleapis')

const apisController = {
  studentData: async(req,res) =>{
    try{
      const company = req.params.company
      const dni = req.params.dni

      //get student data
      const studentData = await formsDataQueries.studentData(company,dni)

      return res.status(200).json(studentData)

    }catch(error){
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
  studentsResults: async(req,res) => {
    try{

        const company = req.session.userLogged.users_companies.company_name
        const courseName = req.params.courseName
        let coursesToGet = []

        //get associated forms
        const courseId = await coursesQueries.courseId(courseName)
        const courseInfo = await coursesQueries.courseDataByName(courseName)
        const courseAssociations = await coursesQueries.courseAssociations(courseId)

        //findout if there are intermediate associated forms
        let findAssociatedCourse = []
        let otherAssociations = []
        if (courseAssociations.length == 0) {
          findAssociatedCourse = await associatedFormsQueries.findAssociatedForm(courseId)
          if (findAssociatedCourse.length > 0) {
            otherAssociations = await coursesQueries.courseAssociations(findAssociatedCourse[0].id_forms)            
          }
        }

        //complete courses to get
        coursesToGet.push(courseId)
        courseAssociations.forEach(element => {
          coursesToGet.push(element.id_associated_form)
        })
        if (findAssociatedCourse.length > 0) {
          coursesToGet.push(findAssociatedCourse[0].id_forms)
          otherAssociations.forEach(element => {
            if (!coursesToGet.includes(element.id_associated_form)) {
              coursesToGet.push(element.id_associated_form)
            }
          })          
        }

        coursesToGet = coursesToGet.sort((a, b) => b - a)
        
        //get coursesData
        let coursesData
        
        if (req.session.userLogged.id_users_categories != 4) {
            coursesData = await coursesQueries.courseAndAssociations(coursesToGet)
        }else{
            coursesData = await coursesQueries.courseAndAssociationsFiltered(company,coursesToGet)
        }

        //get plain data
        coursesData = coursesData.map(course => course.get({ plain: true }))

        //transform data
        coursesData = coursesData.map(course => ({ ...course, pass_grade: parseFloat(course.pass_grade,2)/100}))

        //add float grade to forms_data
        coursesData.forEach(course => {
            course.forms_data = course.forms_data.map(fd => ({ ...fd, grade: parseFloat(fd.grade,2)}))
        })

        //get unique students and add results array
        coursesData.forEach(course => {

            //unique students
            const filteredResults = course.forms_data.reduce((acc, current) => {
                const existingStudent = acc.find(student => student.dni === current.dni)
                
                if (!existingStudent || existingStudent.id < current.id) {
                  if (existingStudent) {
                    acc = acc.filter(student => student.dni !== current.dni)
                  }
                  acc.push(current)
                }
              
                return acc
              }, [])

              course.students_results = filteredResults
        })

        //add course type
        coursesData.forEach(element => {
          if (element.form_name == courseName) {
            element.type = 'course'
          }else{
            element.type = 'association'
          }
        })

        //add aditional data    
        coursesData.forEach(cd => {
          
          const passGrade = cd.pass_grade
          const includesCertificate = cd.includes_certificate
          cd.students_results = cd.students_results.map(sr => ({
            ...sr,
            passGrade:passGrade,
            passed: sr.grade >= passGrade ? 1 : 0,
            includesCertificate: includesCertificate
          }))
        })

        //split data
        let studentsResults = coursesData.filter(c => c.type == 'course')[0].students_results
        let associationsStudentsResults = coursesData.filter(c => c.type != 'course')

        //add associations data
        const coursesToGetData = await coursesQueries.coursesData(coursesToGet)
        studentsResults.forEach(sr => {
          const dni = sr.dni
          const date = new Date()
          const dateArg = new Date(date.getTime() + (-3 * 60 * 60 * 1000))
          sr.validity = courseInfo.validity
          sr.today = dateArg
          sr.associatedResults = []
          sr.associatedCourses = coursesToGetData.filter( c => c.id != courseId)
          associationsStudentsResults.forEach(asr => {
            const filteredResults = asr.students_results.filter(student => student.dni == dni)
            sr.associatedResults.push(filteredResults.length == 0 ? {data: 'noInfo'} : filteredResults[0])
          })

          let notPassedAssociations = 0
          sr.associatedResults.forEach(ar => {
            if (ar.data == 'noInfo' || ar.passed == 0) {
              notPassedAssociations += 1
            }
          })

          sr.notPassedAssociations = notPassedAssociations
          sr.printCertificate = (sr.includesCertificate == 0 || sr.passed == 0 || notPassedAssociations > 0) ? 0 : 1
          const expirationDate = new Date(sr.date)
          expirationDate.setMonth(expirationDate.getMonth() + courseInfo.validity)
          
          const daysToExpiration = (expirationDate - dateArg) / (1000 * 60 * 60 * 24)
          sr.expirationDate = sr.validity == 0 ? '-' : expirationDate
          sr.daysToExpiration =  sr.validity == 0 ? '-' : parseInt(daysToExpiration)
          

        })
        return res.status(200).json(studentsResults)

    }catch(error){
        console.log(error)
        return res.send('Ha ocurrido un error')
    }
  },
  studentsResults2: async(req,res) =>{
    try{
      const course = req.params.courseName
      const company = req.params.company

      //get course students
      let studentsData = []
      if (req.session.userLogged.id_users_categories == 1) {
        studentsData = await formsDataQueries.studentsData(course)
      }else{
        studentsData = await formsDataQueries.studentsDataFiltered(company,course)
      }

      //add date as string
      const newDataArray = await Promise.all(studentsData.map(async (element) => {
        const dateString = await dateFunctions.dateToString(element.date);
        return {
          ...element.dataValues,
          dateString: dateString, 
        };
      }));

      //get course associations
      const courseId = await coursesQueries.courseId(course)
      const courseAssociations = await coursesQueries.courseAssociations(courseId)

      //get course data
      const courseData = await coursesQueries.courseData(courseId)
      

      //get course associations names
      for (let i = 0; i < courseAssociations.length; i++) {
        const courseName = await coursesQueries.courseName(courseAssociations[i].id_associated_form)
        courseAssociations[i].courseName = courseName
      }

      //add students data to associated forms data
      const today = new Date()
      today.setDate(today.getDate() - 180)
      
      for (let i = 0; i <courseAssociations.length; i++) {
        const courseName2 = courseAssociations[i].courseName
        var dataToAssociate = []
        if (req.session.userLogged.id_users_categories == 1) {
          dataToAssociate = await formsDataQueries.studentsData(courseName2)
        }else{
          dataToAssociate = await formsDataQueries.studentsDataFiltered(company,courseName2)
        }
        //filter las 6 months
        const dataToAssociateFiltered = dataToAssociate.filter(data => data.date >= today)
        courseAssociations[i].data = dataToAssociateFiltered
      }

      //add associated forms and pass grade to data
      for (let i = 0; i < newDataArray.length; i++) {
        var dni = newDataArray[i].dni
        newDataArray[i].pass_grade = courseData.pass_grade
        newDataArray[i].associatedForms = []
        for (let j = 0; j < courseAssociations.length; j++) {
          const formName = courseAssociations[j].courseName
          const formData = courseAssociations[j].data
          var studentData = formData.filter(student => student.dni === dni)
          var grade = studentData.length == 0 ? 'NA' : studentData[0].grade
          newDataArray[i].associatedForms.push({'formName':formName,'grade':grade })        
        }
      }      

      return res.status(200).json(newDataArray)

    }catch(error){
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
  studentsResultsNotPassed: async(req,res) =>{
    try{

      const course = req.params.courseName
      const company = req.params.company

      const courseId = await coursesQueries.courseId(course)
      const courseData = await coursesQueries.courseData(courseId)

      //get course students
      let studentsData = []
      if (req.session.userLogged.id_users_categories == 1) {
        studentsData = await formsDataQueries.studentsData(course)
      }else{
        studentsData = await formsDataQueries.studentsDataFiltered(company,course)
      }

      const studentsDataNotPassed = studentsData.filter(data => parseFloat(data.grade) < parseFloat(courseData.pass_grade)/100)

      //add date as string
      const newDataArray = await Promise.all(studentsDataNotPassed.map(async (element) => {
        const dateString = await dateFunctions.dateToString(element.date);
        return {
          ...element.dataValues,
          dateString: dateString, 
        };
      }));

      //get course associations
      const courseAssociations = await coursesQueries.courseAssociations(courseId)

      //get course associations names
      for (let i = 0; i < courseAssociations.length; i++) {
        const courseName = await coursesQueries.courseName(courseAssociations[i].id_associated_form)
        courseAssociations[i].courseName = courseName
      }

      //add students data to associated forms data
      const today = new Date()
      today.setDate(today.getDate() - 180)
      
      for (let i = 0; i <courseAssociations.length; i++) {
        const courseName2 = courseAssociations[i].courseName
        var dataToAssociate = []
        if (req.session.userLogged.id_users_categories == 1) {
          dataToAssociate = await formsDataQueries.studentsData(courseName2)
        }else{
          dataToAssociate = await formsDataQueries.studentsDataFiltered(company,courseName2)
        }
        //filter las 6 months
        const dataToAssociateFiltered = dataToAssociate.filter(data => data.date >= today)
        courseAssociations[i].data = dataToAssociateFiltered
      }

      //add associated forms to data
      for (let i = 0; i < newDataArray.length; i++) {
        var dni = newDataArray[i].dni
        newDataArray[i].pass_grade = courseData.pass_grade
        newDataArray[i].associatedForms = []
        for (let j = 0; j < courseAssociations.length; j++) {
          const formName = courseAssociations[j].courseName
          const formData = courseAssociations[j].data
          var studentData = formData.filter(student => student.dni === dni)
          var grade = studentData.length == 0 ? 'NA' : studentData[0].grade
          newDataArray[i].associatedForms.push({'formName':formName,'grade':grade })
        }
      }
      
      return res.status(200).json(newDataArray)
    }catch(error){
      return res.send('Ha ocurrido un error')
    }
  },
  studentsResultsPassed: async(req,res) =>{
    try{
      const course = req.params.courseName
      const company = req.params.company

      const courseId = await coursesQueries.courseId(course)
      const courseData = await coursesQueries.courseData(courseId)
            
      //get course students
      let studentsData = []
      if (req.session.userLogged.id_users_categories == 1) {
        studentsData = await formsDataQueries.studentsData(course)
      }else{
        studentsData = await formsDataQueries.studentsDataFiltered(company,course)
      }

      const studentsDataPassed = studentsData.filter(data => parseFloat(data.grade) >= parseFloat(courseData.pass_grade)/100)

      //add date as string
      const newDataArray = await Promise.all(studentsDataPassed.map(async (element) => {
        const dateString = await dateFunctions.dateToString(element.date);
        return {
          ...element.dataValues,
          dateString: dateString, 
        };
      }));

      //get course associations
      const courseAssociations = await coursesQueries.courseAssociations(courseId)

      //get course associations names
      for (let i = 0; i < courseAssociations.length; i++) {
        const courseName = await coursesQueries.courseName(courseAssociations[i].id_associated_form)
        courseAssociations[i].courseName = courseName
      }

      //add students data to associated forms data
      const today = new Date()
      today.setDate(today.getDate() - 180)
      
      for (let i = 0; i < courseAssociations.length; i++) {
        const courseName2 = courseAssociations[i].courseName
        var dataToAssociate = []
        if (req.session.userLogged.id_users_categories == 1) {
          dataToAssociate = await formsDataQueries.studentsData(courseName2)
        }else{
          dataToAssociate = await formsDataQueries.studentsDataFiltered(company,courseName2)
        }
        //filter las 6 months
        const dataToAssociateFiltered = dataToAssociate.filter(data => data.date >= today)
        courseAssociations[i].data = dataToAssociateFiltered
      }

      //add associated forms to data and pass grade
      for (let i = 0; i < newDataArray.length; i++) {
        var dni = newDataArray[i].dni
        newDataArray[i].pass_grade = courseData.pass_grade
        newDataArray[i].associatedForms = []
        for (let j = 0; j < courseAssociations.length; j++) {
          const formName = courseAssociations[j].courseName
          const formData = courseAssociations[j].data
          var studentData = formData.filter(student => student.dni === dni)
          var grade = studentData.length == 0 ? 'NA' : studentData[0].grade
          newDataArray[i].associatedForms.push({'formName':formName,'grade':grade })
        }
      }
      
      return res.status(200).json(newDataArray)
    }catch(error){
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
  findImage: async(req,res) =>{
    try{

      const dni = req.params.dni
      const findImage = await profileImagesQueries.findImage(dni)
      
      
      return res.status(200).json(findImage)
    }catch(error){
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
  courseData: async(req,res) =>{
    try{

      const idCourse = req.params.idCourse
      const courseData = await coursesQueries.courseData(idCourse)
      
      
      return res.status(200).json(courseData)
    }catch(error){
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
  uploadImage: async(req,res) => {
    try{
        
        const fileName = req.file.filename
        const dni = req.body.dni
        
        //get an image of lower quality
        const imageSize = req.file.size / 1024 //image size in kb
        //const percentage = Math.round(300 * 100 / imageSize)
        const percentage = Math.min(100, Math.max(1, Math.round(300 * 100 / imageSize))) // to get an image of 300kb

        const filePath = req.file.path

        const modifiedImageBuffer = await sharp(filePath)
            .jpeg({ quality: percentage }) // get a lower quality for the image
            .resize(500)
            .withMetadata()
            .toBuffer()

        const dirLQ = path.join('public', 'images', 'studentsPhotosLQ') //LQ=Low Quality
        const fileNameLQ = req.file.filename
        const filePathLQ = path.join(dirLQ, fileNameLQ)
        
        fs.writeFileSync(filePathLQ, modifiedImageBuffer)

        //save data
        await profileImagesQueries.create(dni,fileName)
        
        return res.status(200).json()

    }catch(error){
        console.log(error)
        return res.send('Ha ocurrido un error')
    }
  },
  predictNames: async(req,res) =>{
    try{

      const string = req.params.string.toLowerCase()
      const courseName = req.params.courseName
      const courseId = await coursesQueries.courseId(courseName)
      const company = req.session.userLogged.users_companies.company_name
      const associatedCourses = await associatedFormsQueries.courseAssociatedForms(courseId)
      
      const courses = [courseName]
      associatedCourses.forEach(ac => {
        courses.push(ac.course_data.course_name)
      })
      
      const list = await formsDataQueries.fullNames(courses,company)
      
      // const list = fullNames.map(element => ({ //delete spaces at the end
      //   ...element,
      //   full_name: element.full_name.trimEnd() 
      // }))
      
      const predictedList = list.filter(l => l.full_name.toLowerCase().includes(string))
      const uniqueList = [...new Set(predictedList)]
      res.status(200).json(uniqueList)

    }catch(error){
      console.group(error)
      return res.send('Ha ocurrido un error')
    }
  },
}
module.exports = apisController

