const db = require('../../database/models')
const sequelize = require('sequelize')

const docTemplates = {
    certificateLogos: async(req,res) => {
        try{
            const certificateLogos = await db.Documents_templates.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('certificate_logo')), 'certificate_logo']],
                where:{certificate_logo:{[sequelize.Op.ne]: ''}},
                raw:true
            })
            return certificateLogos
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    credentialLogos: async(req,res) => {
        try{
            const credentialLogos = await db.Documents_templates.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('credential_logo')), 'credential_logo']],
                where:{credential_logo:{[sequelize.Op.ne]: ''}},
                raw:true
            })
            return credentialLogos
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    signatures1: async(req,res) => {
        try{
            const signatures1 = await db.Documents_templates.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('signature1_image')), 'signature1_image']],
                raw:true
            })
            return signatures1
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    signatures2: async(req,res) => {
        try{
            const signatures2 = await db.Documents_templates.findAll({
                attributes: [[sequelize.fn('DISTINCT', sequelize.col('signature2_image')), 'signature2_image']],
                where:{signature2_image:{[sequelize.Op.ne]: ''}},
                raw:true
            })
            return signatures2
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
}

module.exports = docTemplates