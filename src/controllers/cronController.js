const {addFormsData} = require('../functions/addFormsData')

const cronController = {
    getFormsData: async(req,res) => {
        try {

            //ADD GOOGLE SHEETS DATA
            await addFormsData('newData')

        }catch (error) {
             console.log(error)
        }
    }
}

module.exports = cronController

