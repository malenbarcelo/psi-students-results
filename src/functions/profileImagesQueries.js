const db = require('../../database/models')
const sequelize = require('sequelize')

const profileImagesQueries = {
    imageName: async(dni) => {
        
        try{
            const imageName = await db.Profile_images.findOne({
                where:{dni:dni},
                raw:true,
            })
            if (imageName) {
                return imageName.image
            }
            return ''
            
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
}

module.exports = profileImagesQueries