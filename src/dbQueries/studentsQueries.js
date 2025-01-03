const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Students

const studentsQueries = {
    allData: async() => {
        const data = await model.findAll({
            where:{
                enabled:1,
            },
            raw:true
        })
        return data
    },
    create: async(data) => {
        await model.bulkCreate(data)
    },
}

module.exports = studentsQueries