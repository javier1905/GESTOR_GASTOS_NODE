const cadenaConexion = {
	userSQL: process.env.USESQL,
	pwSQL: process.env.PWSQL,
	dbSQL: process.env.DBSQL,
	serverSQL: process.env.SERVERSQL,
	portSQL: process.env.PORTSQL,
}

const secret = 'abc123.'

module.exports = {
	cadenaConexion,
	secret,
}
