const { Router } = require('express')
const jwt = require('jsonwebtoken')
const { secret } = require('../../config')

const router = Router()

router.get('/', (req, res) => {
	const token = String(req.headers.authorization).split(' ')[1]
	jwt.verify(token, secret, (error, usuario) => {
		if (error) res.json({ message: error.message, logOK: false })
		else res.json({ usuario, logOK: true })
	})
})

module.exports = router
