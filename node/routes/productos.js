const {Router} = require("express");

const {productosGet, productosPost, productosTestGet} = require("../controllers/productos");

const router = Router();

//Rutas
router.get("/",productosGet);
router.post("/",productosPost);
router.get("/test/",productosTestGet);

module.exports = router;