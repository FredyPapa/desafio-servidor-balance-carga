const {Router} = require("express");

const {mostrarDatos, mostrarNumeros} = require("../controllers/info");

const router = Router();

//Rutas
router.get("/info/",mostrarDatos);
router.get("/api/randoms",mostrarNumeros);

module.exports = router;