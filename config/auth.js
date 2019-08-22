module.exports = {
    login : (req, res, next) =>{
        if(req.isAuthenticated()){
            res.redirect('/');
        }else{
            next();
        }
    },
    dashboard : (req, res, next) =>{
        if(req.isAuthenticated()){
            next();
        }else{
            res.redirect('/auth/login');
        }
    },
    items : (req, res, next) =>{
        if(req.user.username === "admin"){
            next();
        }else {
            res.redirect('/admin');
        }
    },
    chat : (req, res, next) =>{
        if(req.isAuthenticated()){
            next();
        }else{
            res.redirect('/auth/login');
        }
    }
}