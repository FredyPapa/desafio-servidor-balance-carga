
console.log("Entrando al hijo!");

process.on('message', data =>{
    console.log("Mensaje recibido del padre: ",data);
    process.send({res:obtenerNumeros(data)});
});

function obtenerNumeros(cantidad){
    let numero;
    arregloNumeros = [];
    for (let i = 0; i <= 1000; i++) {
        arregloNumeros.push(0);
    }
    for (let i = 0; i < cantidad; i++) {
        numero = Math.floor((Math.random() * 999) + 1); 
        console.log(numero);
        arregloNumeros[numero]++;
    }
    for (let i = 0; i <= 1000; i++) {
        arregloNumeros[i]="El total de "+ i +" fue : "+arregloNumeros[i];
    }
    return arregloNumeros;
}
