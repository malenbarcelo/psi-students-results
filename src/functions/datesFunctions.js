const db = require('../../database/models')
const sequelize = require('sequelize')

const dateFunctions = {
    dateToString: async(date) => {
        try{
            let day = date.getDate()
            let month = date.getMonth() + 1 //because months in javascript start in 0
            let year = date.getFullYear()
            
            day = day.toString()
            month = month.toString()
            
            if (day.length == 1) {
                day = "0" + day;
            }
            if (month.length == 1) {
                month = "0" + month;
            }

            stringDate = day + '/' + month + '/' +  year

            return stringDate

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
}

module.exports = dateFunctions