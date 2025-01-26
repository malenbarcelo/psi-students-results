const db = require('../../database/models')
const {validationResult} = require('express-validator')
const formsDataQueries = require('../functions/formsDataQueries')
const studentsQueries = require('../dbQueries/studentsQueries')

const studentsController = {
    students: async(req,res) => {
        try{
            const companies = await formsDataQueries.companies()
            return res.render('students/students',{title:'Alumnos',companies})
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    }
}
module.exports = studentsController

