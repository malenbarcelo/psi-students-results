const db = require('../../database/models')
const sequelize = require('sequelize')

const formsDataQueries = {
    allCourses: async() => {
        try{
            const courses = await db.Courses.findAll({
                order:['course_name'],
                raw:true,
            })
            return courses
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    courseId: async(courseName) => {
        try{
            const courseId = await db.Courses.findOne({
                where:{course_name:courseName},
                attributes:['id'],
                raw:true,
            })
            
            return courseId.id
            
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    courseName: async(idCourse) => {
        try{
            const courseName = await db.Courses.findOne({
                where:{id:idCourse},
                attributes:['course_name'],
                raw:true,
            })
            return courseName.course_name
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    courses: async() => {
        try{
            const courses = await db.Courses.findAll({
                order:['course_name'],
                include: [
                    {
                        association: 'forms_data',
                        order: [['date', 'DESC']]
                    },
                ],
                attributes:[['id','courseId'],['course_name','form_name'],['pass_grade','pass_grade']],
                nest:true
            })
            return courses
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    courseAndAssociations: async(idCourses) => {
        try{
            const courses = await db.Courses.findAll({
                order:['course_name'],
                include: [
                    {
                        association: 'forms_data',
                        order: [['date', 'DESC']],
                        include: [{association:'student_image'}]
                    },
                ],
                where:{
                    id:idCourses
                },
                attributes:[['id','courseId'],['course_name','form_name'],['pass_grade','pass_grade'],['includes_certificate','includes_certificate']],
                nest:true
            })
            return courses
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    coursesFiltered: async(company) => {
        try{
            const courses = await db.Courses.findAll({
                order:['course_name'],
                include: [
                    {
                        association: 'forms_data',
                        order: [['date', 'DESC']],
                        where: { company: company }
                    },
                ],
                attributes:[['id','courseId'],['course_name','form_name'],['pass_grade','pass_grade']],
                nest:true
            })
            return courses
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    courseAndAssociationsFiltered: async(company,idCourses) => {
        try{
            const courses = await db.Courses.findAll({
                order:['course_name'],
                include: [
                    {
                        association: 'forms_data',
                        order: [['date', 'DESC']],
                        include: [{association:'student_image'}],
                        where: { 
                            company: company
                         }
                    },
                ],
                where:{
                    id:idCourses
                },
                attributes:[['id','courseId'],['course_name','form_name'],['pass_grade','pass_grade'],['includes_certificate','includes_certificate']],
                nest:true
            })
            return courses
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    certificateTemplate: async(courseId) => {
        try{
            const template = await db.Documents_templates.findOne({
                where:{id_courses:courseId}
            })
            return template
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    credentialTemplate: async(courseId) => {
        try{
            const template = await db.Documents_templates.findOne({
                where:{id_courses:courseId}
            })
            return template
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    courseData: async(idCourse) => {
        try{
            const courseData = await db.Courses.findOne({
                where:{id:idCourse},
                raw:true,
            })
            return courseData
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    coursesData: async(idCourses) => {
        try{
            const courseData = await db.Courses.findAll({
                where:{id:idCourses},
                raw:true,
            })
            return courseData
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    filtrateCourse: async(courseName) => {
        try{
            const courseUrl = await db.Courses.findOne({
                where:{course_name:courseName},
                raw:true,
            })
            return courseUrl
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    courseAssociations: async(courseId) => {
        try{
            const associations = await db.Associated_forms.findAll({
                attributes:['id_associated_form'],
                where:{id_forms:courseId},
                raw:true,
            })
            return associations
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    coursesWithTemplate: async() => {
        try{
            const courses = await db.Courses.findAll({
                where:{includes_certificate:1},
                order:[['course_name','ASC']],
                raw:true,
            })
            return courses
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
}

module.exports = formsDataQueries