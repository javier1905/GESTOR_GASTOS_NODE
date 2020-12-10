const { Router } = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

const Sql = require('../CONECTIONDB/Sql')
const { cadenaConexion } = require('../../config')
const { secret } = require('../../config')

const router = Router()

router.post('/', async (req, res) => {
	const { emailUsuario, pwUsuario } = req.body
	if (
		emailUsuario === undefined ||
		pwUsuario === undefined ||
		emailUsuario === '' ||
		pwUsuario === ''
	)
		return res.json({ message: 'Email y password son obligatorios' })
	const { userSQL, pwSQL, dbSQL, serverSQL, portSQL } = cadenaConexion
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	try {
		const { Request, VarChar } = require('mssql')
		const connection = await sql.openConnection('')
		const myRequest = new Request(connection)
		myRequest.input('emailUsuario', VarChar, emailUsuario)
		const result = await myRequest.execute('pa_login')
		if (result) {
			sql.closeConnection()
			if (result.rowsAffected[0] === 0)
				return res.json({ message: 'Usuario Inexitente', logOK: false })
			const pwEncriptada = result.recordset[0].pwUsuario
			if (!bcrypt.compareSync(pwUsuario, pwEncriptada))
				return res.json({ message: 'Pw incorrecta', logOK: false })
			const usuario = {
				idUsuario: result.recordset[0].idUsuario,
				emailUsuario: result.recordset[0].emailUsuario,
			}
			jwt.sign(usuario, secret, { expiresIn: '0.5h' }, (err, token) => {
				if (err) res.json({ message: err.message, logOK: false })
				else res.json({ message: 'Log exitoso', logOK: true, token: token })
			})
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, logOK: false })
	}
})

module.exports = router
