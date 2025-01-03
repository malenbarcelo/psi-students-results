
const db = require('../../database/models')
const studentsQueries = require('../dbQueries/studentsQueries')

async function createStudents(newStudents) {

    const students = await studentsQueries.allData()
    const studentsToCreate = newStudents.filter(
        s => !students.some(sc => sc.dni === s.dni && sc.company === s.company)
      )

    //create students
    await studentsQueries.create(studentsToCreate)

    

}

module.exports = {createStudents}
