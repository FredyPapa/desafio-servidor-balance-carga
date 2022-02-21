const validarSesion = (req,res,next)=>{
    if(req.session.nombreUsuario){
        let nombreUsuario = req.session.nombreUsuario;
        //console.log(nombreUsuario)
        res.render("../index", {nombre:nombreUsuario});
    }else{
        return res.render("../login", {});
    }
    next();
}

module.exports = {
    validarSesion
}