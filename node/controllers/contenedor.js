let faker = require('faker');
faker.locale = "es";
const fs = require("fs");
const db_knex_mysql = require("../config/db-mysql");
const db_knex_sqlite3 = require("../config/db-sqlite3");
const db_mysql = db_knex_mysql.client;
//const db_sqlite3 = db_knex_sqlite3.client;
let {schema,normalize,denormalize} = require('normalizr');
let inspect = require('../utils/objectPrinter');

class Contenedor{
    constructor(tabla,url){
        this.tabla = tabla;
        this.url = url;
        this.arregloMensajes = [];
    }
    //Cargar elementos al arreglo de Productos
    async loadArray(){
        //Obtenemos la información del archivo
        if(fs.existsSync(this.url)){
            const contenido = await fs.promises.readFile(this.url,'utf-8');
            //Lo almacenamos en el arreglo de Productos
            this.arregloProductos=(JSON.parse(contenido));
        }
    }
    //Crear/Agregar contenido al archivo
    async save(data){
        try {
            //Validamos si existe la tabla
            let existe = await db_mysql.schema.hasTable(this.tabla);
            //Si no existe Creamos la tabla
            if(!existe){
                await db_mysql.schema.createTable(this.tabla,table=>{
                    table.increments("id").primary(),
                    table.string("title"),
                    table.string("price"),
                    table.string("thumbnail")
                });
            }
            //Insertamos el registro
            return await db_mysql.from(this.tabla).insert(data);
        } catch (error) {
            console.log(error);
        }
    }

    //Leer el archivo y devolver todos los objetos
    async getAll(){
        try {
            //Validamos si existe la tabla
            let existe = await db_mysql.schema.hasTable(this.tabla);
            //Si no existe Creamos la tabla
            if(!existe){
                await db_mysql.schema.createTable(this.tabla,table=>{
                    table.increments("id").primary(),
                    table.string("title"),
                    table.string("price"),
                    table.string("thumbnail")
                });
            }
            //Listamos todos los registros
            return await db_mysql.from(this.tabla);
        } catch (error) {
            console.log(error);
        }
    }

    //Generar y devolver 5 productos de prueba
    async getTestAll(){
        try {
            const  productosTest = [];
            for (let i = 0; i < 5; i++) {
                const obj = {
                    id:i+1,
                    title: faker.commerce.productName(),
                    price: faker.commerce.price(),
                    thumbnail: faker.image.image()
                }
                productosTest.push(obj);
            }
            return productosTest;
        } catch (error) {
            console.log(error);
        }
    }

    //Crear/Agregar mensaje de chat
    async saveMensaje(data){
        try {
            //Damos forma a la Data
            const mensaje = {
                "id":this.arregloMensajes.length+1,
                author: {
                    id: data.correo,
                    nombre:faker.name.firstName(),
                    apellido:faker.name.lastName(),
                    edad:faker.datatype.number({"min":1,"max":100}),
                    alias:faker.name.middleName(),
                    avatar: faker.image.avatar()
                },
                text: data.mensaje
            }
            //Agregamos el objeto al arreglo
            this.arregloMensajes = [...this.arregloMensajes,mensaje]
            //Guardamos el arreglo actualizado en el archivo
            await fs.promises.writeFile(this.url,JSON.stringify(this.arregloMensajes,"",2));
            const listaMensajes = {
                "id":1000,
                "mensajes":this.arregloMensajes
            }
            //Defenimos los esquemas
            const autor = new schema.Entity("autor");
            const mensajes = new schema.Entity("mensajes",{
                author:[autor]
            });
            const mensajeSchema = new schema.Entity("listaMensajes",{
                mensajes: [mensajes]
            })
            //Añadimos el id al arreglo
            let mensajesNormalizado = normalize(listaMensajes,mensajeSchema);
            inspect(listaMensajes);
            console.log("--------------------------");
            inspect(mensajesNormalizado);
            console.log("--------------------------");
            console.log("Longitud Normal -> ",JSON.stringify(listaMensajes).length);
            console.log("Longitud Normalizada -> ",JSON.stringify(mensajesNormalizado).length);
            return mensajesNormalizado;
            
        } catch (error) {
            console.log(error);
        }
    }

}

module.exports = Contenedor;
