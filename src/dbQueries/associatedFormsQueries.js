const db = require('../../database/models')
const sequelize = require('sequelize')
const { Op, fn, col } = require('sequelize')
const model = db.Associated_forms

const associatedFormsQueries = {
    getAssociatedForms: async(courseId) => {
        const data = await model.findAll({
            where: {
                [Op.or]: [
                    { id_forms: courseId },
                    { id_associated_form: courseId }
                ]
            },
            raw:true
        })
        return data
    },
    courseAssociatedForms: async(courseId) => {
        const forms = await model.findAll({
            where:{
                id_forms:courseId
            },
            raw:true
        })
        return forms
    },
    findAssociatedForm: async(courseId) => {
        const forms = await model.findAll({
            where:{
                id_associated_form:courseId
            },
            raw:true
        })
        return forms
    },
}

module.exports = associatedFormsQueries