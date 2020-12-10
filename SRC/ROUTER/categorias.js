const { Router } = require('express')
const { Request, VarChar, Int } = require('mssql')

const Sql = require('../CONECTIONDB/Sql')
const { cadenaConexion } = require('../../config')
const { userSQL, pwSQL, dbSQL, serverSQL, portSQL } = cadenaConexion

const router = Router()

router.post('/list', async (req, res) => {
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	const { idUsuario } = req.body
	try {
		const connection = await sql.openConnection('listCategorias')
		const myRequest = new Request(connection)

		myRequest.input('idUsuario', Int, idUsuario)
		const result = await myRequest.execute('pa_listaCategorias')
		if (result) {
			sql.closeConnection()
			res.json({ listCategorias: result.recordset, opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

router.post('/save', async (req, res) => {
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	const { descripcionCategoria, idUsuario } = req.body

	console.log(descripcionCategoria, idUsuario)

	if (descripcionCategoria === undefined || descripcionCategoria === '')
		return res.json({ message: 'La descripcion de la categoria es requerida', opOK: false })
	try {
		const connection = await sql.openConnection('saveCategoria')
		const myRequest = new Request(connection)

		myRequest.input('idUsuario', Int, idUsuario)
		myRequest.input('descripcionCategoria', VarChar, descripcionCategoria)
		const result = await myRequest.execute('pa_guardarCategoria')

		if (result) {
			sql.closeConnection()
			res.json({ message: 'Categoria guardada exitosamente', opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

router.put('/update', async (req, res) => {
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	const { idCategoria, descripcionCategoria } = req.body

	if (
		descripcionCategoria === undefined ||
		descripcionCategoria === '' ||
		idCategoria === undefined ||
		idCategoria === ''
	)
		return res.json({
			message: 'El id y la descripcion de la categoria son requeridas',
			opOK: false,
		})
	try {
		const connection = await sql.openConnection('updateCategoria')
		const myRequest = new Request(connection)

		myRequest.input('idCategoria', Int, idCategoria)
		myRequest.input('descripcionCategoria', VarChar, descripcionCategoria)
		const result = await myRequest.execute('pa_actualizarCategoria')

		if (result) {
			sql.closeConnection()
			if (result.rowsAffected[0] === 0)
				res.json({
					message: `No se encontro ninguna categoria con el id ${idCategoria}`,
					opOK: false,
				})
			else res.json({ message: 'Categoria actualizada exitosamente', opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

router.put('/delete', async (req, res) => {
	const sql = new Sql(userSQL, pwSQL, dbSQL, serverSQL, portSQL)
	const { idCategoria } = req.body

	if (idCategoria === undefined || idCategoria === '')
		return res.json({
			message: 'El id de la categoria es requerida',
			opOK: false,
		})
	try {
		const connection = await sql.openConnection('deleteCategoria')
		const myRequest = new Request(connection)

		myRequest.input('idCategoria', Int, idCategoria)
		const result = await myRequest.execute('pa_eliminaCategoria')

		if (result) {
			sql.closeConnection()
			if (result.rowsAffected[0] === 0)
				res.json({
					message: `No se encontro ninguna categoria con el id ${idCategoria}`,
					opOK: false,
				})
			else res.json({ message: 'Categoria eliminada exitosamente', opOK: true })
		}
	} catch (error) {
		sql.closeConnection()
		res.json({ message: error.message, opOK: false })
	}
})

module.exports = router
