const db = require('../../database/models')

const databaseData = {
    allCompanies: async() => {
        try{
            const allCompanies = await db.Companies.findAll({
                raw:true
            })
            return allCompanies
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    allCourses: async() => {
        try{
            const allCourses = await db.Courses.findAll({
                order:[['course_name','ASC']],
                raw:true
            })
            return allCourses
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    allUsers: async() => {
        try{
            const allUsers = db.Users.findAll({
                raw:true,
                include: [{ all: true }]
            });
            return allUsers
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    idCompany: async(companyName) => {
        try{
            const company = await db.Companies.findOne({
                where:{company_name:companyName},
                raw:true
            })
            return company.id
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    idCourse: async(courseName) => {
        try{
            const course = await db.Courses.findOne({
                where:{course_name:courseName},
                raw:true
            })
            return course.id
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    findUser: async(userEmail) => {
        try{
            const user = await db.Users.findOne({
                where:{user_email:userEmail},
                raw:true
            })
            return user
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
}

module.exports = databaseData