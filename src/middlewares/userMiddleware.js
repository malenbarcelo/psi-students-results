//Route middleware
function userMiddleware(req,res,next){
    if(!req.session.userLogged){
        return res.redirect('/')
    }else{
        if(req.session.userLogged.users_companies.company_name != req.params.company){
            return res.redirect('/courses/my-courses/' + req.session.userLogged.users_companies.company_name)
        }
    }

    return next()
}
module.exports=userMiddleware