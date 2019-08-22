module.exports = (req, res, next) =>{
    res.locals.isAuthenticated = req.isAuthenticated();
    if(res.locals.isAuthenticated){
        res.locals.user = req.user;
    }
    next();
}