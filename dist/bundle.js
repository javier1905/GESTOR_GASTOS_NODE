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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly8vd2VicGFjay9ib290c3RyYXAiLCJ3ZWJwYWNrOi8vLy4vU1JDL0NPTkVDVElPTkRCL1NxbC5qcyIsIndlYnBhY2s6Ly8vLi9TUkMvUk9VVEVSL2NoZWNrTG9naW4uanMiLCJ3ZWJwYWNrOi8vLy4vU1JDL1JPVVRFUi9nZXRVc2VyTG9naW4uanMiLCJ3ZWJwYWNrOi8vLy4vU1JDL1JPVVRFUi9sb2dpbi5qcyIsIndlYnBhY2s6Ly8vLi9TUkMvUk9VVEVSL3NpZ251cC5qcyIsIndlYnBhY2s6Ly8vLi9TUkMvU0VSVkVSL3NlcnZlci5qcyIsIndlYnBhY2s6Ly8vLi9jb25maWcuanMiLCJ3ZWJwYWNrOi8vLy4vaW5kZXguanMiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiYmNyeXB0XCIiLCJ3ZWJwYWNrOi8vL2V4dGVybmFsIFwiY29yc1wiIiwid2VicGFjazovLy9leHRlcm5hbCBcImRvdGVudlwiIiwid2VicGFjazovLy9leHRlcm5hbCBcImV4cHJlc3NcIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJqc29ud2VidG9rZW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtb3JnYW5cIiIsIndlYnBhY2s6Ly8vZXh0ZXJuYWwgXCJtc3NxbFwiIl0sIm5hbWVzIjpbIm1zc3FsIiwicmVxdWlyZSIsIm1vZHVsZSIsImV4cG9ydHMiLCJTcWwiLCJjb25zdHJ1Y3RvciIsInVzZXJTUUwiLCJwd1NRTCIsImRiU1FMIiwic2VydmVyU1FMIiwicG9ydFNRTCIsInVyaSIsInVzZXIiLCJwYXNzd29yZCIsImRhdGFiYXNlIiwic2VydmVyIiwicG9ydCIsInBhcnNlSW50Iiwib3B0aW9ucyIsImVuYWJsZUFyaXRoQWJvcnQiLCJlbmNyeXB0IiwiY29ubmVjdGlvblRpbWVPdXQiLCJkcml2ZXIiLCJzdHJlYW0iLCJwb29sIiwibWF4IiwibWluIiwiaWRsZVRpbWVvdXRNaWxsaXMiLCJjb25leGlvbmVzIiwib3BlbkNvbm5lY3Rpb24iLCJuYW1lIiwiT2JqZWN0IiwicHJvdG90eXBlIiwiaGFzT3duUHJvcGVydHkiLCJjYWxsIiwibmV3Q29uZXhpb24iLCJDb25uZWN0aW9uUG9vbCIsImNsb3NlIiwiYmluZCIsImFyZ3MiLCJjb25uZWN0IiwiY2xvc2VDb25uZWN0aW9uIiwiUHJvbWlzZSIsImFsbCIsInZhbHVlcyIsIm1hcCIsImp3dCIsInNlY3JldCIsInJlcSIsInJlcyIsIm5leHQiLCJwYXRoIiwiaGVhZGVycyIsImF1dGhvcml6YXRpb24iLCJqc29uIiwibWVzc2FnZSIsImxvZ09LIiwidG9rZW4iLCJTdHJpbmciLCJzcGxpdCIsInZlcmlmeSIsImVycm9yIiwiUm91dGVyIiwicm91dGVyIiwiZ2V0IiwidXN1YXJpbyIsImJjcnlwdCIsImNhZGVuYUNvbmV4aW9uIiwicG9zdCIsImVtYWlsVXN1YXJpbyIsInB3VXN1YXJpbyIsImJvZHkiLCJ1bmRlZmluZWQiLCJzcWwiLCJSZXF1ZXN0IiwiVmFyQ2hhciIsImNvbm5lY3Rpb24iLCJteVJlcXVlc3QiLCJpbnB1dCIsInJlc3VsdCIsImV4ZWN1dGUiLCJyb3dzQWZmZWN0ZWQiLCJwd0VuY3JpcHRhZGEiLCJyZWNvcmRzZXQiLCJjb21wYXJlU3luYyIsImlkVXN1YXJpbyIsInNpZ24iLCJleHBpcmVzSW4iLCJlcnIiLCJiY3JpcHQiLCJvcE9LIiwibXlSZXF1ZXMiLCJoYXNoU3luYyIsImV4cHJlc3MiLCJjb3JzIiwibW9yZ2FuIiwiZG90ZW52IiwiU2VydmVyIiwiY29uZmlnIiwicHJvY2VzcyIsImVudiIsIlBPUlQiLCJtaWRlbHdhcmUiLCJ1c2UiLCJ1cmxlbmNvZGVkIiwiZXh0ZW5kZWQiLCJsaXN0ZW4iLCJlIiwiY29uc29sZSIsImxvZyIsIlVTRVNRTCIsIlBXU1FMIiwiREJTUUwiLCJTRVJWRVJTUUwiLCJQT1JUU1FMIl0sIm1hcHBpbmdzIjoiO1FBQUE7UUFDQTs7UUFFQTtRQUNBOztRQUVBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBO1FBQ0E7UUFDQTtRQUNBOztRQUVBO1FBQ0E7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QUNDLEdBQVIsQ0FBWVUsTUFEQztBQUV0QnZHLE9BQUssRUFBRTRGLE9BQU8sQ0FBQ0MsR0FBUixDQUFZVyxLQUZHO0FBR3RCdkcsT0FBSyxFQUFFMkYsT0FBTyxDQUFDQyxHQUFSLENBQVlZLEtBSEc7QUFJdEJ2RyxXQUFTLEVBQUUwRixPQUFPLENBQUNDLEdBQVIsQ0FBWWEsU0FKRDtBQUt0QnZHLFNBQU8sRUFBRXlGLE9BQU8sQ0FBQ0MsR0FBUixDQUFZYztBQUxDLENBQXZCO0FBUUEsTUFBTW5FLE1BQU0sR0FBRyxTQUFmO0FBRUE3QyxNQUFNLENBQUNDLE9BQVAsR0FBaUI7QUFDaEJnRSxnQkFEZ0I7QUFFaEJwQjtBQUZnQixDQUFqQixDOzs7Ozs7Ozs7OztBQ1ZBLE1BQU1rRCxNQUFNLEdBQUdoRyxtQkFBTyxDQUFDLG1EQUFELENBQXRCOztBQUVBLE1BQU1jLE1BQU0sR0FBRyxJQUFJa0YsTUFBSixDQUFXLElBQVgsQ0FBZjtBQUVBbEYsTUFBTSxDQUFDaUUsT0FBUCxHOzs7Ozs7Ozs7OztBQ0pBLG1DOzs7Ozs7Ozs7OztBQ0FBLGlDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLG9DOzs7Ozs7Ozs7OztBQ0FBLHlDOzs7Ozs7Ozs7OztBQ0FBLG1DOzs7Ozs7Ozs7OztBQ0FBLGtDIiwiZmlsZSI6ImJ1bmRsZS5qcyIsInNvdXJjZXNDb250ZW50IjpbIiBcdC8vIFRoZSBtb2R1bGUgY2FjaGVcbiBcdHZhciBpbnN0YWxsZWRNb2R1bGVzID0ge307XG5cbiBcdC8vIFRoZSByZXF1aXJlIGZ1bmN0aW9uXG4gXHRmdW5jdGlvbiBfX3dlYnBhY2tfcmVxdWlyZV9fKG1vZHVsZUlkKSB7XG5cbiBcdFx0Ly8gQ2hlY2sgaWYgbW9kdWxlIGlzIGluIGNhY2hlXG4gXHRcdGlmKGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdKSB7XG4gXHRcdFx0cmV0dXJuIGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdLmV4cG9ydHM7XG4gXHRcdH1cbiBcdFx0Ly8gQ3JlYXRlIGEgbmV3IG1vZHVsZSAoYW5kIHB1dCBpdCBpbnRvIHRoZSBjYWNoZSlcbiBcdFx0dmFyIG1vZHVsZSA9IGluc3RhbGxlZE1vZHVsZXNbbW9kdWxlSWRdID0ge1xuIFx0XHRcdGk6IG1vZHVsZUlkLFxuIFx0XHRcdGw6IGZhbHNlLFxuIFx0XHRcdGV4cG9ydHM6IHt9XG4gXHRcdH07XG5cbiBcdFx0Ly8gRXhlY3V0ZSB0aGUgbW9kdWxlIGZ1bmN0aW9uXG4gXHRcdG1vZHVsZXNbbW9kdWxlSWRdLmNhbGwobW9kdWxlLmV4cG9ydHMsIG1vZHVsZSwgbW9kdWxlLmV4cG9ydHMsIF9fd2VicGFja19yZXF1aXJlX18pO1xuXG4gXHRcdC8vIEZsYWcgdGhlIG1vZHVsZSBhcyBsb2FkZWRcbiBcdFx0bW9kdWxlLmwgPSB0cnVlO1xuXG4gXHRcdC8vIFJldHVybiB0aGUgZXhwb3J0cyBvZiB0aGUgbW9kdWxlXG4gXHRcdHJldHVybiBtb2R1bGUuZXhwb3J0cztcbiBcdH1cblxuXG4gXHQvLyBleHBvc2UgdGhlIG1vZHVsZXMgb2JqZWN0IChfX3dlYnBhY2tfbW9kdWxlc19fKVxuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5tID0gbW9kdWxlcztcblxuIFx0Ly8gZXhwb3NlIHRoZSBtb2R1bGUgY2FjaGVcbiBcdF9fd2VicGFja19yZXF1aXJlX18uYyA9IGluc3RhbGxlZE1vZHVsZXM7XG5cbiBcdC8vIGRlZmluZSBnZXR0ZXIgZnVuY3Rpb24gZm9yIGhhcm1vbnkgZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5kID0gZnVuY3Rpb24oZXhwb3J0cywgbmFtZSwgZ2V0dGVyKSB7XG4gXHRcdGlmKCFfX3dlYnBhY2tfcmVxdWlyZV9fLm8oZXhwb3J0cywgbmFtZSkpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgbmFtZSwgeyBlbnVtZXJhYmxlOiB0cnVlLCBnZXQ6IGdldHRlciB9KTtcbiBcdFx0fVxuIFx0fTtcblxuIFx0Ly8gZGVmaW5lIF9fZXNNb2R1bGUgb24gZXhwb3J0c1xuIFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yID0gZnVuY3Rpb24oZXhwb3J0cykge1xuIFx0XHRpZih0eXBlb2YgU3ltYm9sICE9PSAndW5kZWZpbmVkJyAmJiBTeW1ib2wudG9TdHJpbmdUYWcpIHtcbiBcdFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgU3ltYm9sLnRvU3RyaW5nVGFnLCB7IHZhbHVlOiAnTW9kdWxlJyB9KTtcbiBcdFx0fVxuIFx0XHRPYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xuIFx0fTtcblxuIFx0Ly8gY3JlYXRlIGEgZmFrZSBuYW1lc3BhY2Ugb2JqZWN0XG4gXHQvLyBtb2RlICYgMTogdmFsdWUgaXMgYSBtb2R1bGUgaWQsIHJlcXVpcmUgaXRcbiBcdC8vIG1vZGUgJiAyOiBtZXJnZSBhbGwgcHJvcGVydGllcyBvZiB2YWx1ZSBpbnRvIHRoZSBuc1xuIFx0Ly8gbW9kZSAmIDQ6IHJldHVybiB2YWx1ZSB3aGVuIGFscmVhZHkgbnMgb2JqZWN0XG4gXHQvLyBtb2RlICYgOHwxOiBiZWhhdmUgbGlrZSByZXF1aXJlXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLnQgPSBmdW5jdGlvbih2YWx1ZSwgbW9kZSkge1xuIFx0XHRpZihtb2RlICYgMSkgdmFsdWUgPSBfX3dlYnBhY2tfcmVxdWlyZV9fKHZhbHVlKTtcbiBcdFx0aWYobW9kZSAmIDgpIHJldHVybiB2YWx1ZTtcbiBcdFx0aWYoKG1vZGUgJiA0KSAmJiB0eXBlb2YgdmFsdWUgPT09ICdvYmplY3QnICYmIHZhbHVlICYmIHZhbHVlLl9fZXNNb2R1bGUpIHJldHVybiB2YWx1ZTtcbiBcdFx0dmFyIG5zID0gT2JqZWN0LmNyZWF0ZShudWxsKTtcbiBcdFx0X193ZWJwYWNrX3JlcXVpcmVfXy5yKG5zKTtcbiBcdFx0T2JqZWN0LmRlZmluZVByb3BlcnR5KG5zLCAnZGVmYXVsdCcsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHZhbHVlIH0pO1xuIFx0XHRpZihtb2RlICYgMiAmJiB0eXBlb2YgdmFsdWUgIT0gJ3N0cmluZycpIGZvcih2YXIga2V5IGluIHZhbHVlKSBfX3dlYnBhY2tfcmVxdWlyZV9fLmQobnMsIGtleSwgZnVuY3Rpb24oa2V5KSB7IHJldHVybiB2YWx1ZVtrZXldOyB9LmJpbmQobnVsbCwga2V5KSk7XG4gXHRcdHJldHVybiBucztcbiBcdH07XG5cbiBcdC8vIGdldERlZmF1bHRFeHBvcnQgZnVuY3Rpb24gZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBub24taGFybW9ueSBtb2R1bGVzXG4gXHRfX3dlYnBhY2tfcmVxdWlyZV9fLm4gPSBmdW5jdGlvbihtb2R1bGUpIHtcbiBcdFx0dmFyIGdldHRlciA9IG1vZHVsZSAmJiBtb2R1bGUuX19lc01vZHVsZSA/XG4gXHRcdFx0ZnVuY3Rpb24gZ2V0RGVmYXVsdCgpIHsgcmV0dXJuIG1vZHVsZVsnZGVmYXVsdCddOyB9IDpcbiBcdFx0XHRmdW5jdGlvbiBnZXRNb2R1bGVFeHBvcnRzKCkgeyByZXR1cm4gbW9kdWxlOyB9O1xuIFx0XHRfX3dlYnBhY2tfcmVxdWlyZV9fLmQoZ2V0dGVyLCAnYScsIGdldHRlcik7XG4gXHRcdHJldHVybiBnZXR0ZXI7XG4gXHR9O1xuXG4gXHQvLyBPYmplY3QucHJvdG90eXBlLmhhc093blByb3BlcnR5LmNhbGxcbiBcdF9fd2VicGFja19yZXF1aXJlX18ubyA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHkpIHsgcmV0dXJuIE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvYmplY3QsIHByb3BlcnR5KTsgfTtcblxuIFx0Ly8gX193ZWJwYWNrX3B1YmxpY19wYXRoX19cbiBcdF9fd2VicGFja19yZXF1aXJlX18ucCA9IFwiXCI7XG5cblxuIFx0Ly8gTG9hZCBlbnRyeSBtb2R1bGUgYW5kIHJldHVybiBleHBvcnRzXG4gXHRyZXR1cm4gX193ZWJwYWNrX3JlcXVpcmVfXyhfX3dlYnBhY2tfcmVxdWlyZV9fLnMgPSBcIi4vaW5kZXguanNcIik7XG4iLCJjb25zdCBtc3NxbCA9IHJlcXVpcmUoJ21zc3FsJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gY2xhc3MgU3FsIHtcclxuXHRjb25zdHJ1Y3Rvcih1c2VyU1FMLCBwd1NRTCwgZGJTUUwsIHNlcnZlclNRTCwgcG9ydFNRTCkge1xyXG5cdFx0dGhpcy51cmkgPSB7XHJcblx0XHRcdHVzZXI6IHVzZXJTUUwsXHJcblx0XHRcdHBhc3N3b3JkOiBwd1NRTCxcclxuXHRcdFx0ZGF0YWJhc2U6IGRiU1FMLFxyXG5cdFx0XHRzZXJ2ZXI6IHNlcnZlclNRTCxcclxuXHRcdFx0cG9ydDogcGFyc2VJbnQocG9ydFNRTCksXHJcblx0XHRcdG9wdGlvbnM6IHtcclxuXHRcdFx0XHRlbmFibGVBcml0aEFib3J0OiB0cnVlLFxyXG5cdFx0XHRcdGVuY3J5cHQ6IGZhbHNlLFxyXG5cdFx0XHR9LFxyXG5cdFx0XHRjb25uZWN0aW9uVGltZU91dDogMTUwMDAwLFxyXG5cdFx0XHRkcml2ZXI6ICd0ZWRpb3VzJyxcclxuXHRcdFx0c3RyZWFtOiBmYWxzZSxcclxuXHRcdFx0cG9vbDoge1xyXG5cdFx0XHRcdG1heDogMjAsXHJcblx0XHRcdFx0bWluOiAwLFxyXG5cdFx0XHRcdGlkbGVUaW1lb3V0TWlsbGlzOiAzMDAwMCxcclxuXHRcdFx0fSxcclxuXHRcdH1cclxuXHRcdHRoaXMuY29uZXhpb25lcyA9IHt9XHJcblx0fVxyXG5cclxuXHRhc3luYyBvcGVuQ29ubmVjdGlvbihuYW1lKSB7XHJcblx0XHRpZiAoIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbCh0aGlzLmNvbmV4aW9uZXMsIG5hbWUpKSB7XHJcblx0XHRcdGNvbnN0IG5ld0NvbmV4aW9uID0gbmV3IG1zc3FsLkNvbm5lY3Rpb25Qb29sKHRoaXMudXJpKVxyXG5cdFx0XHRjb25zdCBjbG9zZSA9IG5ld0NvbmV4aW9uLmNsb3NlLmJpbmQobmV3Q29uZXhpb24pXHJcblx0XHRcdG5ld0NvbmV4aW9uLmNsb3NlID0gKC4uLmFyZ3MpID0+IHtcclxuXHRcdFx0XHRkZWxldGUgdGhpcy5jb25leGlvbmVzW25hbWVdXHJcblx0XHRcdFx0cmV0dXJuIGNsb3NlKC4uLmFyZ3MpXHJcblx0XHRcdH1cclxuXHRcdFx0YXdhaXQgbmV3Q29uZXhpb24uY29ubmVjdCgpXHJcblx0XHRcdHRoaXMuY29uZXhpb25lc1tuYW1lXSA9IG5ld0NvbmV4aW9uXHJcblx0XHRcdHJldHVybiB0aGlzLmNvbmV4aW9uZXNbbmFtZV1cclxuXHRcdH1cclxuXHR9XHJcblxyXG5cdGNsb3NlQ29ubmVjdGlvbigpIHtcclxuXHRcdHJldHVybiBQcm9taXNlLmFsbChcclxuXHRcdFx0T2JqZWN0LnZhbHVlcyh0aGlzLmNvbmV4aW9uZXMpLm1hcChwb29sID0+IHtcclxuXHRcdFx0XHRyZXR1cm4gcG9vbC5jbG9zZSgpXHJcblx0XHRcdH0pXHJcblx0XHQpXHJcblx0fVxyXG59XHJcbiIsImNvbnN0IGp3dCA9IHJlcXVpcmUoJ2pzb253ZWJ0b2tlbicpXHJcblxyXG5jb25zdCB7IHNlY3JldCB9ID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnJylcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gKHJlcSwgcmVzLCBuZXh0KSB7XHJcblx0aWYgKHJlcS5wYXRoID09PSAnL2FwaS9sb2dpbicgfHwgcmVxLnBhdGggPT09ICcvYXBpL3NpZ251cCcpIHJldHVybiBuZXh0KClcclxuXHRpZiAoIXJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb24pXHJcblx0XHRyZXR1cm4gcmVzLmpzb24oeyBtZXNzYWdlOiAnRW52aWUgZWwgdG9rZW4gZW4gZWwgaGVhZGVycycsIGxvZ09LOiBmYWxzZSB9KVxyXG5cdGNvbnN0IHRva2VuID0gU3RyaW5nKHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb24pLnNwbGl0KCcgJylbMV1cclxuXHRqd3QudmVyaWZ5KHRva2VuLCBzZWNyZXQsIGVycm9yID0+IHtcclxuXHRcdGlmIChlcnJvcikgcmV0dXJuIHJlcy5qc29uKHsgbWVzc2FnZTogJ0Vycm9yIHRva2VuIGludmFsaWRvJywgbG9nT0s6IGZhbHNlIH0pXHJcblx0XHRlbHNlIHJldHVybiBuZXh0KClcclxuXHR9KVxyXG59XHJcbiIsImNvbnN0IHsgUm91dGVyIH0gPSByZXF1aXJlKCdleHByZXNzJylcclxuY29uc3Qgand0ID0gcmVxdWlyZSgnanNvbndlYnRva2VuJylcclxuY29uc3QgeyBzZWNyZXQgfSA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZycpXHJcblxyXG5jb25zdCByb3V0ZXIgPSBSb3V0ZXIoKVxyXG5cclxucm91dGVyLmdldCgnLycsIChyZXEsIHJlcykgPT4ge1xyXG5cdGNvbnN0IHRva2VuID0gU3RyaW5nKHJlcS5oZWFkZXJzLmF1dGhvcml6YXRpb24pLnNwbGl0KCcgJylbMV1cclxuXHRqd3QudmVyaWZ5KHRva2VuLCBzZWNyZXQsIChlcnJvciwgdXN1YXJpbykgPT4ge1xyXG5cdFx0aWYgKGVycm9yKSByZXMuanNvbih7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsIGxvZ09LOiBmYWxzZSB9KVxyXG5cdFx0ZWxzZSByZXMuanNvbih7IHVzdWFyaW8sIGxvZ09LOiB0cnVlIH0pXHJcblx0fSlcclxufSlcclxuXHJcbm1vZHVsZS5leHBvcnRzID0gcm91dGVyXHJcbiIsImNvbnN0IHsgUm91dGVyIH0gPSByZXF1aXJlKCdleHByZXNzJylcclxuY29uc3Qgand0ID0gcmVxdWlyZSgnanNvbndlYnRva2VuJylcclxuY29uc3QgYmNyeXB0ID0gcmVxdWlyZSgnYmNyeXB0JylcclxuXHJcbmNvbnN0IFNxbCA9IHJlcXVpcmUoJy4uL0NPTkVDVElPTkRCL1NxbCcpXHJcbmNvbnN0IHsgY2FkZW5hQ29uZXhpb24gfSA9IHJlcXVpcmUoJy4uLy4uL2NvbmZpZycpXHJcbmNvbnN0IHsgc2VjcmV0IH0gPSByZXF1aXJlKCcuLi8uLi9jb25maWcnKVxyXG5cclxuY29uc3Qgcm91dGVyID0gUm91dGVyKClcclxuXHJcbnJvdXRlci5wb3N0KCcvJywgYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcblx0Y29uc3QgeyBlbWFpbFVzdWFyaW8sIHB3VXN1YXJpbyB9ID0gcmVxLmJvZHlcclxuXHRpZiAoXHJcblx0XHRlbWFpbFVzdWFyaW8gPT09IHVuZGVmaW5lZCB8fFxyXG5cdFx0cHdVc3VhcmlvID09PSB1bmRlZmluZWQgfHxcclxuXHRcdGVtYWlsVXN1YXJpbyA9PT0gJycgfHxcclxuXHRcdHB3VXN1YXJpbyA9PT0gJydcclxuXHQpXHJcblx0XHRyZXR1cm4gcmVzLmpzb24oeyBtZXNzYWdlOiAnRW1haWwgeSBwYXNzd29yZCBzb24gb2JsaWdhdG9yaW9zJyB9KVxyXG5cdGNvbnN0IHsgdXNlclNRTCwgcHdTUUwsIGRiU1FMLCBzZXJ2ZXJTUUwsIHBvcnRTUUwgfSA9IGNhZGVuYUNvbmV4aW9uXHJcblx0Y29uc3Qgc3FsID0gbmV3IFNxbCh1c2VyU1FMLCBwd1NRTCwgZGJTUUwsIHNlcnZlclNRTCwgcG9ydFNRTClcclxuXHR0cnkge1xyXG5cdFx0Y29uc3QgeyBSZXF1ZXN0LCBWYXJDaGFyIH0gPSByZXF1aXJlKCdtc3NxbCcpXHJcblx0XHRjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgc3FsLm9wZW5Db25uZWN0aW9uKCcnKVxyXG5cdFx0Y29uc3QgbXlSZXF1ZXN0ID0gbmV3IFJlcXVlc3QoY29ubmVjdGlvbilcclxuXHRcdG15UmVxdWVzdC5pbnB1dCgnZW1haWxVc3VhcmlvJywgVmFyQ2hhciwgZW1haWxVc3VhcmlvKVxyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgbXlSZXF1ZXN0LmV4ZWN1dGUoJ3BhX2xvZ2luJylcclxuXHRcdGlmIChyZXN1bHQpIHtcclxuXHRcdFx0c3FsLmNsb3NlQ29ubmVjdGlvbigpXHJcblx0XHRcdGlmIChyZXN1bHQucm93c0FmZmVjdGVkWzBdID09PSAwKVxyXG5cdFx0XHRcdHJldHVybiByZXMuanNvbih7IG1lc3NhZ2U6ICdVc3VhcmlvIEluZXhpdGVudGUnLCBsb2dPSzogZmFsc2UgfSlcclxuXHRcdFx0Y29uc3QgcHdFbmNyaXB0YWRhID0gcmVzdWx0LnJlY29yZHNldFswXS5wd1VzdWFyaW9cclxuXHRcdFx0aWYgKCFiY3J5cHQuY29tcGFyZVN5bmMocHdVc3VhcmlvLCBwd0VuY3JpcHRhZGEpKVxyXG5cdFx0XHRcdHJldHVybiByZXMuanNvbih7IG1lc3NhZ2U6ICdQdyBpbmNvcnJlY3RhJywgbG9nT0s6IGZhbHNlIH0pXHJcblx0XHRcdGNvbnN0IHVzdWFyaW8gPSB7XHJcblx0XHRcdFx0aWRVc3VhcmlvOiByZXN1bHQucmVjb3Jkc2V0WzBdLmlkVXN1YXJpbyxcclxuXHRcdFx0XHRlbWFpbFVzdWFyaW86IHJlc3VsdC5yZWNvcmRzZXRbMF0uZW1haWxVc3VhcmlvLFxyXG5cdFx0XHR9XHJcblx0XHRcdGp3dC5zaWduKHVzdWFyaW8sIHNlY3JldCwgeyBleHBpcmVzSW46ICcwLjVoJyB9LCAoZXJyLCB0b2tlbikgPT4ge1xyXG5cdFx0XHRcdGlmIChlcnIpIHJlcy5qc29uKHsgbWVzc2FnZTogZXJyLm1lc3NhZ2UsIGxvZ09LOiBmYWxzZSB9KVxyXG5cdFx0XHRcdGVsc2UgcmVzLmpzb24oeyBtZXNzYWdlOiAnTG9nIGV4aXRvc28nLCBsb2dPSzogdHJ1ZSwgdG9rZW46IHRva2VuIH0pXHJcblx0XHRcdH0pXHJcblx0XHR9XHJcblx0fSBjYXRjaCAoZXJyb3IpIHtcclxuXHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0cmVzLmpzb24oeyBtZXNzYWdlOiBlcnJvci5tZXNzYWdlLCBsb2dPSzogZmFsc2UgfSlcclxuXHR9XHJcbn0pXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IHJvdXRlclxyXG4iLCJjb25zdCB7IFJvdXRlciB9ID0gcmVxdWlyZSgnZXhwcmVzcycpXHJcbmNvbnN0IGJjcmlwdCA9IHJlcXVpcmUoJ2JjcnlwdCcpXHJcbmNvbnN0IHsgUmVxdWVzdCwgVmFyQ2hhciB9ID0gcmVxdWlyZSgnbXNzcWwnKVxyXG5cclxuY29uc3QgU3FsID0gcmVxdWlyZSgnLi4vQ09ORUNUSU9OREIvU3FsJylcclxuY29uc3QgeyBjYWRlbmFDb25leGlvbiB9ID0gcmVxdWlyZSgnLi4vLi4vY29uZmlnJylcclxuXHJcbmNvbnN0IHJvdXRlciA9IFJvdXRlcigpXHJcblxyXG5jb25zdCB7IHVzZXJTUUwsIHB3U1FMLCBkYlNRTCwgc2VydmVyU1FMLCBwb3J0U1FMIH0gPSBjYWRlbmFDb25leGlvblxyXG5cclxucm91dGVyLnBvc3QoJy8nLCBhc3luYyAocmVxLCByZXMpID0+IHtcclxuXHRjb25zdCB7IGVtYWlsVXN1YXJpbywgcHdVc3VhcmlvIH0gPSByZXEuYm9keVxyXG5cdGNvbnN0IHNxbCA9IG5ldyBTcWwodXNlclNRTCwgcHdTUUwsIGRiU1FMLCBzZXJ2ZXJTUUwsIHBvcnRTUUwpXHJcblx0aWYgKFxyXG5cdFx0ZW1haWxVc3VhcmlvID09PSB1bmRlZmluZWQgfHxcclxuXHRcdHB3VXN1YXJpbyA9PT0gdW5kZWZpbmVkIHx8XHJcblx0XHRlbWFpbFVzdWFyaW8gPT09ICcnIHx8XHJcblx0XHRwd1VzdWFyaW8gPT09ICcnXHJcblx0KSB7XHJcblx0XHRyZXMuanNvbih7IG1lc3NhZ2U6ICdBc2VndXJlc2UgZGUgZW52aWFyIGVsIGVtYWlsIHkgbGEgcGFzc3dvcmQnLCBvcE9LOiBmYWxzZSB9KVxyXG5cdFx0cmV0dXJuXHJcblx0fVxyXG5cdHRyeSB7XHJcblx0XHRjb25zdCBjb25uZWN0aW9uID0gYXdhaXQgc3FsLm9wZW5Db25uZWN0aW9uKCdzYXZlVXNlcicpXHJcblx0XHRjb25zdCBteVJlcXVlcyA9IG5ldyBSZXF1ZXN0KGNvbm5lY3Rpb24pXHJcblx0XHRteVJlcXVlcy5pbnB1dCgnZW1haWxVc3VhcmlvJywgVmFyQ2hhciwgZW1haWxVc3VhcmlvKVxyXG5cdFx0Y29uc3QgcHdFbmNyaXB0YWRhID0gYmNyaXB0Lmhhc2hTeW5jKHB3VXN1YXJpbywgMTApXHJcblx0XHRteVJlcXVlcy5pbnB1dCgncHdVc3VhcmlvJywgVmFyQ2hhciwgcHdFbmNyaXB0YWRhKVxyXG5cdFx0Y29uc3QgcmVzdWx0ID0gYXdhaXQgbXlSZXF1ZXMuZXhlY3V0ZSgncGFfaW5zZXJ0VXN1YXJpbycpXHJcblx0XHRpZiAocmVzdWx0KSB7XHJcblx0XHRcdHNxbC5jbG9zZUNvbm5lY3Rpb24oKVxyXG5cdFx0XHRyZXMuanNvbih7IG1lc3NhZ2U6ICdTdWNjZXNzZnVsIG9wZXJhdGlvbicsIG9wT0s6IHRydWUgfSlcclxuXHRcdH1cclxuXHR9IGNhdGNoIChlcnJvcikge1xyXG5cdFx0c3FsLmNsb3NlQ29ubmVjdGlvbigpXHJcblx0XHRyZXMuanNvbih7IG1lc3NhZ2U6IGVycm9yLm1lc3NhZ2UsIG9wT0s6IGZhbHNlIH0pXHJcblx0fVxyXG59KVxyXG5cclxubW9kdWxlLmV4cG9ydHMgPSByb3V0ZXJcclxuIiwiY29uc3QgZXhwcmVzcyA9IHJlcXVpcmUoJ2V4cHJlc3MnKVxyXG5jb25zdCBjb3JzID0gcmVxdWlyZSgnY29ycycpXHJcbmNvbnN0IG1vcmdhbiA9IHJlcXVpcmUoJ21vcmdhbicpXHJcbmNvbnN0IGRvdGVudiA9IHJlcXVpcmUoJ2RvdGVudicpXHJcblxyXG5tb2R1bGUuZXhwb3J0cyA9IGNsYXNzIFNlcnZlciB7XHJcblx0Y29uc3RydWN0b3IocG9ydCkge1xyXG5cdFx0ZG90ZW52LmNvbmZpZygpXHJcblx0XHR0aGlzLnBvcnQgPSBwcm9jZXNzLmVudi5QT1JUIHx8IHBvcnRcclxuXHRcdHRoaXMuc2VydmVyID0gZXhwcmVzcygpXHJcblx0fVxyXG5cclxuXHRtaWRlbHdhcmUoKSB7XHJcblx0XHR0aGlzLnNlcnZlci51c2UoY29ycygpKVxyXG5cdFx0dGhpcy5zZXJ2ZXIudXNlKGV4cHJlc3MuanNvbigpKVxyXG5cdFx0dGhpcy5zZXJ2ZXIudXNlKG1vcmdhbignZGV2JykpXHJcblx0XHR0aGlzLnNlcnZlci51c2UoZXhwcmVzcy51cmxlbmNvZGVkKHsgZXh0ZW5kZWQ6IGZhbHNlIH0pKVxyXG5cdFx0dGhpcy5zZXJ2ZXIudXNlKHJlcXVpcmUoJy4uL1JPVVRFUi9jaGVja0xvZ2luJykpXHJcblx0fVxyXG5cclxuXHRyb3V0ZXIoKSB7XHJcblx0XHR0aGlzLnNlcnZlci51c2UoJy9hcGkvc2lnbnVwJywgcmVxdWlyZSgnLi4vUk9VVEVSL3NpZ251cCcpKVxyXG5cdFx0dGhpcy5zZXJ2ZXIudXNlKCcvYXBpL2xvZ2luJywgcmVxdWlyZSgnLi4vUk9VVEVSL2xvZ2luJykpXHJcblx0XHR0aGlzLnNlcnZlci51c2UoJy9hcGkvZ2V0dXNlcmxvZ2luJywgcmVxdWlyZSgnLi4vUk9VVEVSL2dldFVzZXJMb2dpbicpKVxyXG5cdH1cclxuXHJcblx0ZXhlY3V0ZSgpIHtcclxuXHRcdHRoaXMubWlkZWx3YXJlKClcclxuXHRcdHRoaXMucm91dGVyKClcclxuXHRcdHRoaXMuc2VydmVyLmxpc3Rlbih0aGlzLnBvcnQsIGUgPT4gY29uc29sZS5sb2coYHNlcnZlciBjb3JyaWVuZG8gZW4gZWwgcHVlcnRvICR7dGhpcy5wb3J0fWApKVxyXG5cdH1cclxufVxyXG4iLCJjb25zdCBjYWRlbmFDb25leGlvbiA9IHtcclxuXHR1c2VyU1FMOiBwcm9jZXNzLmVudi5VU0VTUUwsXHJcblx0cHdTUUw6IHByb2Nlc3MuZW52LlBXU1FMLFxyXG5cdGRiU1FMOiBwcm9jZXNzLmVudi5EQlNRTCxcclxuXHRzZXJ2ZXJTUUw6IHByb2Nlc3MuZW52LlNFUlZFUlNRTCxcclxuXHRwb3J0U1FMOiBwcm9jZXNzLmVudi5QT1JUU1FMLFxyXG59XHJcblxyXG5jb25zdCBzZWNyZXQgPSAnYWJjMTIzLidcclxuXHJcbm1vZHVsZS5leHBvcnRzID0ge1xyXG5cdGNhZGVuYUNvbmV4aW9uLFxyXG5cdHNlY3JldCxcclxufVxyXG4iLCJjb25zdCBTZXJ2ZXIgPSByZXF1aXJlKCcuL1NSQy9TRVJWRVIvc2VydmVyJylcclxuXHJcbmNvbnN0IHNlcnZlciA9IG5ldyBTZXJ2ZXIoNTAwMClcclxuXHJcbnNlcnZlci5leGVjdXRlKClcclxuIiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiYmNyeXB0XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImNvcnNcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwiZG90ZW52XCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcImV4cHJlc3NcIik7IiwibW9kdWxlLmV4cG9ydHMgPSByZXF1aXJlKFwianNvbndlYnRva2VuXCIpOyIsIm1vZHVsZS5leHBvcnRzID0gcmVxdWlyZShcIm1vcmdhblwiKTsiLCJtb2R1bGUuZXhwb3J0cyA9IHJlcXVpcmUoXCJtc3NxbFwiKTsiXSwic291cmNlUm9vdCI6IiJ9