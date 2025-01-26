const studentsQueries = require("../../dbQueries/studentsQueries")

const updateController = {
    /* students */
    students: async(req,res) =>{
        try{

            const data = req.body

            await studentsQueries.update(data)

            res.status(200).json()

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
}
module.exports = updateController

