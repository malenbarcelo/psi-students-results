
const db = require('../../database/models')
const formsDataQueries = require('../functions/formsDataQueries')
const coursesQueries = require('../functions/coursesQueries')

async function completeFormsData() {

    //get courses
    const courses = await coursesQueries.allCourses()

    //get uncomplete forms_data
    const incompleteData = await formsDataQueries.incompleteData()

    //complete data
    incompleteData.forEach(async(element) => {

        //get course id
        const courseData = courses.filter( c => c.course_name == element.form_name)
        const idCourses = courseData.length == 0 ? null : courseData[0].id        
        
        //grade
        const grade = parseFloat(element.grade,2)
        const passGrade = idCourses == null ? null : parseFloat(courseData[0].pass_grade,2)/100
        const passed = idCourses == null ? null : (grade >= passGrade ? 1 : 0)

        //expiration date
        const validity = idCourses == null ? null : parseInt(courseData[0].validity)
        const formDate = new Date(element.date)
        const expirationDateTimestamp = idCourses == null ? null : formDate.setMonth(formDate.getMonth() + validity)
        const expirationDate = idCourses == null ? null : new Date(expirationDateTimestamp)        
        
        // update database
        await formsDataQueries.completeData(element.id, validity, expirationDate, passed, idCourses)
    
    })


    

}

module.exports = {completeFormsData}
