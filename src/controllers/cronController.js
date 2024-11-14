const {addFormsData} = require('../functions/addFormsData')
const { getStudentsResults } = require('../functions/getStudentsResults')
const dominio = require('../functions/dominio')

const cronController = {
    getFormsData: async(req,res) => {
        try {

            //ADD GOOGLE SHEETS DATA
            await addFormsData('newData')

        }catch (error) {
             console.log(error)
        }
    },
    sendExpirationEmails: async(req,res) => {
        try {

            const data = await getStudentsResults()

            //const data = await (await fetch(dominio + 'apis/students-results/' + srg.companyName + '/' + srg.courseName)).json()

            //const response = await fetch(dominio + 'apis/students-results/PSI Smart Services/Seguridad en el Manejo (4x4)');
            
            //console.log(response.ok)
            // const data = await response.json()

            

            

        }catch (error) {
             console.log(error)
        }
    }
}

module.exports = cronController

