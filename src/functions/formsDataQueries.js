const db = require('../../database/models')
const datesFunctions = require('../functions/datesFunctions')
const sequelize = require('sequelize')
const { Op, literal, fn, col} = require('sequelize')

const formsDataQueries = {
    courseData: async(courseId) => {
        try{
            const allData = await db.Forms_data.findAll({
                include: [{
                    association: 'forms_data_courses',
                    where: {
                        id: courseId
                    },
                }],
                where: {
                    date: {
                        [Op.in]: sequelize.literal(`(
                            SELECT MAX(date)
                            FROM Forms_data AS fd
                            WHERE fd.dni = Forms_data.dni
                        )`)
                    }
                },
                order:[['last_name','DESC']],
                raw:true,
                nest:true
            })
            return allData
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },




    allCourses: async() => {
        try{
            const courses = await db.Forms_data.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('form_name')), 'form_name']],
                order:['form_name'],
                raw:true,
            })
            return courses
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    companies: async() => {
        try{
            const companies = await db.Forms_data.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('company')), 'company']],
                order:['company'],
                raw:true,
            })
            return companies
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    companiesFiltered: async(course) => {
        try{
            const companies = await db.Forms_data.findAll({
                where:{form_name:course},
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('company')), 'company']],
                order:['company'],
                raw:true,
            })
            return companies
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    companyStudents: async(company) => {
        try{
            let studentsData = await db.Forms_data.findAll({
                where: { company: company },
                order:[['last_name','ASC']],
                raw: true
              })            

            return studentsData

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },    
    courseName: async(idFormData) => {
        try{
            const courseName = await db.Forms_data.findOne({
                where:{id:idFormData},
                attributes:['form_name'],
                raw:true,
            })
            return courseName.form_name
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    coursesFiltered: async(company) => {
        try{
            const courses = await db.Forms_data.findAll({
                where: {company:company},
                attributes: [
                    [sequelize.fn('DISTINCT', sequelize.col('form_name')), 'form_name']
                ],
                order:['form_name'],
                raw:true,
            })

            for (let i = 0; i < courses.length; i++) {
                const passGrade = await db.Courses.findOne({
                    where:{course_name:courses[i].form_name}
                })
                courses[i].pass_grade = passGrade.pass_grade
            }
            return courses
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    dataToPrint: async(idsFormsData) => {

        const dataToPrint = await db.Forms_data.findAll({
            where:{id:idsFormsData},
        })

        return dataToPrint        
    },
    studentCode: async(courseCode) => {
        const courseCodeQty = await db.Forms_data.count({
            where:{course_code:courseCode}
        })

        var studentCode = (courseCodeQty + 1).toString()

        if (studentCode.length == 1) {
            studentCode = '0' + studentCode
        }

        return studentCode
    },
    studentData: async(company,dni) => {

        const studentCourses = await db.Forms_data.findAll({
            where:{dni:dni,company:company},
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('form_name')), 'form_name']],
            order:[['form_name','ASC']],
            raw:true
        })

        const studentData = await db.Forms_data.findAll({
            where:{dni:dni,company:company},
            order:[['form_name','ASC'],['date','ASC']],
            raw:true
        })

        for (let i = 0; i < studentCourses.length; i++) {
            studentCourses[i].data = []
            for (let j = 0; j < studentData.length; j++) {
                if (studentData[j].form_name == studentCourses[i].form_name) {
                    studentCourses[i].data.push(studentData[j])
                }
            }
        }

        for (let i = 0; i < studentCourses.length; i++) {
            for (let j = 0; j < studentCourses[i].data.length; j++) {
                const dateString = await datesFunctions.dateToString(studentCourses[i].data[j].date)
                studentCourses[i].data[j].dateString = dateString
            }
        }

        return studentCourses      
    },
    studentsData: async(course) => {

        //get the max id of each student
        const idsList = await db.Forms_data.findAll({
            where:{form_name:course},
            attributes: ['dni', [sequelize.fn('MAX', sequelize.col('id')), 'id']],
            group: ['dni']
        })

        const idsArray = idsList.map(obj => obj.id)

        //get studentsData
        const studentsData = await db.Forms_data.findAll({
            where:{id:idsArray},
            order:[['company','ASC'],['last_name','ASC']]
        })

        return studentsData        
    },
    studentDataFiltered: async(idFormData) => {

        const studentDataFiltered = await db.Forms_data.findOne({
            where:{id:idFormData},
            raw:true
        })
        return studentDataFiltered        
    },
    studentsDataFiltered: async(company,course) => {

        //get the max id of each student
        const idsList = await db.Forms_data.findAll({
            where:{company:company,form_name:course},
            attributes: ['dni', [sequelize.fn('MAX', sequelize.col('id')), 'id']],
            group: ['dni']
        })

        const idsArray = idsList.map(obj => obj.id)

        //get studentsData
        const studentsData = await db.Forms_data.findAll({
            where:{id:idsArray},
            order:[['last_name','ASC']]
        })

        return studentsData        
    },
    studentLastResult: async(course,dni) => {
        try{
            //get id of last exam
            const idLastResult = await db.Forms_data.findOne({
                where: {form_name:course,dni:dni},
                attributes: [[sequelize.fn('max', sequelize.col('id')), 'id']],
                raw:true,
            })
            //get last exam data
            const studentLastResult = await db.Forms_data.findOne({
                where: {id:idLastResult.id},
                raw:true,
            })
            
            return studentLastResult

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    studentLastResultFiltered: async(company,course,dni) => {
        try{
            //get id of last exam
            const idLastResult = await db.Forms_data.findOne({
                where: {company:company,form_name:course,dni:dni},
                attributes: [[sequelize.fn('max', sequelize.col('id')), 'id']],
                raw:true,
            })
            //get last exam data
            const studentLastResult = await db.Forms_data.findOne({
                where: {id:idLastResult.id},
                raw:true,
            })
            
            return studentLastResult

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    studentsQty: async(course) => {
        try{
            const studentsQty = await db.Forms_data.findAll({
                where: {form_name:course},
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('dni')), 'dni']],
                raw:true,
            })
            return studentsQty
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },    
    studentsQtyFiltered: async(company,course) => {
        try{
            const studentsQty = await db.Forms_data.findAll({
                where: {company:company,form_name:course},
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('dni')), 'dni']],
                raw:true,
            })
            return studentsQty
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    fullNames: async(courseName) => {        
        const fullNames = await db.Forms_data.findAll({
            attributes: [
                [db.sequelize.fn('DISTINCT', 
                    db.sequelize.fn('CONCAT', 
                        db.sequelize.col('last_name'), 
                        ', ', 
                        db.sequelize.col('first_name')
                    )
                ), 'full_name']
            ],
            where:{
                form_name:courseName
            },
            order:['full_name'],
            raw:true
        })
        return fullNames
    },
}

module.exports = formsDataQueries