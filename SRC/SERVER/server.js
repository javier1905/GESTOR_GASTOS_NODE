const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const dotenv = require('dotenv')

module.exports = class Server {
	constructor(port) {
		dotenv.config()
		this.port = process.env.PORT || port
		this.server = express()
	}

	midelware() {
		this.server.use(cors())
		this.server.use(express.json())
		this.server.use(morgan('dev'))
		this.server.use(express.urlencoded({ extended: false }))
		this.server.use(require('../ROUTER/checkLogin'))
	}

	router() {
		this.server.use('/api/signup', require('../ROUTER/signup'))
		this.server.use('/api/login', require('../ROUTER/login'))
		this.server.use('/api/getuserlogin', require('../ROUTER/getUserLogin'))
		this.server.use('/api/category', require('../ROUTER/categorias'))
		this.server.use('/api/operation', require('../ROUTER/operaciones'))
	}

	execute() {
		this.midelware()
		this.router()
		this.server.listen(this.port, e => console.log(`server corriendo en el puerto ${this.port}`))
	}
}
