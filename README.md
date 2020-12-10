## API REST - GESTOR DE GASTOS (NODE JS)
Es una api rest echa con node js corriendo en un servidor express y consume datos de SQL server el script tambien se encuentra en una de las carpetas del proyecto ,su principal funcion es gestinar los gastos diarios clasificados por categorias que cuenta con seguridad mediante token y contraseñas de los 

### DEPENDENCIAS

- bcrypt 5.0.0
- cord 1.0.0
- dotenv 8.2.0
- express  4.17.1
- jsonwebtoken 8.5.1
- mssql 6.2.3

###INSTALACION 

###### ASEGURARSE DE TENER INTALADO NODE JS EN SU PC

Clone el repositorio en su pc

`$ git clone https://github.com/javier1905/GESTOR_GASTOS_NODE.git `

instale todas las dependecias con el comando

`$npm i`

ejecute el script de la base de datos en su motor de SQL server que se encuentra en 

`$ ./SRC/SCRIPT_SQL/scriptPresupuestosPersonales.sql`

cambia los datos de la cade de conexion a la base de datos que se encuentran en el archivo .env por la suya

USESQL =  user_sql
PWSQL = password_sql
DBSQL = name_database
SERVERSQL = name_server
PORTSQL = port_(1433)

y por ultimo ejecute el comando para ejecutarlo en modo desarrollo

`$ npm run dev `

corre en el puerto 5000

y para ejecutarlo en modo produccion

`$ npm run preDeploy`

y

`$npm start`

##FUNCIONAMIENTO

en la unicas rutas que no te va a pedir el token son:

    <
        http://localhost:5000/api/login (para loguearse)
		http://localhost:5000/api/signup (para registrar un nuevo usuario)
    >
	
en el resto de las rutas si o si hay qe enviar el toquen en el header con el formato:

![](https://res.cloudinary.com/dilbxcsyo/image/upload/v1607639694/ejemploToken_ely2nd.png)
