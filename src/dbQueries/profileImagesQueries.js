const db = require('../../database/models')
const { Op } = require('sequelize')
const model = db.Profile_images

const profileImagesQueries = {
    findImage: async(dni) => {
        const findImage = await model.findOne({
            where:{
                dni:dni,
            }
        })
        return findImage
    },
    create: async(dni,fileName) => {
        await model.create({
            dni:dni,
            image:fileName            
        })
    },
    destroy: async(dni) => {
        await model.destroy({
            where:{
                dni:dni
            }     
        })
    }
}

module.exports = profileImagesQueries