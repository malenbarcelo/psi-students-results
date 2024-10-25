const db = require('../../database/models')

const usersQueries = {
    allAdministrators: async(userEmail) => {
        try{
            const administrators = await db.Users.findAll({
                where:{id_user_categories:2},
                raw:true,
                order:[['last_name','ASC']]
            })
            return administrators
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    },
    findUser: async(userEmail) => {
        try{
            const user = await db.Users.findOne({
                where:{user_email:userEmail},
                raw:true
            })
            return user
        }catch(error){
            return res.send('Ha ocurrido un error')
        }
    }
}

module.exports = usersQueries