const {addFormsData} = require('../functions/addFormsData')
const {completeFormsData} = require('../functions/completeFormsData')
const {createStudents} = require('../functions/createStudents')
const { getDataToSend } = require('../functions/getDataToSend')
const dominio = require('../functions/dominio')

const cronController = {
    getFormsData: async(req,res) => {
        try {

            //add google sheets data
            const students = await addFormsData('newData')

            //complete missing data
            await completeFormsData()

            //create students
            //await createStudents(students)

        }catch (error) {
             console.log(error)
        }
    },
    sendExpirationEmails: async(req,res) => {
        try {

            const data = await getDataToSend()

            

        }catch (error) {
             console.log(error)
        }
    },
    
}

module.exports = cronController

