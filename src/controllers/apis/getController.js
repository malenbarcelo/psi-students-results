const studentsQueries = require("../../dbQueries/studentsQueries")

const getController = {
    /*--------students---------*/
    students: async(req,res) =>{
        try{

            const { page, size, company, dni, last_name, first_name, email, order_element, order_type } = req.query
            const limit = size ? parseInt(size) : undefined
            const offset = page ? (parseInt(page) - 1) * limit : undefined
            const filters = {}
            
            //add filters
            filters.order_element = order_element
            filters.order_type = order_type
            
            if (company) {
                filters.company = company.toLowerCase()
            }
            if (dni) {
                filters.dni = dni
            }
            if (last_name) {
                filters.last_name = last_name.toLowerCase()
            }
            if (first_name) {
                filters.first_name = first_name.toLowerCase()
            }
            if (email) {
                filters.email = email.toLowerCase()
            }

            //get data
            const data = await studentsQueries.get({ limit, offset, filters })

            //get pages
            const pages = Math.ceil(data.count / limit)
            data.pages = pages

            res.status(200).json(data)

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
}
module.exports = getController

