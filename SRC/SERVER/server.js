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
	}

	router() {}

	execute() {
		this.midelware()
		this.router()
		this.server.listen(this.port, e => console.log(`server corriendo en el puerto ${this.port}`))
	}
}
