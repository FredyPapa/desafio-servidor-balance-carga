//Importaciones de terceros
let express = require("express");
let expressSession = require('express-session')
const MongoStore = require('connect-mongo');
let hbs = require("express-handlebars");
let cors = require("cors");
const {validarSesion} = require("../utils/validar-session");
const mongoose = require('mongoose');
//
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
mongoose.connect(process.env.CONNECTION_STRING)
.then(()=>{
    console.log("Nos conectamos a MongoDB");
})
.catch((error)=>{
    console.log(error.message);
})

//Clase servidor
class server{
    constructor(){
        this.app = express();
        this.port = process.env.PORT;
        this.server = require("http").createServer(this.app);
        this.io = require("socket.io")(this.server);
        this.productosPath = "/api/productos";
        this.loginPath = "/";
        this.infoPath = "/";
        this.cluster = require('cluster');
        this.numCPUs = require('os').cpus().length;
        //Middlewares
        this.middlewares();
        //Rutas de mi aplicación
        this.routes();
        //Handlebars
        this.app.engine("handlebars",hbs.engine());
        this.app.set("views","views/hbs");
        this.app.set("view engine", "handlebars");
        //
        this.app.get("/",validarSesion,(req,res,next)=>{
            res.render("../index", {});
        });
        //Sockets
        //this.sockets();
        //
        this.usuarios = [];
        this.mensajes = [];
    }

    middlewares(){
        //CORS
        this.app.use(cors("*"));
        //Lectura y parseo del body
        this.app.use(express.json());
        this.app.use(express.urlencoded({extended:true}));
        //Directorio público
//        this.app.use(express.static('public'));
        //Sesiones
        this.app.use(expressSession({
            store: MongoStore.create({
                mongoUrl:'mongodb+srv://root:coderhouse@cursonode.o3yqn.mongodb.net/comision22460?retryWrites=true&w=majority',
                mongoOptions: {useNewUrlParser:true,useUnifiedTopology:true}
            }),
            //
            secret: "secret",
            cookie:{
                httpOnly:false,
                secure: false,
                maxAge: 1000*60*20
            },
            resave: false,
            saveUninitialized: true
        }));
    }

    routes(){
        this.app.use(this.productosPath,require("../routes/productos"));
        this.app.use(this.loginPath,require("../routes/login"));
        this.app.use(this.infoPath,require("../routes/info"));
    }

    sockets(){
        let Contenedor = require("../controllers/contenedor");
        let contenedor = new Contenedor("productos");
        let contenedorChat = new Contenedor("mensajes","./file/mensajes.txt");
        //Al conectarse
        this.io.on("connection",async(socket) => {
            //Al conectarse
            console.log("Cliente conectado");
            //Enviamos la información de los productos
            const data = await contenedor.getAll();
            socket.emit("data-tabla",data);
            //Enviamos la información de los mensajes de chat
            this.io.sockets.emit('listenserver', this.mensajes);
            //Cuando se registra un producto
            socket.on("addProducto", async dataProducto =>{
                await contenedor.save(dataProducto);
                const data = await contenedor.getAll();
                this.io.sockets.emit("data-tabla",data);
                //socket.emit("data-tabla",data);
            });
            //Cuando un usuario inicia el chat
            socket.on("addUser", data =>{
                if(this.usuarios.length > 0){
                    let verifivation_user = false;
                    this.usuarios = this.usuarios.map(usuario =>{
                        if(usuario.email == data.email){
                            verifivation_user = true;
                            return {
                                id: socket.id,
                                ...data,
                                active: true
                            };
                        }else{
                            return usuario;
                        }
                    });
                    if(!verifivation_user){
                        this.usuarios.push({
                            id : socket.id,
                            ...data,
                            active:true
                        });
                    }

                }else{
                    this.usuarios.push({
                        id : socket.id,
                        ...data,
                        active:true
                    });
                }                    
                //this.io.sockets.emit('loadUsers', this.usuarios);
            });
            //Cuando un usuario envía un mensaje por el chat
            socket.on("mensaje", async data =>{
                this.mensajes.push(data);
                let respuesta = await contenedorChat.saveMensaje(data);
                this.io.sockets.emit('listenserver', this.mensajes);
                this.io.sockets.emit('respuesta', respuesta);
            });
        });
    }

    listen(){
        console.log(modoYarg);
        if(modoYarg=="FORK"){
            this.server.listen(puertoYarg,()=>{
                console.log(`Servidor corriendo en http://localhost:${puertoYarg}`);
            });
        }else{
            if(this.cluster.isMaster){
                console.log(`Master PID -> ${process.pid}`);
                //Workers
                for (let i = 0; i < this.numCPUs; i++) {
                    console.log("i: "+(i+1));
                    this.cluster.fork();
                }
                //
                this.cluster.on("exit",(worker, code, signal)=>{
                    console.log(`Murió el subproceso ${worker.process.pid}`);
                    this.cluster.fork();
                })
            }else{
            }
                this.server.listen(puertoYarg,()=>{
                    console.log(`Servidor corriendo en http://localhost:${puertoYarg}`);
                });
            }
        }
    }

//Exportamos la clase
module.exports = server;