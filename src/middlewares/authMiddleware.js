//Route middleware
function authMiddleware(req,res,next){
    if(!req.session.userLogged){
        return res.redirect('/users/login')
    }
    return next()
}
module.exports=authMiddleware