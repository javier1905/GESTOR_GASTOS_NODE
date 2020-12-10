const { Router } = require('express')
const mssql = require('mssql')

const Sql = require('../CONECTIONDB/Sql')
const { cadenaConexion } = require('../../config')
const { userSQL, pwSQL, dbSQL, serverSQL, portSQL } = cadenaConexion

const router = Router()

router.post('/list', async (req, res) => {
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	const { idUsuario } = req.body
	if (idUsuario === undefined || idUsuario === '')
		return res.json({ message: 'El id el usuario es requerido', opOK: false })

	try {
		const connection = await sql.openConnection('listOperaciones')
		const myRequest = new mssql.Request(connection)

		myRequest.input('idUsuario', mssql.Int, idUsuario)
		const result = await myRequest.execute('pa_listaOperaciones')

		if (result) {
			sql.closeConnection()
			res.json({ listOperaciones: result.recordset, opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

router.post('/save', async (req, res) => {
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)

	const { conceptoOperacion, montoOperacion, fechaOperacion, tipoOperacion, idUsuario, idCategoria } = req.body

	try {
		const connection = await sql.openConnection('saveOperacion')
		const myRequest = new mssql.Request(connection)

		myRequest.input('conceptoOperacion', mssql.VarChar, conceptoOperacion)
		myRequest.input('montoOperacion', mssql.Real, montoOperacion)
		myRequest.input('fechaOperacion', mssql.Date, fechaOperacion)
		myRequest.input('tipoOperacion', mssql.Bit, tipoOperacion)
		myRequest.input('idUsuario', mssql.Int, idUsuario)
		myRequest.input('idCategoria', mssql.Int, idCategoria)

		const result = await myRequest.execute('pa_guardarOperacion')

		if (result) {
			sql.closeConnection()
			res.json({ message: 'Operacion guardada exitosamente', opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

router.put('/update', async (req, res) => {
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	const { idOperacion, conceptoOperacion, montoOperacion, fechaOperacion, idCategoria } = req.body

	try {
		const connection = await sql.openConnection('updateOperacion')
		const myRequest = new mssql.Request(connection)

		myRequest.input('idOperacion', mssql.Int, idOperacion)
		myRequest.input('conceptoOperacion', mssql.VarChar, conceptoOperacion)
		myRequest.input('montoOperacion', mssql.Real, montoOperacion)
		myRequest.input('fechaOperacion', mssql.Date, fechaOperacion)
		myRequest.input('idCategoria', mssql.Int, idCategoria)

		const result = await myRequest.execute('pa_actualizarOperacion')

		if (result) {
			sql.closeConnection()
			if (result.rowsAffected[0] === 0)
				res.json({
					message: `No se encontro ninguna operacion con el id ${idOperacion}`,
					opOK: false,
				})
			else res.json({ message: 'Operacion actualizada exitosamente', opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

router.put('/delete', async (req, res) => {
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	const { idOperacion } = req.body

	if (idOperacion === undefined || idOperacion === '')
		return res.json({
			message: 'El id de la operacion es requerida',
			opOK: false,
		})
	try {
		const connection = await sql.openConnection('deleteOperacion')
		const myRequest = new mssql.Request(connection)

		myRequest.input('idOperacion', mssql.Int, idOperacion)
		const result = await myRequest.execute('pa_eliminaOperacion')

		if (result) {
			sql.closeConnection()
			if (result.rowsAffected[0] === 0)
				res.json({
					message: `No se encontro ninguna operacion con el id ${idOperacion}`,
					opOK: false,
				})
			else res.json({ message: 'Operacion eliminada exitosamente', opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

module.exports = router
