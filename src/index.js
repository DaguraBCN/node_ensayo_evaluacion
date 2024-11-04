// Carga de los modulos
const express = require('express')
const app = express()

// Cargamos las rutas del proyecto
const path = require('node:path')

// Obtener el numero del puerto
process.loadEnvFile()
const PORT = process.env.PORT

// Cargar los datos
const datos = require('../data/customers.json');
// console.log(datos);
// Ordenar por apellido del cliente (descendente A->Z)
datos.sort((a, b) => a.surname.localeCompare(b.surname, "es-ES"))
// console.log(datos);

// Indicar la ruta de los ficheros estaticos, con un punto es en el mismo nivel, con 2 puntos sube un nivel
app.use(express.static(path.join(__dirname, "../public")))

// Ruta Home = Inicio
app.get("/", (req, res) => {
    // console.log("Estamos en /");
    res.sendFile(__dirname + "/index.html");
})

// Ruta API Global
app.get("/api",(req, res) => {
    res.json(datos);
})

// Ruta para filtrar los clientes por el apellido
// app.get("",(req, res) => {})
app.get("/api/apellido/:cliente_apellido",(req, res) => {
    const apellido = req.params.cliente_apellido.toLocaleLowerCase()
    // console.log(apellido);
    const filtroClientes = datos.filter(cliente => cliente.surname.toLocaleLowerCase() == apellido)
    // console.log(filtroClientes);
    if (filtroClientes == 0) {
        return res.status(404).send("Cliente no encontrado")
    }
    res.json(filtroClientes)
})

// Ruta para filtrar los clientes por el nombre y el apellido
app.get("/api/nombre_apellido/:cliente_nombre/:cliente_apellido",(req, res) => {
    const nombre = req.params.cliente_nombre.toLocaleLowerCase()
    const apellido = req.params.cliente_apellido.toLocaleLowerCase()
    // console.log(apellido);
    const filtroClientes = datos.filter(cliente => cliente.name.toLocaleLowerCase() == nombre && cliente.surname.toLocaleLowerCase() == apellido)
    // console.log(filtroClientes);
    if (filtroClientes == 0) {
        return res.status(404).send("Cliente no encontrado")
    }
    res.json(filtroClientes)
})

// Ruta para filtrar los clientes por el nombre y las primeras letras del apellido
app.get("/api/nombre/:nombre", (req, res) => {
    const nombre = req.params.nombre.toLocaleLowerCase()
    const apellido = req.query.apellido
    console.log(nombre, apellido);
    // Si no se incluye el apellido valdrá undefined
    // mostraremos un filtro solo por el nombre
    if (apellido === undefined) {
        // Si no tenemos el apellido filtraremos solo por el nombre
        const filtroClientes = datos.filter(cliente => cliente.name.toLocaleLowerCase() == nombre)

        // Nos aseguramos que el array con los clientes no esté vacio
        if (filtroClientes.length == 0) {
            return res.status(404).send("Cliente no encontrado")
        }
        // Devolvemos el filtro solo por el nombre del cliente
        return res.json(filtroClientes); 
    }
    // console.log(nombre, apellido);

    // Para saber cuantas lertras tiene el apellido escrito por el usuario
    const letras = apellido.length

    // Comprobamos con la longitud de las letras del apellido conincida con el apellido introducido
    const filtroClientes = datos.filter(cliente =>  cliente.surname.slice(0, letras).toLocaleLowerCase() == apellido && cliente.name.toLocaleLowerCase() == nombre)

    // Si no encuentra coincidencias devuelve un mensaje de error
    if (filtroClientes.length == 0) {
        return res.status(404).send("Cliente no encontrado")
    }

    // Devolvemos los datos filtrados
    res.json(filtroClientes);

})

// Filtrar por la marca : qué productos se han comprado de una marca en concreto
// api/marca/:marca
app.get("/api/marca/:marca", (req, res) => {
    const marca = req.params.marca.toLocaleLowerCase()      
    // console.log(marca);
    const filtroMarca = datos.flatMap(cliente => cliente.compras.filter(compra => compra.marca.toLocaleLowerCase() == marca))

    if (filtroMarca.length == 0) {
        return res.status(404).send(`No se ha realizado ninguna compra de la marca ${marca} en ningún cliente.`)
    }
    res.json(filtroMarca);
})

// Cargar la página 404 de error
// app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "../public/404.html")) );
app.use((req, res) => res.status(404).sendFile(path.join(__dirname, "../public", "404.html")) );

// Poner el puesto en escucha
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));



