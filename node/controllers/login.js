const {response, request} = require("express");

//
let Contenedor = require("./contenedor");
let contenedor = new Contenedor("productos","./file/productos.txt");
//
const {User} = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const logoutGet = async(req=request,res=response,next)=>{
    let nombreUsuario = req.session.nombreUsuario;
    req.session.destroy(err=>{
        if(err) res.send(JSON.stringify(err));
        res.render("../logout",{nombre:nombreUsuario});
    });
}

const loginPost = async(req=request,res=response,next)=>{
    const user = await User.findOne({name:req.body.txtNombre});
    let secret = process.env.SECRET;
    if(!user){
        //res.status(404).send({message:"No existe este usuario"});
        res.render("../noExisteUsuario", {});
    }else if(user && bcrypt.compareSync(req.body.txtPassword,user.password)){
        req.session.nombreUsuario = user.name;
        req.session.correo = user.email;
        const token = jwt.sign({
            userId: user._id,
            name: user.name,
            email: user.email
        },
        secret,
        {
            expiresIn: 60*10
        }
        );
        //res.status(200).send({name:user.name,token});
        res.render("../index", {data:await contenedor.getAll(),nombre:user.name, correo:user.email});
    }else{
        //res.status(400).send({message:"Contraseña incorrecta"});
        res.render("../credencialesNoSonCorrectas", {});
    }
}

const registroUsuarioGet = async(req=request,res=response,next)=>{
    res.render("../registroUsuario",{});
}

const registroUsuarioPost = async(req=request,res=response,next)=>{
    const {txtNombre, txtPassword, txtCorreo} = req.body;
    let newUser = new User({
        name: txtNombre,
        email: txtCorreo,
        password:bcrypt.hashSync(txtPassword,10)
    });
    newUser = await newUser.save();
    !newUser?res.status(400).send({message:"Usuario no se pudo crear"})
    :
    //res.status(200).send(newUser);
    res.render("../usuarioRegistrado", {});
}

module.exports = {
    logoutGet,
    loginPost,
    registroUsuarioGet,
    registroUsuarioPost 
}