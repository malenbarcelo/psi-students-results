
const formsDataQueries = require('../../functions/formsDataQueries')
const coursesQueries = require('../../functions/coursesQueries')
const associatedFormsQueries = require('../../dbQueries/associatedFormsQueries')

const resultsController = {
  getData: async(req,res) =>{
    try{
      
      const data = await formsDataQueries.studentsResults()

      return res.status(200).json(data)

    }catch(error){
      console.log(error)
      return res.send('Ha ocurrido un error')
    }
  },
}
module.exports = resultsController

