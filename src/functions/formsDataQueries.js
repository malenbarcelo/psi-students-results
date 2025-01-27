const db = require('../../database/models')
const datesFunctions = require('../functions/datesFunctions')
const sequelize = require('sequelize')
const { Op, literal, fn, col} = require('sequelize')

const formsDataQueries = {
    incompleteData: async() => {
        const data = await db.Forms_data.findAll({
            include: [{association: 'forms_data_courses'}],
            where:{
                [Op.or]: [
                    { validity: null },
                    { expiration_date: null },
                    { passed: null },
                    { id_courses: null }
                ]
            },
            raw:true,
            nest:true
        })
        return data
    },
    completeData: async(id,validity,expirationDate,passed, idCourses) => {
        await db.Forms_data.update(
            {
                passed: passed,
                expiration_date: expirationDate,
                validity:validity,
                id_courses:idCourses
            },
            {
                where:{
                    id:id
                }
            }
        )
    },
    
    studentsResults: async () => {
        let data = await db.Forms_data.findAll({
            attributes: [
                'form_name',
                'dni',
                'company',
                [sequelize.fn('JSON_ARRAYAGG', sequelize.literal(`
                    JSON_OBJECT(
                        'id', Forms_data.id,
                        'date', Forms_data.date,
                        'email', Forms_data.email,
                        'grade', Forms_data.grade,
                        'last_name', Forms_data.last_name,
                        'first_name', Forms_data.first_name,
                        'expiration_date', Forms_data.expiration_date,
                        'passed', Forms_data.passed,
                        'days_to_expiration', 
                                CASE 
                                    WHEN DATEDIFF(Forms_data.expiration_date, CURDATE()) < -1 THEN -9999
                                    ELSE DATEDIFF(Forms_data.expiration_date, CURDATE())
                                END
                    )
                `)), 'results']
            ],
            group: [
                'form_name', 
                'dni', 
                'company',
                'forms_data_courses.associated_courses.id',
                'Forms_data.id', 
                'Forms_data.date'
            ],
            include: [{
                association: 'forms_data_courses',
                include: [{association: 'associated_courses' }]
            }],
            raw: false,
            nest: true
        });
                
        const plainData = data.map(record => record.get({ plain: true }));

        plainData.forEach(item => {
            item.results.sort((a, b) => b.id - a.id); // Ordenar en orden descendente por `id`
        });

        return plainData;
    },
    studentResults: async (idCourse,dni,company) => {
        let data = await db.Forms_data.findAll({
            where:{
                dni:dni,
                company:company
            },
            include: [{ 
                association: 'forms_data_courses',
                where:{
                    id: idCourse
                }
            }],
            order:[['id','DESC']],
            raw: true,
            nest: true
        });

        data = data.map(item => {
            const expirationDate = new Date(item.expiration_date); // Asegúrate de que `expiration_date` exista
            const today = new Date();
    
            // Calcular la diferencia en días
            const differenceInTime = expirationDate.getTime() - today.getTime();
            const daysToExpiration = Math.ceil(differenceInTime / (1000 * 60 * 60 * 24)); // Convertir milisegundos a días
    
            return {
                ...item,
                days_to_expiration: daysToExpiration
            };
        });
    
        return data;
    },

    courseResults: async (forms, company) => {

        const whereCondition = {
            form_name: forms,
        };
    
        if (company !== "PSI Smart Services") {
            whereCondition.company = company;
        }

        let results = await db.Forms_data.findAll({
            include:[{association: 'student_data'}],
            where:whereCondition,
            order:[['id','DESC']],
            //raw:true,
            nest:true
            
        })

        return results;
    },








    getData: async() => {
        const data = await db.Forms_data.findAll({
            attributes: [
                'form_name',
                'dni',
                [sequelize.fn('JSON_ARRAYAGG', sequelize.literal(`
                    JSON_OBJECT(
                        'id', Forms_data.id,
                        'date', Forms_data.date,
                        'email', Forms_data.email,
                        'grade', Forms_data.grade,
                        'last_name', Forms_data.last_name,
                        'first_name', Forms_data.first_name,
                        'company', Forms_data.company
                    )
                `)), 'results']],
            group: ['form_name', 'dni'],
            include: [{
                association: 'forms_data_courses',
                where:{
                    includes_certificate: { [Op.ne]: 0 },
                    validity: { [Op.ne]: 0 }
                }
            }],
            raw:true,
            nest:true
        })
        return data
    },
    getDataFiltered: async(formName,dni) => {
        const data = await db.Forms_data.findAll({
            attributes: [
                'form_name',
                'dni',
                [sequelize.fn('JSON_ARRAYAGG', sequelize.literal(`
                    JSON_OBJECT(
                        'id', id,
                        'date', date,
                        'email', email,
                        'grade', grade,
                        'last_name', last_name,
                        'first_name', first_name,
                        'company', company
                    )
                `)), 'results']],
            group: ['form_name', 'dni'],
            where:{
                form_name: formName,
                dni:dni
            },
            limit:100,
            raw:true
        })
        return data
    },





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
    companies: async () => {
        try {
            const companies = await db.Forms_data.findAll({
                attributes: [
                    [sequelize.fn('DISTINCT', sequelize.fn('TRIM', sequelize.col('company'))), 'company']
                ],
                order: [[sequelize.literal('company'), 'ASC']],
                raw: true,
            });
            return companies;
        } catch (error) {
            console.error('Error fetching companies:', error);
            return { error: 'Ha ocurrido un error' };
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
            include:[{association:'student_data'}],
            where:{id:idsFormsData},
            //raw:true,
            nest:true
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
            include:[{association:'student_data'}],
            where:{id:idFormData},
            //raw:true,
            nest:true
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
    fullNames: async(courseName,company) => {
        
        const whereCondition = {
            form_name: courseName,
        };
    
        if (company !== "PSI Smart Services") {
            whereCondition.company = company;
        }

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
            where: whereCondition,
            order:['full_name'],
            raw:true
        })
        return fullNames
    },
}

module.exports = formsDataQueries