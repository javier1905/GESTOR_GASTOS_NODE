/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./index.js");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./SRC/CONECTIONDB/Sql.js":
/*!********************************!*\
  !*** ./SRC/CONECTIONDB/Sql.js ***!
  \********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const mssql = __webpack_require__(/*! mssql */ "mssql");

module.exports = class Sql {
  constructor(userSQL, pwSQL, dbSQL, serverSQL, portSQL) {
    this.uri = {
      user: userSQL,
      password: pwSQL,
      database: dbSQL,
      server: serverSQL,
      port: parseInt(portSQL),
      options: {
        enableArithAbort: true,
        encrypt: false
      },
      connectionTimeOut: 150000,
      driver: 'tedious',
      stream: false,
      pool: {
        max: 20,
        min: 0,
        idleTimeoutMillis: 30000
      }
    };
    this.conexiones = {};
  }

  async openConnection(name) {
    if (!Object.prototype.hasOwnProperty.call(this.conexiones, name)) {
      const newConexion = new mssql.ConnectionPool(this.uri);
      const close = newConexion.close.bind(newConexion);

      newConexion.close = (...args) => {
        delete this.conexiones[name];
        return close(...args);
      };

      await newConexion.connect();
      this.conexiones[name] = newConexion;
      return this.conexiones[name];
    }
  }

  closeConnection() {
    return Promise.all(Object.values(this.conexiones).map(pool => {
      return pool.close();
    }));
  }

};

/***/ }),

/***/ "./SRC/ROUTER/categorias.js":
/*!**********************************!*\
  !*** ./SRC/ROUTER/categorias.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  Router
} = __webpack_require__(/*! express */ "express");

const {
  Request,
  VarChar,
  Int
} = __webpack_require__(/*! mssql */ "mssql");

const Sql = __webpack_require__(/*! ../CONECTIONDB/Sql */ "./SRC/CONECTIONDB/Sql.js");

const {
  cadenaConexion
} = __webpack_require__(/*! ../../config */ "./config.js");

const {
  userSQL,
  pwSQL,
  dbSQL,
  serverSQL,
  portSQL
} = cadenaConexion;
const router = Router();
router.post('/list', async (req, res) => {
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);
  const {
    idUsuario
  } = req.body;

  try {
    const connection = await sql.openConnection('listCategorias');
    const myRequest = new Request(connection);
    myRequest.input('idUsuario', Int, idUsuario);
    const result = await myRequest.execute('pa_listaCategorias');

    if (result) {
      sql.closeConnection();
      res.json({
        listCategorias: result.recordset,
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
router.post('/save', async (req, res) => {
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);
  const {
    descripcionCategoria,
    idUsuario
  } = req.body;
  console.log(descripcionCategoria, idUsuario);
  if (descripcionCategoria === undefined || descripcionCategoria === '') return res.json({
    message: 'La descripcion de la categoria es requerida',
    opOK: false
  });

  try {
    const connection = await sql.openConnection('saveCategoria');
    const myRequest = new Request(connection);
    myRequest.input('idUsuario', Int, idUsuario);
    myRequest.input('descripcionCategoria', VarChar, descripcionCategoria);
    const result = await myRequest.execute('pa_guardarCategoria');

    if (result) {
      sql.closeConnection();
      res.json({
        message: 'Categoria guardada exitosamente',
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
router.put('/update', async (req, res) => {
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);
  const {
    idCategoria,
    descripcionCategoria
  } = req.body;
  if (descripcionCategoria === undefined || descripcionCategoria === '' || idCategoria === undefined || idCategoria === '') return res.json({
    message: 'El id y la descripcion de la categoria son requeridas',
    opOK: false
  });

  try {
    const connection = await sql.openConnection('updateCategoria');
    const myRequest = new Request(connection);
    myRequest.input('idCategoria', Int, idCategoria);
    myRequest.input('descripcionCategoria', VarChar, descripcionCategoria);
    const result = await myRequest.execute('pa_actualizarCategoria');

    if (result) {
      sql.closeConnection();
      if (result.rowsAffected[0] === 0) res.json({
        message: `No se encontro ninguna categoria con el id ${idCategoria}`,
        opOK: false
      });else res.json({
        message: 'Categoria actualizada exitosamente',
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
router.put('/delete', async (req, res) => {
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);
  const {
    idCategoria
  } = req.body;
  if (idCategoria === undefined || idCategoria === '') return res.json({
    message: 'El id de la categoria es requerida',
    opOK: false
  });

  try {
    const connection = await sql.openConnection('deleteCategoria');
    const myRequest = new Request(connection);
    myRequest.input('idCategoria', Int, idCategoria);
    const result = await myRequest.execute('pa_eliminaCategoria');

    if (result) {
      sql.closeConnection();
      if (result.rowsAffected[0] === 0) res.json({
        message: `No se encontro ninguna categoria con el id ${idCategoria}`,
        opOK: false
      });else res.json({
        message: 'Categoria eliminada exitosamente',
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
module.exports = router;

/***/ }),

/***/ "./SRC/ROUTER/checkLogin.js":
/*!**********************************!*\
  !*** ./SRC/ROUTER/checkLogin.js ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const jwt = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");

const {
  secret
} = __webpack_require__(/*! ../../config */ "./config.js");

module.exports = function (req, res, next) {
  if (req.path === '/api/login' || req.path === '/api/signup') return next();
  if (!req.headers.authorization) return res.json({
    message: 'Envie el token en el headers',
    logOK: false
  });
  const token = String(req.headers.authorization).split(' ')[1];
  jwt.verify(token, secret, error => {
    if (error) return res.json({
      message: 'Error token invalido',
      logOK: false
    });else return next();
  });
};

/***/ }),

/***/ "./SRC/ROUTER/getUserLogin.js":
/*!************************************!*\
  !*** ./SRC/ROUTER/getUserLogin.js ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  Router
} = __webpack_require__(/*! express */ "express");

const jwt = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");

const {
  secret
} = __webpack_require__(/*! ../../config */ "./config.js");

const router = Router();
router.get('/', (req, res) => {
  const token = String(req.headers.authorization).split(' ')[1];
  jwt.verify(token, secret, (error, usuario) => {
    if (error) res.json({
      message: error.message,
      logOK: false
    });else res.json({
      usuario,
      logOK: true
    });
  });
});
module.exports = router;

/***/ }),

/***/ "./SRC/ROUTER/login.js":
/*!*****************************!*\
  !*** ./SRC/ROUTER/login.js ***!
  \*****************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  Router
} = __webpack_require__(/*! express */ "express");

const jwt = __webpack_require__(/*! jsonwebtoken */ "jsonwebtoken");

const bcrypt = __webpack_require__(/*! bcrypt */ "bcrypt");

const Sql = __webpack_require__(/*! ../CONECTIONDB/Sql */ "./SRC/CONECTIONDB/Sql.js");

const {
  cadenaConexion
} = __webpack_require__(/*! ../../config */ "./config.js");

const {
  secret
} = __webpack_require__(/*! ../../config */ "./config.js");

const router = Router();
router.post('/', async (req, res) => {
  const {
    emailUsuario,
    pwUsuario
  } = req.body;
  if (emailUsuario === undefined || pwUsuario === undefined || emailUsuario === '' || pwUsuario === '') return res.json({
    message: 'Email y password son obligatorios'
  });
  const {
    userSQL,
    pwSQL,
    dbSQL,
    serverSQL,
    portSQL
  } = cadenaConexion;
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);

  try {
    const {
      Request,
      VarChar
    } = __webpack_require__(/*! mssql */ "mssql");

    const connection = await sql.openConnection('');
    const myRequest = new Request(connection);
    myRequest.input('emailUsuario', VarChar, emailUsuario);
    const result = await myRequest.execute('pa_login');

    if (result) {
      sql.closeConnection();
      if (result.rowsAffected[0] === 0) return res.json({
        message: 'Usuario Inexitente',
        logOK: false
      });
      const pwEncriptada = result.recordset[0].pwUsuario;
      if (!bcrypt.compareSync(pwUsuario, pwEncriptada)) return res.json({
        message: 'Pw incorrecta',
        logOK: false
      });
      const usuario = {
        idUsuario: result.recordset[0].idUsuario,
        emailUsuario: result.recordset[0].emailUsuario
      };
      jwt.sign(usuario, secret, {
        expiresIn: '0.5h'
      }, (err, token) => {
        if (err) res.json({
          message: err.message,
          logOK: false
        });else res.json({
          message: 'Log exitoso',
          logOK: true,
          token: token
        });
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      logOK: false
    });
  }
});
module.exports = router;

/***/ }),

/***/ "./SRC/ROUTER/operaciones.js":
/*!***********************************!*\
  !*** ./SRC/ROUTER/operaciones.js ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  Router
} = __webpack_require__(/*! express */ "express");

const mssql = __webpack_require__(/*! mssql */ "mssql");

const Sql = __webpack_require__(/*! ../CONECTIONDB/Sql */ "./SRC/CONECTIONDB/Sql.js");

const {
  cadenaConexion
} = __webpack_require__(/*! ../../config */ "./config.js");

const {
  userSQL,
  pwSQL,
  dbSQL,
  serverSQL,
  portSQL
} = cadenaConexion;
const router = Router();
router.post('/list', async (req, res) => {
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);
  const {
    idUsuario
  } = req.body;
  if (idUsuario === undefined || idUsuario === '') return res.json({
    message: 'El id el usuario es requerido',
    opOK: false
  });

  try {
    const connection = await sql.openConnection('listOperaciones');
    const myRequest = new mssql.Request(connection);
    myRequest.input('idUsuario', mssql.Int, idUsuario);
    const result = await myRequest.execute('pa_listaOperaciones');

    if (result) {
      sql.closeConnection();
      res.json({
        listOperaciones: result.recordset,
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
router.post('/save', async (req, res) => {
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);
  const {
    conceptoOperacion,
    montoOperacion,
    fechaOperacion,
    tipoOperacion,
    idUsuario,
    idCategoria
  } = req.body;

  try {
    const connection = await sql.openConnection('saveOperacion');
    const myRequest = new mssql.Request(connection);
    myRequest.input('conceptoOperacion', mssql.VarChar, conceptoOperacion);
    myRequest.input('montoOperacion', mssql.Real, montoOperacion);
    myRequest.input('fechaOperacion', mssql.Date, fechaOperacion);
    myRequest.input('tipoOperacion', mssql.Bit, tipoOperacion);
    myRequest.input('idUsuario', mssql.Int, idUsuario);
    myRequest.input('idCategoria', mssql.Int, idCategoria);
    const result = await myRequest.execute('pa_guardarOperacion');

    if (result) {
      sql.closeConnection();
      res.json({
        message: 'Operacion guardada exitosamente',
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
router.put('/update', async (req, res) => {
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);
  const {
    idOperacion,
    conceptoOperacion,
    montoOperacion,
    fechaOperacion,
    idCategoria
  } = req.body;

  try {
    const connection = await sql.openConnection('updateOperacion');
    const myRequest = new mssql.Request(connection);
    myRequest.input('idOperacion', mssql.Int, idOperacion);
    myRequest.input('conceptoOperacion', mssql.VarChar, conceptoOperacion);
    myRequest.input('montoOperacion', mssql.Real, montoOperacion);
    myRequest.input('fechaOperacion', mssql.Date, fechaOperacion);
    myRequest.input('idCategoria', mssql.Int, idCategoria);
    const result = await myRequest.execute('pa_actualizarOperacion');

    if (result) {
      sql.closeConnection();
      if (result.rowsAffected[0] === 0) res.json({
        message: `No se encontro ninguna operacion con el id ${idOperacion}`,
        opOK: false
      });else res.json({
        message: 'Operacion actualizada exitosamente',
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
router.put('/delete', async (req, res) => {
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);
  const {
    idOperacion
  } = req.body;
  if (idOperacion === undefined || idOperacion === '') return res.json({
    message: 'El id de la operacion es requerida',
    opOK: false
  });

  try {
    const connection = await sql.openConnection('deleteOperacion');
    const myRequest = new mssql.Request(connection);
    myRequest.input('idOperacion', mssql.Int, idOperacion);
    const result = await myRequest.execute('pa_eliminaOperacion');

    if (result) {
      sql.closeConnection();
      if (result.rowsAffected[0] === 0) res.json({
        message: `No se encontro ninguna operacion con el id ${idOperacion}`,
        opOK: false
      });else res.json({
        message: 'Operacion eliminada exitosamente',
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
module.exports = router;

/***/ }),

/***/ "./SRC/ROUTER/signup.js":
/*!******************************!*\
  !*** ./SRC/ROUTER/signup.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const {
  Router
} = __webpack_require__(/*! express */ "express");

const bcript = __webpack_require__(/*! bcrypt */ "bcrypt");

const {
  Request,
  VarChar
} = __webpack_require__(/*! mssql */ "mssql");

const Sql = __webpack_require__(/*! ../CONECTIONDB/Sql */ "./SRC/CONECTIONDB/Sql.js");

const {
  cadenaConexion
} = __webpack_require__(/*! ../../config */ "./config.js");

const router = Router();
const {
  userSQL,
  pwSQL,
  dbSQL,
  serverSQL,
  portSQL
} = cadenaConexion;
router.post('/', async (req, res) => {
  const {
    emailUsuario,
    pwUsuario
  } = req.body;
  const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL);

  if (emailUsuario === undefined || pwUsuario === undefined || emailUsuario === '' || pwUsuario === '') {
    res.json({
      message: 'Asegurese de enviar el email y la password',
      opOK: false
    });
    return;
  }

  try {
    const connection = await sql.openConnection('saveUser');
    const myReques = new Request(connection);
    myReques.input('emailUsuario', VarChar, emailUsuario);
    const pwEncriptada = bcript.hashSync(pwUsuario, 10);
    myReques.input('pwUsuario', VarChar, pwEncriptada);
    const result = await myReques.execute('pa_insertUsuario');

    if (result) {
      sql.closeConnection();
      res.json({
        message: 'Successful operation',
        opOK: true
      });
    }
  } catch (error) {
    sql.closeConnection();
    res.json({
      message: error.message,
      opOK: false
    });
  }
});
module.exports = router;

/***/ }),

/***/ "./SRC/SERVER/server.js":
/*!******************************!*\
  !*** ./SRC/SERVER/server.js ***!
  \******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const express = __webpack_require__(/*! express */ "express");

const cors = __webpack_require__(/*! cors */ "cors");

const morgan = __webpack_require__(/*! morgan */ "morgan");

const dotenv = __webpack_require__(/*! dotenv */ "dotenv");

module.exports = class Server {
  constructor(port) {
    dotenv.config();
    this.port = process.env.PORT || port;
    this.server = express();
  }

  midelware() {
    this.server.use(cors());
    this.server.use(express.json());
    this.server.use(morgan('dev'));
    this.server.use(express.urlencoded({
      extended: false
    }));
    this.server.use(__webpack_require__(/*! ../ROUTER/checkLogin */ "./SRC/ROUTER/checkLogin.js"));
  }

  router() {
    this.server.use('/api/signup', __webpack_require__(/*! ../ROUTER/signup */ "./SRC/ROUTER/signup.js"));
    this.server.use('/api/login', __webpack_require__(/*! ../ROUTER/login */ "./SRC/ROUTER/login.js"));
    this.server.use('/api/getuserlogin', __webpack_require__(/*! ../ROUTER/getUserLogin */ "./SRC/ROUTER/getUserLogin.js"));
    this.server.use('/api/category', __webpack_require__(/*! ../ROUTER/categorias */ "./SRC/ROUTER/categorias.js"));
    this.server.use('/api/operation', __webpack_require__(/*! ../ROUTER/operaciones */ "./SRC/ROUTER/operaciones.js"));
  }

  execute() {
    this.midelware();
    this.router();
    this.server.listen(this.port, e => console.log(`server corriendo en el puerto ${this.port}`));
  }

};

/***/ }),

/***/ "./config.js":
/*!*******************!*\
  !*** ./config.js ***!
  \*******************/
/*! no static exports found */
/***/ (function(module, exports) {

const cadenaConexion = {
  userSQL: process.env.USESQL,
  pwSQL: process.env.PWSQL,
  dbSQL: process.env.DBSQL,
  serverSQL: process.env.SERVERSQL,
  portSQL: process.env.PORTSQL
};
const secret = 'abc123.';
module.exports = {
  cadenaConexion,
  secret
};

/***/ }),

/***/ "./index.js":
/*!******************!*\
  !*** ./index.js ***!
  \******************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

const Server = __webpack_require__(/*! ./SRC/SERVER/server */ "./SRC/SERVER/server.js");

const server = new Server(5000);
server.execute();

/***/ }),

/***/ "bcrypt":
/*!*************************!*\
  !*** external "bcrypt" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("bcrypt");

/***/ }),

/***/ "cors":
/*!***********************!*\
  !*** external "cors" ***!
  \***********************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("cors");

/***/ }),

/***/ "dotenv":
/*!*************************!*\
  !*** external "dotenv" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("dotenv");

/***/ }),

/***/ "express":
/*!**************************!*\
  !*** external "express" ***!
  \**************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("express");

/***/ }),

/***/ "jsonwebtoken":
/*!*******************************!*\
  !*** external "jsonwebtoken" ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("jsonwebtoken");

/***/ }),

/***/ "morgan":
/*!*************************!*\
  !*** external "morgan" ***!
  \*************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("morgan");

/***/ }),

/***/ "mssql":
/*!************************!*\
  !*** external "mssql" ***!
  \************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = require("mssql");

/***/ })

/******/ });
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vU1JDL0NPTkVDVElPTkRCL1NxbC5qcyIsIndlYnBhY2s6Ly8vLi9TUkMvUk9VVEVSL2NhdGVnb3JpYXMuanMiLCJ3ZWJwYWNrOi8vLy4vU1JDL1JPVVRFUi9jaGVja0xvZ2luLmpzIiwid2VicGFjazovLy8uL1NSQy9ST1VURVIvZ2V0VXNlckxvZ2luLmpzIiwid2VicGFjazovLy8uL1NSQy9ST1VURVIvbG9naW4uanMiLCJ3ZWJwYWNrOi8vLy4vU1JDL1JPVVRFUi9vcGVyYWNpb25lcy5qcyIsIndlYnBhY2s6Ly8vLi9TUkMvUk9VVEVSL3NpZ251cC5qcyIsIndlYnBhY2s6Ly8vLi9TUkMvU0VSVkVSL3NlcnZlci5qcyIsIndlYnBhY2s6Ly8vLi9jb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYmNyeXB0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiY29yc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImRvdGVudlwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqc29ud2VidG9rZW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtb3JnYW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtc3NxbFwiIl0sIm5hbWVzIjpbIm1zc3FsIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJTcWwiLCJjb25zdHJ1Y3RvciIsInVzZXJTUUwiLCJwd1NRTCIsImRiU1FMIiwic2VydmVyU1FMIiwicG9ydFNRTCIsInVyaSIsInVzZXIiLCJwYXNzd29yZCIsImRhdGFiYXNlIiwic2VydmVyIiwicG9ydCIsInBhcnNlSW50Iiwib3B0aW9ucyIsImVuYWJsZUFyaXRoQWJvcnQiLCJlbmNyeXB0IiwiY29ubmVjdGlvblRpbWVPdXQiLCJkcml2ZXIiLCJzdHJlYW0iLCJwb29sIiwibWF4IiwibWluIiwiaWRsZVRpbWVvdXRNaWxsaXMiLCJjb25leGlvbmVzIiwib3BlbkNvbm5lY3Rpb24iLCJuYW1lIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwibmV3Q29uZXhpb24iLCJDb25uZWN0aW9uUG9vbCIsImNsb3NlIiwiYmluZCIsImFyZ3MiLCJjb25uZWN0IiwiY2xvc2VDb25uZWN0aW9uIiwiUHJvbWlzZSIsImFsbCIsInZhbHVlcyIsIm1hcCIsIlJvdXRlciIsIlJlcXVlc3QiLCJWYXJDaGFyIiwiSW50IiwiY2FkZW5hQ29uZXhpb24iLCJyb3V0ZXIiLCJwb3N0IiwicmVxIiwicmVzIiwic3FsIiwiaWRVc3VhcmlvIiwiYm9keSIsImNvbm5lY3Rpb24iLCJteVJlcXVlc3QiLCJpbnB1dCIsInJlc3VsdCIsImV4ZWN1dGUiLCJqc29uIiwibGlzdENhdGVnb3JpYXMiLCJyZWNvcmRzZXQiLCJvcE9LIiwiZXJyb3IiLCJtZXNzYWdlIiwiZGVzY3JpcGNpb25DYXRlZ29yaWEiLCJjb25zb2xlIiwibG9nIiwidW5kZWZpbmVkIiwicHV0IiwiaWRDYXRlZ29yaWEiLCJyb3dzQWZmZWN0ZWQiLCJqd3QiLCJzZWNyZXQiLCJuZXh0IiwicGF0aCIsImhlYWRlcnMiLCJhdXRob3JpemF0aW9uIiwibG9nT0siLCJ0b2tlbiIsIlN0cmluZyIsInNwbGl0IiwidmVyaWZ5IiwiZ2V0IiwidXN1YXJpbyIsImJjcnlwdCIsImVtYWlsVXN1YXJpbyIsInB3VXN1YXJpbyIsInB3RW5jcmlwdGFkYSIsImNvbXBhcmVTeW5jIiwic2lnbiIsImV4cGlyZXNJbiIsImVyciIsImxpc3RPcGVyYWNpb25lcyIsImNvbmNlcHRvT3BlcmFjaW9uIiwibW9udG9PcGVyYWNpb24iLCJmZWNoYU9wZXJhY2lvbiIsInRpcG9PcGVyYWNpb24iLCJSZWFsIiwiRGF0ZSIsIkJpdCIsImlkT3BlcmFjaW9uIiwiYmNyaXB0IiwibXlSZXF1ZXMiLCJoYXNoU3luYyIsImV4cHJlc3MiLCJjb3JzIiwibW9yZ2FuIiwiZG90ZW52IiwiU2VydmVyIiwiY29uZmlnIiwicHJvY2VzcyIsImVudiIsIlBPUlQiLCJtaWRlbHdhcmUiLCJ1c2UiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJsaXN0ZW4iLCJlIiwiVVNFU1FMIiwiUFdTUUwiLCJEQlNRTCIsIlNFUlZFUlNRTCIsIlBPUlRTUUwiXSwibWFwcGluZ3MiOiI7UUFBQTtRQUNBOztRQUVBO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7O1FBRUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTs7O1FBR0E7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBLDBDQUEwQyxnQ0FBZ0M7UUFDMUU7UUFDQTs7UUFFQTtRQUNBO1FBQ0E7UUFDQSx3REFBd0Qsa0JBQWtCO1FBQzFFO1FBQ0EsaURBQWlELGNBQWM7UUFDL0Q7O1FBRUE7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBLHlDQUF5QyxpQ0FBaUM7UUFDMUUsZ0hBQWdILG1CQUFtQixFQUFFO1FBQ3JJO1FBQ0E7O1FBRUE7UUFDQTtRQUNBO1FBQ0EsMkJBQTJCLDBCQUEwQixFQUFFO1FBQ3ZELGlDQUFpQyxlQUFlO1FBQ2hEO1FBQ0E7UUFDQTs7UUFFQTtRQUNBLHNEQUFzRCwrREFBK0Q7O1FBRXJIO1FBQ0E7OztRQUdBO1FBQ0E7Ozs7Ozs7Ozs7OztBQ2xGQSxNQUFNQSxLQUFLLEdBQUdDLG1CQUFPLENBQUMsb0JBQUQsQ0FBckI7O0FBRUFDLE1BQU0sQ0FBQ0MsT0FBUCxHQUFpQixNQUFNQyxHQUFOLENBQVU7QUFDMUJDLGFBQVcsQ0FBQ0MsT0FBRCxFQUFVQyxLQUFWLEVBQWlCQyxLQUFqQixFQUF3QkMsU0FBeEIsRUFBbUNDLE9BQW5DLEVBQTRDO0FBQ3RELFNBQUtDLEdBQUwsR0FBVztBQUNWQyxVQUFJLEVBQUVOLE9BREk7QUFFVk8sY0FBUSxF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ZjtBQUVBM0UsTUFBTSxDQUFDQyxPQUFQLEdBQWlCO0FBQ2hCK0MsZ0JBRGdCO0FBRWhCMkI7QUFGZ0IsQ0FBakIsQzs7Ozs7Ozs7Ozs7QUNWQSxNQUFNb0MsTUFBTSxHQUFHaEgsbUJBQU8sQ0FBQyxtREFBRCxDQUF0Qjs7QUFFQSxNQUFNYyxNQUFNLEdBQUcsSUFBSWtHLE1BQUosQ0FBVyxJQUFYLENBQWY7QUFFQWxHLE1BQU0sQ0FBQytDLE9BQVAsRzs7Ozs7Ozs7Ozs7QUNKQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxpQzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxvQzs7Ozs7Ozs7Ozs7QUNBQSx5Qzs7Ozs7Ozs7Ozs7QUNBQSxtQzs7Ozs7Ozs7Ozs7QUNBQSxrQyIsImZpbGUiOiJidW5kbGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyIgXHQvLyBUaGUgbW9kdWxlIGNhY2hlXG4gXHR2YXIgaW5zdGFsbGVkTW9kdWxlcyA9IHt9O1xuXG4gXHQvLyBUaGUgcmVxdWlyZSBmdW5jdGlvblxuIFx0ZnVuY3Rpb24gX193ZWJwYWNrX3JlcXVpcmVfXyhtb2R1bGVJZCkge1xuXG4gXHRcdC8vIENoZWNrIGlmIG1vZHVsZSBpcyBpbiBjYWNoZVxuIFx0XHRpZihpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSkge1xuIFx0XHRcdHJldHVybiBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXS5leHBvcnRzO1xuIFx0XHR9XG4gXHRcdC8vIENyZWF0ZSBhIG5ldyBtb2R1bGUgKGFuZCBwdXQgaXQgaW50byB0aGUgY2FjaGUpXG4gXHRcdHZhciBtb2R1bGUgPSBpbnN0YWxsZWRNb2R1bGVzW21vZHVsZUlkXSA9IHtcbiBcdFx0XHRpOiBtb2R1bGVJZCxcbiBcdFx0XHRsOiBmYWxzZSxcbiBcdFx0XHRleHBvcnRzOiB7fVxuIFx0XHR9O1xuXG4gXHRcdC8vIEV4ZWN1dGUgdGhlIG1vZHVsZSBmdW5jdGlvblxuIFx0XHRtb2R1bGVzW21vZHVsZUlkXS5jYWxsKG1vZHVsZS5leHBvcnRzLCBtb2R1bGUsIG1vZHVsZS5leHBvcnRzLCBfX3dlYnBhY2tfcmVxdWlyZV9fKTtcblxuIFx0XHQvLyBGbGFnIHRoZSBtb2R1bGUgYXMgbG9hZGVkXG4gXHRcdG1vZHVsZS5sID0gdHJ1ZTtcblxuIFx0XHQvLyBSZXR1cm4gdGhlIGV4cG9ydHMgb2YgdGhlIG1vZHVsZVxuIFx0XHRyZXR1cm4gbW9kdWxlLmV4cG9ydHM7XG4gXHR9XG5cblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGVzIG9iamVjdCAoX193ZWJwYWNrX21vZHVsZXNfXylcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubSA9IG1vZHVsZXM7XG5cbiBcdC8vIGV4cG9zZSB0aGUgbW9kdWxlIGNhY2hlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLmMgPSBpbnN0YWxsZWRNb2R1bGVzO1xuXG4gXHQvLyBkZWZpbmUgZ2V0dGVyIGZ1bmN0aW9uIGZvciBoYXJtb255IGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uZCA9IGZ1bmN0aW9uKGV4cG9ydHMsIG5hbWUsIGdldHRlcikge1xuIFx0XHRpZighX193ZWJwYWNrX3JlcXVpcmVfXy5vKGV4cG9ydHMsIG5hbWUpKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIG5hbWUsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBnZXR0ZXIgfSk7XG4gXHRcdH1cbiBcdH07XG5cbiBcdC8vIGRlZmluZSBfX2VzTW9kdWxlIG9uIGV4cG9ydHNcbiBcdF9fd2VicGFja19yZXF1aXJlX18uciA9IGZ1bmN0aW9uKGV4cG9ydHMpIHtcbiBcdFx0aWYodHlwZW9mIFN5bWJvbCAhPT0gJ3VuZGVmaW5lZCcgJiYgU3ltYm9sLnRvU3RyaW5nVGFnKSB7XG4gXHRcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsIFN5bWJvbC50b1N0cmluZ1RhZywgeyB2YWx1ZTogJ01vZHVsZScgfSk7XG4gXHRcdH1cbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbiBcdH07XG5cbiBcdC8vIGNyZWF0ZSBhIGZha2UgbmFtZXNwYWNlIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDE6IHZhbHVlIGlzIGEgbW9kdWxlIGlkLCByZXF1aXJlIGl0XG4gXHQvLyBtb2RlICYgMjogbWVyZ2UgYWxsIHByb3BlcnRpZXMgb2YgdmFsdWUgaW50byB0aGUgbnNcbiBcdC8vIG1vZGUgJiA0OiByZXR1cm4gdmFsdWUgd2hlbiBhbHJlYWR5IG5zIG9iamVjdFxuIFx0Ly8gbW9kZSAmIDh8MTogYmVoYXZlIGxpa2UgcmVxdWlyZVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy50ID0gZnVuY3Rpb24odmFsdWUsIG1vZGUpIHtcbiBcdFx0aWYobW9kZSAmIDEpIHZhbHVlID0gX193ZWJwYWNrX3JlcXVpcmVfXyh2YWx1ZSk7XG4gXHRcdGlmKG1vZGUgJiA4KSByZXR1cm4gdmFsdWU7XG4gXHRcdGlmKChtb2RlICYgNCkgJiYgdHlwZW9mIHZhbHVlID09PSAnb2JqZWN0JyAmJiB2YWx1ZSAmJiB2YWx1ZS5fX2VzTW9kdWxlKSByZXR1cm4gdmFsdWU7XG4gXHRcdHZhciBucyA9IE9iamVjdC5jcmVhdGUobnVsbCk7XG4gXHRcdF9fd2VicGFja19yZXF1aXJlX18ucihucyk7XG4gXHRcdE9iamVjdC5kZWZpbmVQcm9wZXJ0eShucywgJ2RlZmF1bHQnLCB7IGVudW1lcmFibGU6IHRydWUsIHZhbHVlOiB2YWx1ZSB9KTtcbiBcdFx0aWYobW9kZSAmIDIgJiYgdHlwZW9mIHZhbHVlICE9ICdzdHJpbmcnKSBmb3IodmFyIGtleSBpbiB2YWx1ZSkgX193ZWJwYWNrX3JlcXVpcmVfXy5kKG5zLCBrZXksIGZ1bmN0aW9uKGtleSkgeyByZXR1cm4gdmFsdWVba2V5XTsgfS5iaW5kKG51bGwsIGtleSkpO1xuIFx0XHRyZXR1cm4gbnM7XG4gXHR9O1xuXG4gXHQvLyBnZXREZWZhdWx0RXhwb3J0IGZ1bmN0aW9uIGZvciBjb21wYXRpYmlsaXR5IHdpdGggbm9uLWhhcm1vbnkgbW9kdWxlc1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5uID0gZnVuY3Rpb24obW9kdWxlKSB7XG4gXHRcdHZhciBnZXR0ZXIgPSBtb2R1bGUgJiYgbW9kdWxlLl9fZXNNb2R1bGUgP1xuIFx0XHRcdGZ1bmN0aW9uIGdldERlZmF1bHQoKSB7IHJldHVybiBtb2R1bGVbJ2RlZmF1bHQnXTsgfSA6XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0TW9kdWxlRXhwb3J0cygpIHsgcmV0dXJuIG1vZHVsZTsgfTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kKGdldHRlciwgJ2EnLCBnZXR0ZXIpO1xuIFx0XHRyZXR1cm4gZ2V0dGVyO1xuIFx0fTtcblxuIFx0Ly8gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm8gPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5KSB7IHJldHVybiBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwob2JqZWN0LCBwcm9wZXJ0eSk7IH07XG5cbiBcdC8vIF9fd2VicGFja19wdWJsaWNfcGF0aF9fXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnAgPSBcIlwiO1xuXG5cbiBcdC8vIExvYWQgZW50cnkgbW9kdWxlIGFuZCByZXR1cm4gZXhwb3J0c1xuIFx0cmV0dXJuIF9fd2VicGFja19yZXF1aXJlX18oX193ZWJwYWNrX3JlcXVpcmVfXy5zID0gXCIuL2luZGV4LmpzXCIpO1xuIiwiY29uc3QgbXNzcWwgPSByZXF1aXJlKCdtc3NxbCcpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNxbCB7XHJcblx0Y29uc3RydWN0b3IodXNlclNRTCwgcHdTUUwsIGRiU1FMLCBzZXJ2ZXJTUUwsIHBvcnRTUUwpIHtcclxuXHRcdHRoaXMudXJpID0ge1xyXG5cdFx0XHR1c2VyOiB1c2VyU1FMLFxyXG5cdFx0XHRwYXNzd29yZDogcHdTUUwsXHJcblx0XHRcdGRhdGFiYXNlOiBkYlNRTCxcclxuXHRcdFx0c2VydmVyOiBzZXJ2ZXJTUUwsXHJcblx0XHRcdHBvcnQ6IHBhcnNlSW50KHBvcnRTUUwpLFxyXG5cdFx0XHRvcHRpb25zOiB7XHJcblx0XHRcdFx0ZW5hYmxlQXJpdGhBYm9ydDogdHJ1ZSxcclxuXHRcdFx0XHRlbmNyeXB0OiBmYWxzZSxcclxuXHRcdFx0fSxcclxuXHRcdFx0Y29ubmVjdGlvblRpbWVPdXQ6IDE1MDAwMCxcclxuXHRcdFx0ZHJpdmVyOiAndGVkaW91cycsXHJcblx0XHRcdHN0cmVhbTogZmFsc2UsXHJcblx0XHRcdHBvb2w6IHtcclxuXHRcdFx0XHRtYXg6IDIwLFxyXG5cdFx0XHRcdG1pbjogMCxcclxuXHRcdFx0XHRpZGxlVGltZW91dE1pbGxpczogMzAwMDAsXHJcblx0XHRcdH0sXHJcblx0XHR9XHJcblx0XHR0aGlzLmNvbmV4aW9uZXMgPSB7fVxyXG5cdH1cclxuXHJcblx0YXN5bmMgb3BlbkNvbm5lY3Rpb24obmFtZSkge1xyXG5cdFx0aWYgKCFPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGwodGhpcy5jb25leGlvbmVzLCBuYW1lKSkge1xyXG5cdFx0XHRjb25zdCBuZXdDb25leGlvbiA9IG5ldyBtc3NxbC5Db25uZWN0aW9uUG9vbCh0aGlzLnVyaSlcclxuXHRcdFx0Y29uc3QgY2xvc2UgPSBuZXdDb25leGlvbi5jbG9zZS5iaW5kKG5ld0NvbmV4aW9uKVxyXG5cdFx0XHRuZXdDb25leGlvbi5jbG9zZSA9ICguLi5hcmdzKSA9PiB7XHJcblx0XHRcdFx0ZGVsZXRlIHRoaXMuY29uZXhpb25lc1tuYW1lXVxyXG5cdFx0XHRcdHJldHVybiBjbG9zZSguLi5hcmdzKVxyXG5cdFx0XHR9XHJcblx0XHRcdGF3YWl0IG5ld0NvbmV4aW9uLmNvbm5lY3QoKVxyXG5cdFx0XHR0aGlzLmNvbmV4aW9uZXNbbmFtZV0gPSBuZXdDb25leGlvblxyXG5cdFx0XHRyZXR1cm4gdGhpcy5jb25leGlvbmVzW25hbWVdXHJcblx0XHR9XHJcblx0fVxyXG5cclxuXHRjbG9zZUNvbm5lY3Rpb24oKSB7XHJcblx0XHRyZXR1cm4gUHJvbWlzZS5hbGwoXHJcblx0XHRcdE9iamVjdC52YWx1ZXModGhpcy5jb25leGlvbmVzKS5tYXAocG9vbCA9PiB7XHJcblx0XHRcdFx0cmV0dXJuIHBvb2wuY2xvc2UoKVxyXG5cdFx0XHR9KVxyXG5cdFx0KVxyXG5cdH1cclxufVxyXG4iLCJjb25zdCB7IFJvdXRlciB9ID0gcmVxdWlyZSgnZXhwcmVzcycpXHJcbmNvbnN0IHsgUmVxdWVzdCwgVmFyQ2hhciwgSW50IH0gPSByZXF1aXJlKCdtc3NxbCcpXHJcblxyXG5jb25zdCBTcWwgPSByZXF1aXJlKCcuLi9DT05FQ1RJT05EQi9TcWwnKVxyXG5jb25zdCB7IGNhZGVuYUNvbmV4aW9uIH0gPSByZXF1aXJlKCcuLi8uLi9jb25maWcnKVxyXG5jb25zdCB7IHVzZXJTUUwsIHB3U1FMLCBkYlNRTCwgc2VydmVyU1FMLCBwb3J0U1FMIH0gPSBjYWRlbmFDb25leGlvblxyXG5cclxuY29uc3Qgcm91dGVyID0gUm91dGVyKClcclxuXHJcbnJvdXRlci5wb3N0KCcvbGlzdCcsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG5cdGNvbnN0IHNxbCA9IG5ldyBTcWwodXNlclNRTCwgcHdTUUwsIGRiU1FMLCBzZXJ2ZXJTUUwsIHBvcnRTUUwpXHJcblx0Y29uc3QgeyBpZFVzdWFyaW8gfSA9IHJlcS5ib2R5XHJcblx0dHJ5IHtcclxuXHRcdGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBzcWwub3BlbkNvbm5lY3Rpb24oJ2xpc3RDYXRlZ29yaWFzJylcclxuXHRcdGNvbnN0IG15UmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGNvbm5lY3Rpb24pXHJcblxyXG5cdFx0bXlSZXF1ZXN0LmlucHV0KCdpZFVzdWFyaW8nLCBJbnQsIGlkVXN1YXJpbylcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG15UmVxdWVzdC5leGVjdXRlKCdwYV9saXN0YUNhdGVnb3JpYXMnKVxyXG5cdFx0aWYgKHJlc3VsdCkge1xyXG5cdFx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdFx0cmVzLmpzb24oeyBsaXN0Q2F0ZWdvcmlhczogcmVzdWx0LnJlY29yZHNldCwgb3BPSzogdHJ1ZSB9KVxyXG5cdFx0fVxyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdHJlcy5qc29uKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgb3BPSzogZmFsc2UgfSlcclxuXHR9XHJcbn0pXHJcblxyXG5yb3V0ZXIucG9zdCgnL3NhdmUnLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuXHRjb25zdCBzcWwgPSBuZXcgU3FsKHVzZXJTUUwsIHB3U1FMLCBkYlNRTCwgc2VydmVyU1FMLCBwb3J0U1FMKVxyXG5cdGNvbnN0IHsgZGVzY3JpcGNpb25DYXRlZ29yaWEsIGlkVXN1YXJpbyB9ID0gcmVxLmJvZHlcclxuXHJcblx0Y29uc29sZS5sb2coZGVzY3JpcGNpb25DYXRlZ29yaWEsIGlkVXN1YXJpbylcclxuXHJcblx0aWYgKGRlc2NyaXBjaW9uQ2F0ZWdvcmlhID09PSB1bmRlZmluZWQgfHwgZGVzY3JpcGNpb25DYXRlZ29yaWEgPT09ICcnKVxyXG5cdFx0cmV0dXJuIHJlcy5qc29uKHsgbWVzc2FnZTogJ0xhIGRlc2NyaXBjaW9uIGRlIGxhIGNhdGVnb3JpYSBlcyByZXF1ZXJpZGEnLCBvcE9LOiBmYWxzZSB9KVxyXG5cdHRyeSB7XHJcblx0XHRjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgc3FsLm9wZW5Db25uZWN0aW9uKCdzYXZlQ2F0ZWdvcmlhJylcclxuXHRcdGNvbnN0IG15UmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGNvbm5lY3Rpb24pXHJcblxyXG5cdFx0bXlSZXF1ZXN0LmlucHV0KCdpZFVzdWFyaW8nLCBJbnQsIGlkVXN1YXJpbylcclxuXHRcdG15UmVxdWVzdC5pbnB1dCgnZGVzY3JpcGNpb25DYXRlZ29yaWEnLCBWYXJDaGFyLCBkZXNjcmlwY2lvbkNhdGVnb3JpYSlcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG15UmVxdWVzdC5leGVjdXRlKCdwYV9ndWFyZGFyQ2F0ZWdvcmlhJylcclxuXHJcblx0XHRpZiAocmVzdWx0KSB7XHJcblx0XHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0XHRyZXMuanNvbih7IG1lc3NhZ2U6ICdDYXRlZ29yaWEgZ3VhcmRhZGEgZXhpdG9zYW1lbnRlJywgb3BPSzogdHJ1ZSB9KVxyXG5cdFx0fVxyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdHJlcy5qc29uKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgb3BPSzogZmFsc2UgfSlcclxuXHR9XHJcbn0pXHJcblxyXG5yb3V0ZXIucHV0KCcvdXBkYXRlJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcblx0Y29uc3Qgc3FsID0gbmV3IFNxbCh1c2VyU1FMLCBwd1NRTCwgZGJTUUwsIHNlcnZlclNRTCwgcG9ydFNRTClcclxuXHRjb25zdCB7IGlkQ2F0ZWdvcmlhLCBkZXNjcmlwY2lvbkNhdGVnb3JpYSB9ID0gcmVxLmJvZHlcclxuXHJcblx0aWYgKFxyXG5cdFx0ZGVzY3JpcGNpb25DYXRlZ29yaWEgPT09IHVuZGVmaW5lZCB8fFxyXG5cdFx0ZGVzY3JpcGNpb25DYXRlZ29yaWEgPT09ICcnIHx8XHJcblx0XHRpZENhdGVnb3JpYSA9PT0gdW5kZWZpbmVkIHx8XHJcblx0XHRpZENhdGVnb3JpYSA9PT0gJydcclxuXHQpXHJcblx0XHRyZXR1cm4gcmVzLmpzb24oe1xyXG5cdFx0XHRtZXNzYWdlOiAnRWwgaWQgeSBsYSBkZXNjcmlwY2lvbiBkZSBsYSBjYXRlZ29yaWEgc29uIHJlcXVlcmlkYXMnLFxyXG5cdFx0XHRvcE9LOiBmYWxzZSxcclxuXHRcdH0pXHJcblx0dHJ5IHtcclxuXHRcdGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBzcWwub3BlbkNvbm5lY3Rpb24oJ3VwZGF0ZUNhdGVnb3JpYScpXHJcblx0XHRjb25zdCBteVJlcXVlc3QgPSBuZXcgUmVxdWVzdChjb25uZWN0aW9uKVxyXG5cclxuXHRcdG15UmVxdWVzdC5pbnB1dCgnaWRDYXRlZ29yaWEnLCBJbnQsIGlkQ2F0ZWdvcmlhKVxyXG5cdFx0bXlSZXF1ZXN0LmlucHV0KCdkZXNjcmlwY2lvbkNhdGVnb3JpYScsIFZhckNoYXIsIGRlc2NyaXBjaW9uQ2F0ZWdvcmlhKVxyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgbXlSZXF1ZXN0LmV4ZWN1dGUoJ3BhX2FjdHVhbGl6YXJDYXRlZ29yaWEnKVxyXG5cclxuXHRcdGlmIChyZXN1bHQpIHtcclxuXHRcdFx0c3FsLmNsb3NlQ29ubmVjdGlvbigpXHJcblx0XHRcdGlmIChyZXN1bHQucm93c0FmZmVjdGVkWzBdID09PSAwKVxyXG5cdFx0XHRcdHJlcy5qc29uKHtcclxuXHRcdFx0XHRcdG1lc3NhZ2U6IGBObyBzZSBlbmNvbnRybyBuaW5ndW5hIGNhdGVnb3JpYSBjb24gZWwgaWQgJHtpZENhdGVnb3JpYX1gLFxyXG5cdFx0XHRcdFx0b3BPSzogZmFsc2UsXHJcblx0XHRcdFx0fSlcclxuXHRcdFx0ZWxzZSByZXMuanNvbih7IG1lc3NhZ2U6ICdDYXRlZ29yaWEgYWN0dWFsaXphZGEgZXhpdG9zYW1lbnRlJywgb3BPSzogdHJ1ZSB9KVxyXG5cdFx0fVxyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdHJlcy5qc29uKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgb3BPSzogZmFsc2UgfSlcclxuXHR9XHJcbn0pXHJcblxyXG5yb3V0ZXIucHV0KCcvZGVsZXRlJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcblx0Y29uc3Qgc3FsID0gbmV3IFNxbCh1c2VyU1FMLCBwd1NRTCwgZGJTUUwsIHNlcnZlclNRTCwgcG9ydFNRTClcclxuXHRjb25zdCB7IGlkQ2F0ZWdvcmlhIH0gPSByZXEuYm9keVxyXG5cclxuXHRpZiAoaWRDYXRlZ29yaWEgPT09IHVuZGVmaW5lZCB8fCBpZENhdGVnb3JpYSA9PT0gJycpXHJcblx0XHRyZXR1cm4gcmVzLmpzb24oe1xyXG5cdFx0XHRtZXNzYWdlOiAnRWwgaWQgZGUgbGEgY2F0ZWdvcmlhIGVzIHJlcXVlcmlkYScsXHJcblx0XHRcdG9wT0s6IGZhbHNlLFxyXG5cdFx0fSlcclxuXHR0cnkge1xyXG5cdFx0Y29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IHNxbC5vcGVuQ29ubmVjdGlvbignZGVsZXRlQ2F0ZWdvcmlhJylcclxuXHRcdGNvbnN0IG15UmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGNvbm5lY3Rpb24pXHJcblxyXG5cdFx0bXlSZXF1ZXN0LmlucHV0KCdpZENhdGVnb3JpYScsIEludCwgaWRDYXRlZ29yaWEpXHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBteVJlcXVlc3QuZXhlY3V0ZSgncGFfZWxpbWluYUNhdGVnb3JpYScpXHJcblxyXG5cdFx0aWYgKHJlc3VsdCkge1xyXG5cdFx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdFx0aWYgKHJlc3VsdC5yb3dzQWZmZWN0ZWRbMF0gPT09IDApXHJcblx0XHRcdFx0cmVzLmpzb24oe1xyXG5cdFx0XHRcdFx0bWVzc2FnZTogYE5vIHNlIGVuY29udHJvIG5pbmd1bmEgY2F0ZWdvcmlhIGNvbiBlbCBpZCAke2lkQ2F0ZWdvcmlhfWAsXHJcblx0XHRcdFx0XHRvcE9LOiBmYWxzZSxcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRlbHNlIHJlcy5qc29uKHsgbWVzc2FnZTogJ0NhdGVnb3JpYSBlbGltaW5hZGEgZXhpdG9zYW1lbnRlJywgb3BPSzogdHJ1ZSB9KVxyXG5cdFx0fVxyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdHJlcy5qc29uKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgb3BPSzogZmFsc2UgfSlcclxuXHR9XHJcbn0pXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlclxyXG4iLCJjb25zdCBqd3QgPSByZXF1aXJlKCdqc29ud2VidG9rZW4nKVxyXG5cclxuY29uc3QgeyBzZWNyZXQgfSA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZycpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uIChyZXEsIHJlcywgbmV4dCkge1xyXG5cdGlmIChyZXEucGF0aCA9PT0gJy9hcGkvbG9naW4nIHx8IHJlcS5wYXRoID09PSAnL2FwaS9zaWdudXAnKSByZXR1cm4gbmV4dCgpXHJcblx0aWYgKCFyZXEuaGVhZGVycy5hdXRob3JpemF0aW9uKVxyXG5cdFx0cmV0dXJuIHJlcy5qc29uKHsgbWVzc2FnZTogJ0VudmllIGVsIHRva2VuIGVuIGVsIGhlYWRlcnMnLCBsb2dPSzogZmFsc2UgfSlcclxuXHRjb25zdCB0b2tlbiA9IFN0cmluZyhyZXEuaGVhZGVycy5hdXRob3JpemF0aW9uKS5zcGxpdCgnICcpWzFdXHJcblx0and0LnZlcmlmeSh0b2tlbiwgc2VjcmV0LCBlcnJvciA9PiB7XHJcblx0XHRpZiAoZXJyb3IpIHJldHVybiByZXMuanNvbih7IG1lc3NhZ2U6ICdFcnJvciB0b2tlbiBpbnZhbGlkbycsIGxvZ09LOiBmYWxzZSB9KVxyXG5cdFx0ZWxzZSByZXR1cm4gbmV4dCgpXHJcblx0fSlcclxufVxyXG4iLCJjb25zdCB7IFJvdXRlciB9ID0gcmVxdWlyZSgnZXhwcmVzcycpXHJcbmNvbnN0IGp3dCA9IHJlcXVpcmUoJ2pzb253ZWJ0b2tlbicpXHJcbmNvbnN0IHsgc2VjcmV0IH0gPSByZXF1aXJlKCcuLi8uLi9jb25maWcnKVxyXG5cclxuY29uc3Qgcm91dGVyID0gUm91dGVyKClcclxuXHJcbnJvdXRlci5nZXQoJy8nLCAocmVxLCByZXMpID0+IHtcclxuXHRjb25zdCB0b2tlbiA9IFN0cmluZyhyZXEuaGVhZGVycy5hdXRob3JpemF0aW9uKS5zcGxpdCgnICcpWzFdXHJcblx0and0LnZlcmlmeSh0b2tlbiwgc2VjcmV0LCAoZXJyb3IsIHVzdWFyaW8pID0+IHtcclxuXHRcdGlmIChlcnJvcikgcmVzLmpzb24oeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLCBsb2dPSzogZmFsc2UgfSlcclxuXHRcdGVsc2UgcmVzLmpzb24oeyB1c3VhcmlvLCBsb2dPSzogdHJ1ZSB9KVxyXG5cdH0pXHJcbn0pXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlclxyXG4iLCJjb25zdCB7IFJvdXRlciB9ID0gcmVxdWlyZSgnZXhwcmVzcycpXHJcbmNvbnN0IGp3dCA9IHJlcXVpcmUoJ2pzb253ZWJ0b2tlbicpXHJcbmNvbnN0IGJjcnlwdCA9IHJlcXVpcmUoJ2JjcnlwdCcpXHJcblxyXG5jb25zdCBTcWwgPSByZXF1aXJlKCcuLi9DT05FQ1RJT05EQi9TcWwnKVxyXG5jb25zdCB7IGNhZGVuYUNvbmV4aW9uIH0gPSByZXF1aXJlKCcuLi8uLi9jb25maWcnKVxyXG5jb25zdCB7IHNlY3JldCB9ID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnJylcclxuXHJcbmNvbnN0IHJvdXRlciA9IFJvdXRlcigpXHJcblxyXG5yb3V0ZXIucG9zdCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG5cdGNvbnN0IHsgZW1haWxVc3VhcmlvLCBwd1VzdWFyaW8gfSA9IHJlcS5ib2R5XHJcblx0aWYgKFxyXG5cdFx0ZW1haWxVc3VhcmlvID09PSB1bmRlZmluZWQgfHxcclxuXHRcdHB3VXN1YXJpbyA9PT0gdW5kZWZpbmVkIHx8XHJcblx0XHRlbWFpbFVzdWFyaW8gPT09ICcnIHx8XHJcblx0XHRwd1VzdWFyaW8gPT09ICcnXHJcblx0KVxyXG5cdFx0cmV0dXJuIHJlcy5qc29uKHsgbWVzc2FnZTogJ0VtYWlsIHkgcGFzc3dvcmQgc29uIG9ibGlnYXRvcmlvcycgfSlcclxuXHRjb25zdCB7IHVzZXJTUUwsIHB3U1FMLCBkYlNRTCwgc2VydmVyU1FMLCBwb3J0U1FMIH0gPSBjYWRlbmFDb25leGlvblxyXG5cdGNvbnN0IHNxbCA9IG5ldyBTcWwodXNlclNRTCwgcHdTUUwsIGRiU1FMLCBzZXJ2ZXJTUUwsIHBvcnRTUUwpXHJcblx0dHJ5IHtcclxuXHRcdGNvbnN0IHsgUmVxdWVzdCwgVmFyQ2hhciB9ID0gcmVxdWlyZSgnbXNzcWwnKVxyXG5cdFx0Y29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IHNxbC5vcGVuQ29ubmVjdGlvbignJylcclxuXHRcdGNvbnN0IG15UmVxdWVzdCA9IG5ldyBSZXF1ZXN0KGNvbm5lY3Rpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2VtYWlsVXN1YXJpbycsIFZhckNoYXIsIGVtYWlsVXN1YXJpbylcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG15UmVxdWVzdC5leGVjdXRlKCdwYV9sb2dpbicpXHJcblx0XHRpZiAocmVzdWx0KSB7XHJcblx0XHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0XHRpZiAocmVzdWx0LnJvd3NBZmZlY3RlZFswXSA9PT0gMClcclxuXHRcdFx0XHRyZXR1cm4gcmVzLmpzb24oeyBtZXNzYWdlOiAnVXN1YXJpbyBJbmV4aXRlbnRlJywgbG9nT0s6IGZhbHNlIH0pXHJcblx0XHRcdGNvbnN0IHB3RW5jcmlwdGFkYSA9IHJlc3VsdC5yZWNvcmRzZXRbMF0ucHdVc3VhcmlvXHJcblx0XHRcdGlmICghYmNyeXB0LmNvbXBhcmVTeW5jKHB3VXN1YXJpbywgcHdFbmNyaXB0YWRhKSlcclxuXHRcdFx0XHRyZXR1cm4gcmVzLmpzb24oeyBtZXNzYWdlOiAnUHcgaW5jb3JyZWN0YScsIGxvZ09LOiBmYWxzZSB9KVxyXG5cdFx0XHRjb25zdCB1c3VhcmlvID0ge1xyXG5cdFx0XHRcdGlkVXN1YXJpbzogcmVzdWx0LnJlY29yZHNldFswXS5pZFVzdWFyaW8sXHJcblx0XHRcdFx0ZW1haWxVc3VhcmlvOiByZXN1bHQucmVjb3Jkc2V0WzBdLmVtYWlsVXN1YXJpbyxcclxuXHRcdFx0fVxyXG5cdFx0XHRqd3Quc2lnbih1c3VhcmlvLCBzZWNyZXQsIHsgZXhwaXJlc0luOiAnMC41aCcgfSwgKGVyciwgdG9rZW4pID0+IHtcclxuXHRcdFx0XHRpZiAoZXJyKSByZXMuanNvbih7IG1lc3NhZ2U6IGVyci5tZXNzYWdlLCBsb2dPSzogZmFsc2UgfSlcclxuXHRcdFx0XHRlbHNlIHJlcy5qc29uKHsgbWVzc2FnZTogJ0xvZyBleGl0b3NvJywgbG9nT0s6IHRydWUsIHRva2VuOiB0b2tlbiB9KVxyXG5cdFx0XHR9KVxyXG5cdFx0fVxyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdHJlcy5qc29uKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgbG9nT0s6IGZhbHNlIH0pXHJcblx0fVxyXG59KVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXJcclxuIiwiY29uc3QgeyBSb3V0ZXIgfSA9IHJlcXVpcmUoJ2V4cHJlc3MnKVxyXG5jb25zdCBtc3NxbCA9IHJlcXVpcmUoJ21zc3FsJylcclxuXHJcbmNvbnN0IFNxbCA9IHJlcXVpcmUoJy4uL0NPTkVDVElPTkRCL1NxbCcpXHJcbmNvbnN0IHsgY2FkZW5hQ29uZXhpb24gfSA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZycpXHJcbmNvbnN0IHsgdXNlclNRTCwgcHdTUUwsIGRiU1FMLCBzZXJ2ZXJTUUwsIHBvcnRTUUwgfSA9IGNhZGVuYUNvbmV4aW9uXHJcblxyXG5jb25zdCByb3V0ZXIgPSBSb3V0ZXIoKVxyXG5cclxucm91dGVyLnBvc3QoJy9saXN0JywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcblx0Y29uc3Qgc3FsID0gbmV3IFNxbCh1c2VyU1FMLCBwd1NRTCwgZGJTUUwsIHNlcnZlclNRTCwgcG9ydFNRTClcclxuXHRjb25zdCB7IGlkVXN1YXJpbyB9ID0gcmVxLmJvZHlcclxuXHRpZiAoaWRVc3VhcmlvID09PSB1bmRlZmluZWQgfHwgaWRVc3VhcmlvID09PSAnJylcclxuXHRcdHJldHVybiByZXMuanNvbih7IG1lc3NhZ2U6ICdFbCBpZCBlbCB1c3VhcmlvIGVzIHJlcXVlcmlkbycsIG9wT0s6IGZhbHNlIH0pXHJcblxyXG5cdHRyeSB7XHJcblx0XHRjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgc3FsLm9wZW5Db25uZWN0aW9uKCdsaXN0T3BlcmFjaW9uZXMnKVxyXG5cdFx0Y29uc3QgbXlSZXF1ZXN0ID0gbmV3IG1zc3FsLlJlcXVlc3QoY29ubmVjdGlvbilcclxuXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2lkVXN1YXJpbycsIG1zc3FsLkludCwgaWRVc3VhcmlvKVxyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgbXlSZXF1ZXN0LmV4ZWN1dGUoJ3BhX2xpc3RhT3BlcmFjaW9uZXMnKVxyXG5cclxuXHRcdGlmIChyZXN1bHQpIHtcclxuXHRcdFx0c3FsLmNsb3NlQ29ubmVjdGlvbigpXHJcblx0XHRcdHJlcy5qc29uKHsgbGlzdE9wZXJhY2lvbmVzOiByZXN1bHQucmVjb3Jkc2V0LCBvcE9LOiB0cnVlIH0pXHJcblx0XHR9XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0cmVzLmpzb24oeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLCBvcE9LOiBmYWxzZSB9KVxyXG5cdH1cclxufSlcclxuXHJcbnJvdXRlci5wb3N0KCcvc2F2ZScsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG5cdGNvbnN0IHNxbCA9IG5ldyBTcWwodXNlclNRTCwgcHdTUUwsIGRiU1FMLCBzZXJ2ZXJTUUwsIHBvcnRTUUwpXHJcblxyXG5cdGNvbnN0IHsgY29uY2VwdG9PcGVyYWNpb24sIG1vbnRvT3BlcmFjaW9uLCBmZWNoYU9wZXJhY2lvbiwgdGlwb09wZXJhY2lvbiwgaWRVc3VhcmlvLCBpZENhdGVnb3JpYSB9ID0gcmVxLmJvZHlcclxuXHJcblx0dHJ5IHtcclxuXHRcdGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBzcWwub3BlbkNvbm5lY3Rpb24oJ3NhdmVPcGVyYWNpb24nKVxyXG5cdFx0Y29uc3QgbXlSZXF1ZXN0ID0gbmV3IG1zc3FsLlJlcXVlc3QoY29ubmVjdGlvbilcclxuXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2NvbmNlcHRvT3BlcmFjaW9uJywgbXNzcWwuVmFyQ2hhciwgY29uY2VwdG9PcGVyYWNpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ21vbnRvT3BlcmFjaW9uJywgbXNzcWwuUmVhbCwgbW9udG9PcGVyYWNpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2ZlY2hhT3BlcmFjaW9uJywgbXNzcWwuRGF0ZSwgZmVjaGFPcGVyYWNpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ3RpcG9PcGVyYWNpb24nLCBtc3NxbC5CaXQsIHRpcG9PcGVyYWNpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2lkVXN1YXJpbycsIG1zc3FsLkludCwgaWRVc3VhcmlvKVxyXG5cdFx0bXlSZXF1ZXN0LmlucHV0KCdpZENhdGVnb3JpYScsIG1zc3FsLkludCwgaWRDYXRlZ29yaWEpXHJcblxyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgbXlSZXF1ZXN0LmV4ZWN1dGUoJ3BhX2d1YXJkYXJPcGVyYWNpb24nKVxyXG5cclxuXHRcdGlmIChyZXN1bHQpIHtcclxuXHRcdFx0c3FsLmNsb3NlQ29ubmVjdGlvbigpXHJcblx0XHRcdHJlcy5qc29uKHsgbWVzc2FnZTogJ09wZXJhY2lvbiBndWFyZGFkYSBleGl0b3NhbWVudGUnLCBvcE9LOiB0cnVlIH0pXHJcblx0XHR9XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0cmVzLmpzb24oeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLCBvcE9LOiBmYWxzZSB9KVxyXG5cdH1cclxufSlcclxuXHJcbnJvdXRlci5wdXQoJy91cGRhdGUnLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuXHRjb25zdCBzcWwgPSBuZXcgU3FsKHVzZXJTUUwsIHB3U1FMLCBkYlNRTCwgc2VydmVyU1FMLCBwb3J0U1FMKVxyXG5cdGNvbnN0IHsgaWRPcGVyYWNpb24sIGNvbmNlcHRvT3BlcmFjaW9uLCBtb250b09wZXJhY2lvbiwgZmVjaGFPcGVyYWNpb24sIGlkQ2F0ZWdvcmlhIH0gPSByZXEuYm9keVxyXG5cclxuXHR0cnkge1xyXG5cdFx0Y29uc3QgY29ubmVjdGlvbiA9IGF3YWl0IHNxbC5vcGVuQ29ubmVjdGlvbigndXBkYXRlT3BlcmFjaW9uJylcclxuXHRcdGNvbnN0IG15UmVxdWVzdCA9IG5ldyBtc3NxbC5SZXF1ZXN0KGNvbm5lY3Rpb24pXHJcblxyXG5cdFx0bXlSZXF1ZXN0LmlucHV0KCdpZE9wZXJhY2lvbicsIG1zc3FsLkludCwgaWRPcGVyYWNpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2NvbmNlcHRvT3BlcmFjaW9uJywgbXNzcWwuVmFyQ2hhciwgY29uY2VwdG9PcGVyYWNpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ21vbnRvT3BlcmFjaW9uJywgbXNzcWwuUmVhbCwgbW9udG9PcGVyYWNpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2ZlY2hhT3BlcmFjaW9uJywgbXNzcWwuRGF0ZSwgZmVjaGFPcGVyYWNpb24pXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2lkQ2F0ZWdvcmlhJywgbXNzcWwuSW50LCBpZENhdGVnb3JpYSlcclxuXHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBteVJlcXVlc3QuZXhlY3V0ZSgncGFfYWN0dWFsaXphck9wZXJhY2lvbicpXHJcblxyXG5cdFx0aWYgKHJlc3VsdCkge1xyXG5cdFx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdFx0aWYgKHJlc3VsdC5yb3dzQWZmZWN0ZWRbMF0gPT09IDApXHJcblx0XHRcdFx0cmVzLmpzb24oe1xyXG5cdFx0XHRcdFx0bWVzc2FnZTogYE5vIHNlIGVuY29udHJvIG5pbmd1bmEgb3BlcmFjaW9uIGNvbiBlbCBpZCAke2lkT3BlcmFjaW9ufWAsXHJcblx0XHRcdFx0XHRvcE9LOiBmYWxzZSxcclxuXHRcdFx0XHR9KVxyXG5cdFx0XHRlbHNlIHJlcy5qc29uKHsgbWVzc2FnZTogJ09wZXJhY2lvbiBhY3R1YWxpemFkYSBleGl0b3NhbWVudGUnLCBvcE9LOiB0cnVlIH0pXHJcblx0XHR9XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0cmVzLmpzb24oeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLCBvcE9LOiBmYWxzZSB9KVxyXG5cdH1cclxufSlcclxuXHJcbnJvdXRlci5wdXQoJy9kZWxldGUnLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuXHRjb25zdCBzcWwgPSBuZXcgU3FsKHVzZXJTUUwsIHB3U1FMLCBkYlNRTCwgc2VydmVyU1FMLCBwb3J0U1FMKVxyXG5cdGNvbnN0IHsgaWRPcGVyYWNpb24gfSA9IHJlcS5ib2R5XHJcblxyXG5cdGlmIChpZE9wZXJhY2lvbiA9PT0gdW5kZWZpbmVkIHx8IGlkT3BlcmFjaW9uID09PSAnJylcclxuXHRcdHJldHVybiByZXMuanNvbih7XHJcblx0XHRcdG1lc3NhZ2U6ICdFbCBpZCBkZSBsYSBvcGVyYWNpb24gZXMgcmVxdWVyaWRhJyxcclxuXHRcdFx0b3BPSzogZmFsc2UsXHJcblx0XHR9KVxyXG5cdHRyeSB7XHJcblx0XHRjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgc3FsLm9wZW5Db25uZWN0aW9uKCdkZWxldGVPcGVyYWNpb24nKVxyXG5cdFx0Y29uc3QgbXlSZXF1ZXN0ID0gbmV3IG1zc3FsLlJlcXVlc3QoY29ubmVjdGlvbilcclxuXHJcblx0XHRteVJlcXVlc3QuaW5wdXQoJ2lkT3BlcmFjaW9uJywgbXNzcWwuSW50LCBpZE9wZXJhY2lvbilcclxuXHRcdGNvbnN0IHJlc3VsdCA9IGF3YWl0IG15UmVxdWVzdC5leGVjdXRlKCdwYV9lbGltaW5hT3BlcmFjaW9uJylcclxuXHJcblx0XHRpZiAocmVzdWx0KSB7XHJcblx0XHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0XHRpZiAocmVzdWx0LnJvd3NBZmZlY3RlZFswXSA9PT0gMClcclxuXHRcdFx0XHRyZXMuanNvbih7XHJcblx0XHRcdFx0XHRtZXNzYWdlOiBgTm8gc2UgZW5jb250cm8gbmluZ3VuYSBvcGVyYWNpb24gY29uIGVsIGlkICR7aWRPcGVyYWNpb259YCxcclxuXHRcdFx0XHRcdG9wT0s6IGZhbHNlLFxyXG5cdFx0XHRcdH0pXHJcblx0XHRcdGVsc2UgcmVzLmpzb24oeyBtZXNzYWdlOiAnT3BlcmFjaW9uIGVsaW1pbmFkYSBleGl0b3NhbWVudGUnLCBvcE9LOiB0cnVlIH0pXHJcblx0XHR9XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0cmVzLmpzb24oeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLCBvcE9LOiBmYWxzZSB9KVxyXG5cdH1cclxufSlcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcm91dGVyXHJcbiIsImNvbnN0IHsgUm91dGVyIH0gPSByZXF1aXJlKCdleHByZXNzJylcclxuY29uc3QgYmNyaXB0ID0gcmVxdWlyZSgnYmNyeXB0JylcclxuY29uc3QgeyBSZXF1ZXN0LCBWYXJDaGFyIH0gPSByZXF1aXJlKCdtc3NxbCcpXHJcblxyXG5jb25zdCBTcWwgPSByZXF1aXJlKCcuLi9DT05FQ1RJT05EQi9TcWwnKVxyXG5jb25zdCB7IGNhZGVuYUNvbmV4aW9uIH0gPSByZXF1aXJlKCcuLi8uLi9jb25maWcnKVxyXG5cclxuY29uc3Qgcm91dGVyID0gUm91dGVyKClcclxuXHJcbmNvbnN0IHsgdXNlclNRTCwgcHdTUUwsIGRiU1FMLCBzZXJ2ZXJTUUwsIHBvcnRTUUwgfSA9IGNhZGVuYUNvbmV4aW9uXHJcblxyXG5yb3V0ZXIucG9zdCgnLycsIGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG5cdGNvbnN0IHsgZW1haWxVc3VhcmlvLCBwd1VzdWFyaW8gfSA9IHJlcS5ib2R5XHJcblx0Y29uc3Qgc3FsID0gbmV3IFNxbCh1c2VyU1FMLCBwd1NRTCwgZGJTUUwsIHNlcnZlclNRTCwgcG9ydFNRTClcclxuXHRpZiAoXHJcblx0XHRlbWFpbFVzdWFyaW8gPT09IHVuZGVmaW5lZCB8fFxyXG5cdFx0cHdVc3VhcmlvID09PSB1bmRlZmluZWQgfHxcclxuXHRcdGVtYWlsVXN1YXJpbyA9PT0gJycgfHxcclxuXHRcdHB3VXN1YXJpbyA9PT0gJydcclxuXHQpIHtcclxuXHRcdHJlcy5qc29uKHsgbWVzc2FnZTogJ0FzZWd1cmVzZSBkZSBlbnZpYXIgZWwgZW1haWwgeSBsYSBwYXNzd29yZCcsIG9wT0s6IGZhbHNlIH0pXHJcblx0XHRyZXR1cm5cclxuXHR9XHJcblx0dHJ5IHtcclxuXHRcdGNvbnN0IGNvbm5lY3Rpb24gPSBhd2FpdCBzcWwub3BlbkNvbm5lY3Rpb24oJ3NhdmVVc2VyJylcclxuXHRcdGNvbnN0IG15UmVxdWVzID0gbmV3IFJlcXVlc3QoY29ubmVjdGlvbilcclxuXHRcdG15UmVxdWVzLmlucHV0KCdlbWFpbFVzdWFyaW8nLCBWYXJDaGFyLCBlbWFpbFVzdWFyaW8pXHJcblx0XHRjb25zdCBwd0VuY3JpcHRhZGEgPSBiY3JpcHQuaGFzaFN5bmMocHdVc3VhcmlvLCAxMClcclxuXHRcdG15UmVxdWVzLmlucHV0KCdwd1VzdWFyaW8nLCBWYXJDaGFyLCBwd0VuY3JpcHRhZGEpXHJcblx0XHRjb25zdCByZXN1bHQgPSBhd2FpdCBteVJlcXVlcy5leGVjdXRlKCdwYV9pbnNlcnRVc3VhcmlvJylcclxuXHRcdGlmIChyZXN1bHQpIHtcclxuXHRcdFx0c3FsLmNsb3NlQ29ubmVjdGlvbigpXHJcblx0XHRcdHJlcy5qc29uKHsgbWVzc2FnZTogJ1N1Y2Nlc3NmdWwgb3BlcmF0aW9uJywgb3BPSzogdHJ1ZSB9KVxyXG5cdFx0fVxyXG5cdH0gY2F0Y2ggKGVycm9yKSB7XHJcblx0XHRzcWwuY2xvc2VDb25uZWN0aW9uKClcclxuXHRcdHJlcy5qc29uKHsgbWVzc2FnZTogZXJyb3IubWVzc2FnZSwgb3BPSzogZmFsc2UgfSlcclxuXHR9XHJcbn0pXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlclxyXG4iLCJjb25zdCBleHByZXNzID0gcmVxdWlyZSgnZXhwcmVzcycpXHJcbmNvbnN0IGNvcnMgPSByZXF1aXJlKCdjb3JzJylcclxuY29uc3QgbW9yZ2FuID0gcmVxdWlyZSgnbW9yZ2FuJylcclxuY29uc3QgZG90ZW52ID0gcmVxdWlyZSgnZG90ZW52JylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU2VydmVyIHtcclxuXHRjb25zdHJ1Y3Rvcihwb3J0KSB7XHJcblx0XHRkb3RlbnYuY29uZmlnKClcclxuXHRcdHRoaXMucG9ydCA9IHByb2Nlc3MuZW52LlBPUlQgfHwgcG9ydFxyXG5cdFx0dGhpcy5zZXJ2ZXIgPSBleHByZXNzKClcclxuXHR9XHJcblxyXG5cdG1pZGVsd2FyZSgpIHtcclxuXHRcdHRoaXMuc2VydmVyLnVzZShjb3JzKCkpXHJcblx0XHR0aGlzLnNlcnZlci51c2UoZXhwcmVzcy5qc29uKCkpXHJcblx0XHR0aGlzLnNlcnZlci51c2UobW9yZ2FuKCdkZXYnKSlcclxuXHRcdHRoaXMuc2VydmVyLnVzZShleHByZXNzLnVybGVuY29kZWQoeyBleHRlbmRlZDogZmFsc2UgfSkpXHJcblx0XHR0aGlzLnNlcnZlci51c2UocmVxdWlyZSgnLi4vUk9VVEVSL2NoZWNrTG9naW4nKSlcclxuXHR9XHJcblxyXG5cdHJvdXRlcigpIHtcclxuXHRcdHRoaXMuc2VydmVyLnVzZSgnL2FwaS9zaWdudXAnLCByZXF1aXJlKCcuLi9ST1VURVIvc2lnbnVwJykpXHJcblx0XHR0aGlzLnNlcnZlci51c2UoJy9hcGkvbG9naW4nLCByZXF1aXJlKCcuLi9ST1VURVIvbG9naW4nKSlcclxuXHRcdHRoaXMuc2VydmVyLnVzZSgnL2FwaS9nZXR1c2VybG9naW4nLCByZXF1aXJlKCcuLi9ST1VURVIvZ2V0VXNlckxvZ2luJykpXHJcblx0XHR0aGlzLnNlcnZlci51c2UoJy9hcGkvY2F0ZWdvcnknLCByZXF1aXJlKCcuLi9ST1VURVIvY2F0ZWdvcmlhcycpKVxyXG5cdFx0dGhpcy5zZXJ2ZXIudXNlKCcvYXBpL29wZXJhdGlvbicsIHJlcXVpcmUoJy4uL1JPVVRFUi9vcGVyYWNpb25lcycpKVxyXG5cdH1cclxuXHJcblx0ZXhlY3V0ZSgpIHtcclxuXHRcdHRoaXMubWlkZWx3YXJlKClcclxuXHRcdHRoaXMucm91dGVyKClcclxuXHRcdHRoaXMuc2VydmVyLmxpc3Rlbih0aGlzLnBvcnQsIGUgPT4gY29uc29sZS5sb2coYHNlcnZlciBjb3JyaWVuZG8gZW4gZWwgcHVlcnRvICR7dGhpcy5wb3J0fWApKVxyXG5cdH1cclxufVxyXG4iLCJjb25zdCBjYWRlbmFDb25leGlvbiA9IHtcclxuXHR1c2VyU1FMOiBwcm9jZXNzLmVudi5VU0VTUUwsXHJcblx0cHdTUUw6IHByb2Nlc3MuZW52LlBXU1FMLFxyXG5cdGRiU1FMOiBwcm9jZXNzLmVudi5EQlNRTCxcclxuXHRzZXJ2ZXJTUUw6IHByb2Nlc3MuZW52LlNFUlZFUlNRTCxcclxuXHRwb3J0U1FMOiBwcm9jZXNzLmVudi5QT1JUU1FMLFxyXG59XHJcblxyXG5jb25zdCBzZWNyZXQgPSAnYWJjMTIzLidcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGNhZGVuYUNvbmV4aW9uLFxyXG5cdHNlY3JldCxcclxufVxyXG4iLCJjb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuL1NSQy9TRVJWRVIvc2VydmVyJylcclxuXHJcbmNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoNTAwMClcclxuXHJcbnNlcnZlci5leGVjdXRlKClcclxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmNyeXB0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvcnNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZG90ZW52XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbndlYnRva2VuXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm1vcmdhblwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJtc3NxbFwiKTsiXSwic291cmNlUm9vdCI6IiJ9