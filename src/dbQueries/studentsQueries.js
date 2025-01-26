const db = require('../../database/models')
const sequelize = require('sequelize')
const { Op, fn, col } = require('sequelize')
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
        const createdData = await model.bulkCreate(data)
        return createdData
    },
    update: async(data) => {
        await model.update(
            data.data,
            {
                where:{
                    id:data.id
                }
            }
        )
    },
    get: async({ limit, offset, filters }) => {

        const where = {
            enabled: 1
        }

        if (filters.company) {
            where.company = {
                [Op.like]: `%${filters.company}%`
            }
        }

        if (filters.dni) {
            where.dni = {
                [Op.like]: `%${filters.dni}%`
            }
        }

        if (filters.last_name) {
            where.last_name = {
                [Op.like]: `%${filters.last_name}%`
            }
        }

        if (filters.first_name) {
            where.first_name = {
                [Op.like]: `%${filters.first_name}%`
            }
        }

        if (filters.email) {
            where.email = {
                [Op.like]: `%${filters.email}%`
            }
        }

        //order
        const order = filters.order_element && filters.order_type 
        ? [[filters.order_element, filters.order_type.toUpperCase()]]
        : [['last_name', 'ASC']] // default value

        const data = await model.findAndCountAll({
            order,
            where,
            limit,
            offset,
            raw:true
        })

        return data
    },
    companies: async() => {
        const data = await model.findAll({
            attributes: [[sequelize.fn('DISTINCT', sequelize.col('company')), 'company']],
            order: [['company', 'ASC']],
            where: {
                enabled: 1,
            },
            raw: true,
        })
        return data
    },
}

module.exports = studentsQueries