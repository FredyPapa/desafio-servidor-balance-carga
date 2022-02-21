const {Router} = require("express");

const {logoutGet,loginPost,registroUsuarioGet,registroUsuarioPost} = require("../controllers/login");

const router = Router();

//Rutas
router.get("/logout",logoutGet);
router.post("/login",loginPost);
router.get("/registrarUsuario",registroUsuarioGet);
router.post("/registrarUsuario",registroUsuarioPost);

module.exports = router;