const db = require('../../database/models')
const sequelize = require('sequelize')
const { Op, fn, col } = require('sequelize')
const model = db.Associated_forms

const associatedFormsQueries = {
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