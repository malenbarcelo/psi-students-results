const db = require('../../database/models')
const {validationResult} = require('express-validator')
const bcrypt = require('bcryptjs')
const formsDataQueries = require('../functions/formsDataQueries')
const usersQueries = require('../functions/usersQueries')
const readGoogleSheets = require('../functions/readGoogleSheets')
const {addFormsData} = require('../functions/addFormsData')

const usersController = {
    createAdministrator: async(req,res) => {
        try{
            const companies = await formsDataQueries.companies()
            return res.render('users/createAdm',{title:'Alta administrador',companies})
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    deleteAdministrator: async(req,res) => {
        try{
            const administrators = await usersQueries.allAdministrators()
            return res.render('users/deleteAdm',{title:'Eliminar administrador',administrators})
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    login: async(req,res) => {

        if (req.session.userLogged) {
            return res.redirect('/logout')
        }
        return res.render('users/login',{title:'Iniciar Sesión'})
    },
    logout: (req,res) => {
        req.session.destroy()
        return res.redirect('/')
    },
    processChangePassword: async(req,res) => {
        try{
            const resultValidation = validationResult(req)
            if (resultValidation.errors.length > 0){
                return res.render('users/changePassword',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Cambiar contraseña'
                })
            }
            const newPassword = bcrypt.hashSync(req.body.password,10)
            await db.Users.update(
                { password: newPassword },
                { where: { user_email: req.body.email } }
              )

            const userToLogin = await db.Users.findOne({
            where:{user_email:req.body.email},
            nest:true,
            raw:true
            })

            delete userToLogin.password

            req.session.userLogged = userToLogin

            return res.redirect('/courses/my-courses/' + req.session.userLogged.users_companies.company_name)

        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    processCreateAdministrator: async(req,res) => {
        try{
            const companies = await formsDataQueries.companies()

            const resultValidation = validationResult(req)

            if (resultValidation.errors.length > 0){
                return res.render('users/createAdm',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    companies,
                    title:'Alta administrador'
                })
            }

            //create user
            await db.Users.create({
                first_name: req.body.firstName,
                last_name: req.body.lastName,
                user_email:req.body.email,
                password: bcrypt.hashSync(req.body.email,10),
                company:req.body.selectCompany,
                id_user_categories:2,
                enabled:1,
            })

            const successMessage = true
            
            return res.render('users/createAdm',{title:'Alta administrador',companies, successMessage})
            
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    processDeleteAdministrator: async(req,res) => {
        try{
            const resultValidation = validationResult(req)
            const administrators = await usersQueries.allAdministrators()

            if (resultValidation.errors.length > 0){
                return res.render('users/deleteAdm',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Eliminar administrador',
                    administrators
                })
            }

            //delete user
            await db.Users.destroy({where: {id:req.body.selectAdm}})
            
            const successMessage = true
            
            return res.render('users/deleteAdm',{title:'Eliminar administrador',administrators,successMessage})
            
        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    processLogin: async(req,res) => {
        const resultValidation = validationResult(req)
        try{
            if (resultValidation.errors.length > 0){
                return res.render('users/login',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Iniciar Sesión'
                })
            }
            if(req.body.email == req.body.password){
                const alertMessage = true
                const email = req.body.email
                return res.render('users/changePassword',{
                    oldData: req.body,
                    title:'Cambiar contraseña',
                    alertMessage
                })
            }

            //ADD GOOGLE SHEETS DATA
            //await addFormsData()

            //login and show my-courses
            const response = await fetch('https://psi-courses-management.wnpower.host/apis/users/get-users', {
                method: 'GET', 
                headers: {
                    'Authorization': 'Bearer l)Zmi#S$FEB4'
                }
            })

            const users = await response.json()

            req.session.userLogged = users.filter( u => u.email == req.body.email)[0]

            return res.redirect('/courses/my-courses/' + req.session.userLogged.users_companies.company_name)

        }catch(error){
            console.log(error)
            res.send('Ha ocurrido un error')
        }
    },
    processRestorePassword: async(req,res) =>{
        try{

            const administrators = await usersQueries.allAdministrators()
            const resultValidation = validationResult(req)
            
            if (resultValidation.errors.length > 0){
                return res.render('users/restorePassword',{
                    errors:resultValidation.mapped(),
                    oldData: req.body,
                    title:'Restablecer contraseña',
                    administrators
                })
            }

            const newPassword = bcrypt.hashSync(req.body.selectAdm,10)

            await db.Users.update(
                { password: newPassword },
                { where: { user_email: req.body.selectAdm } }
              )

            const successMessage = true

            return res.render('users/restorePassword',{title:'Restablecer contraseña',successMessage,administrators})

        }catch(error){
            console.log(error)
            return res.send('Ha ocurrido un error')
        }
    },
    restorePassword: async(req,res) => {
        try{
            const administrators = await usersQueries.allAdministrators()
            return res.render('users/restorePassword',{title:'Restablecer contraseña',administrators})
        }catch(error){
            console.log(error)
            res.send('Ha ocurrido un error')
        }       
    },

}
module.exports = usersController

