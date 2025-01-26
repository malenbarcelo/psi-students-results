
const db = require('../../database/models')
const studentsQueries = require('../dbQueries/studentsQueries')

async function createStudents(newStudents) {

  const students = await studentsQueries.allData()
  const studentsToCreate = newStudents.filter(
      s => !students.some(sc => sc.dni === s.dni && sc.company === s.company))
      .map(s => ({
        company: s.company,
        enabled:1,
        first_name: s.first_name.trim(),
        dni: String(s.dni).trim(),
        email: s.email.trim(),
        last_name: s.last_name.trim(),
    }))

    //create students
    await studentsQueries.create(studentsToCreate)

}

module.exports = {createStudents}
