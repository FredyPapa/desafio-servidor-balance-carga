require('dotenv').config();
let express = require("express");
let app = express();
let cluster = require('cluster');
let numCPUs = require('os').cpus().length;
let hbs = require("express-handlebars");
let cors = require("cors");
//Usamos Yargs para enviar el puerto como argumento o por defecto 8080
let yarg = require('yargs');
let options = {
    default:{
        p:8080,
        m: "FORK"
    }
}
const procArgv = yarg(process.argv.slice(2));
const argsRes = procArgv.default(options.default).argv;
let puertoYarg = argsRes.p;
let modoYarg = argsRes.m;
//console.log("yarg: ",puertoYarg);
//console.log("yarg: ",modoYarg);
//
//let productosPath = "/api/productos";
//let loginPath = "/";
let infoPath = "/";
//
//Handlebars
app.engine("handlebars",hbs.engine());
app.set("views","views/hbs");
app.set("view engine", "handlebars");
//
app.get("/",(req,res,next)=>{
    res.render("../index", {});
});

//GET
app.get("/",(req,res,next)=>{
    res.json("Hola");
});

//CORS
app.use(cors("*"));
//Lectura y parseo del body
app.use(express.json());
app.use(express.urlencoded({extended:true}));

//Rutas
//app.use(productosPath,require("./routes/productos"));
//app.use(loginPath,require("./routes/login"));
app.use(infoPath,require("./routes/info"));

//Cluster o Fork
if(modoYarg=="FORK"){
    //console.log("FORK");
    app.listen(puertoYarg,()=>{
        console.log(`Servidor corriendo en http://localhost:${puertoYarg}`);
    });
}else{
    //console.log("CLUSTER");
    if(cluster.isMaster){
        console.log(`Master PID -> ${process.pid}`);
        //Workers
        for (let i = 0; i < numCPUs; i++) {
            console.log("i: "+(i+1));
            cluster.fork();
        }
        //
        cluster.on("exit",(worker, code, signal)=>{
            console.log(`Murió el subproceso ${worker.process.pid}`);
            cluster.fork();
        })
    }else{
        app.listen(puertoYarg,()=>{
            console.log(`Servidor corriendo en http://localhost:${puertoYarg}`);
        });
    }
}