const { Router } = require('express')
const bcript = require('bcrypt')
const { Request, VarChar } = require('mssql')

const Sql = require('../CONECTIONDB/Sql')
const { cadenaConexion } = require('../../config')

const router = Router()

const { userSQL, pwSQL, dbSQL, serverSQL, portSQL } = cadenaConexion

router.post('/', async (req, res) => {
	const { emailUsuario, pwUsuario } = req.body
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	if (
		emailUsuario === undefined ||
		pwUsuario === undefined ||
		emailUsuario === '' ||
		pwUsuario === ''
	) {
		res.json({ message: 'Asegurese de enviar el email y la password', opOK: false })
		return
	}
	try {
		const connection = await sql.openConnection('saveUser')
		const myReques = new Request(connection)
		myReques.input('emailUsuario', VarChar, emailUsuario)
		const pwEncriptada = bcript.hashSync(pwUsuario, 10)
		myReques.input('pwUsuario', VarChar, pwEncriptada)
		const result = await myReques.execute('pa_insertUsuario')
		if (result) {
			sql.closeConnection()
			res.json({ message: 'Successful operation', opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

module.exports = router
