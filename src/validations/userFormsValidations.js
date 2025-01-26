const {body} = require('express-validator')
const bcrypt = require('bcryptjs')
const db = require('../../database/models');
const path = require('path')
const readXlsFile = require('read-excel-file/node')
const usersQueries = require('../functions/usersQueries')

const userFormsValidations = {
    loginFormValidations: [
        body('email')
            .notEmpty().withMessage('Ingrese un mail').bail()

            .isEmail().withMessage('Ingrese un mail válido')

            .custom(async(value,{ req }) => {
                const response = await fetch('https://psi-courses-management.wnpower.host/apis/users/get-users', {
                    method: 'GET', 
                    headers: {
                        'Authorization': 'Bearer l)Zmi#S$FEB4'
                    }
                })

                const users = await response.json()

                const userToLogin = users.filter( u => u.email == req.body.email)

                if (userToLogin.length == 0) {
                    throw new Error('Usuario inválido')
                }

                return true
            }),
        body('password')

            .notEmpty().withMessage('Ingrese una contraseña')

            .custom(async(value,{ req }) => {
                
                //get users from psi-courses-management
                const response = await fetch('https://psi-courses-management.wnpower.host/apis/users/get-users', {
                    method: 'GET', 
                    headers: {
                        'Authorization': 'Bearer l)Zmi#S$FEB4'
                    }
                })

                const users = await response.json()
                
                const userToLogin = users.filter( u => u.email == req.body.email)

                if (userToLogin.length > 0) {
                    if (!bcrypt.compareSync(req.body.password, userToLogin[0].password)) {
                        throw new Error('Contraseña inválida')
                    }
                }

                return true
            })
    ],
    changePswFormValidations: [
        body('password')
            .notEmpty().withMessage('Ingrese una contraseña')
            .custom(async(value,{ req }) => {
                if (req.body.password != req.body.confirmPassword) {
                throw new Error('Las contraseñas no coinciden')
                }
                return true
            }),
        body('confirmPassword')
            .notEmpty().withMessage('Reingrese la contraseña')
            .custom(async(value,{ req }) => {
                if (req.body.password != req.body.confirmPassword) {
                throw new Error('Las contraseñas no coinciden')
                }
                return true
            }),
    ],
    createAdmFormValidations: [
        body('selectCompany')
            .custom(async(value,{ req }) => {
                if(req.body.selectCompany == 'default'){
                    throw new Error('Seleccione una compañía')
                }
                return true
            }),
        body('firstName').notEmpty().withMessage('Ingrese el nombre del administrador'),
        body('lastName').notEmpty().withMessage('Ingrese el apellido del administrador'),
        body('email')
            .notEmpty().withMessage('Ingrese un mail')
            .isEmail().withMessage('Ingrese un mail válido')
            .custom(async(value,{ req }) => {
                const user = await usersQueries.findUser(req.body.email)
                if (user) {
                throw new Error('El mail ingresado ya existe en la base de usuarios')
                }
                return true
            }),
    ],
    deleteAdministratorFormValidations: [
        body('selectAdm')
            .custom(async(value,{ req }) => {
                if(req.body.selectAdm == 'default'){
                    throw new Error('Seleccione un administrador')
                }
                return true
            })
    ],
    restorePswFormValidations: [
        body('selectAdm')
            .custom(async(value,{ req }) => {
                if(req.body.selectAdm == 'default'){
                    throw new Error('Seleccione un administrador')
                }
                return true
            })
    ],
}

module.exports = userFormsValidations