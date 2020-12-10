const mssql = require('mssql')

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
				encrypt: false,
			},
			connectionTimeOut: 150000,
			driver: 'tedious',
			stream: false,
			pool: {
				max: 20,
				min: 0,
				idleTimeoutMillis: 30000,
			},
		}
		this.conexiones = {}
	}

	async openConnection(name) {
		if (!Object.prototype.hasOwnProperty.call(this.conexiones, name)) {
			const newConexion = new mssql.ConnectionPool(this.uri)
			const close = newConexion.close.bind(newConexion)
			newConexion.close = (...args) => {
				delete this.conexiones[name]
				return close(...args)
			}
			await newConexion.connect()
			this.conexiones[name] = newConexion
			return this.conexiones[name]
		}
	}

	closeConnection() {
		return Promise.all(
			Object.values(this.conexiones).map(pool => {
				return pool.close()
			})
		)
	}
}
