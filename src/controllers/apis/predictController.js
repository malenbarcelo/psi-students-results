const studentsQueries = require("../../dbQueries/studentsQueries")

const predictController = {
    /*--------students---------*/
    companies: async(req,res) =>{
        try{
    
          const string = req.params.string.toLowerCase()
          
          const list = await studentsQueries.companies()
          const predictedList = list.filter(l => l.company.toLowerCase().includes(string))

          res.status(200).json(predictedList)
    
        }catch(error){
          console.group(error)
          return res.send('Ha ocurrido un error')
        }
      },
}
module.exports = predictController

