//Route middleware
function admMiddleware(req,res,next){
    if(!req.session.userLogged){
        return res.redirect('/')
    }else{
        if(req.session.userLogged.id_users_categories == 4){
            return res.redirect('/courses/my-courses/' + req.session.userLogged.users_companies.company_name)
        }
    }

    return next()
}
module.exports=admMiddleware