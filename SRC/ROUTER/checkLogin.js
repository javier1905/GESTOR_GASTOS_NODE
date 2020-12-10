const jwt = require('jsonwebtoken')

const { secret } = require('../../config')

module.exports = function (req, res, next) {
	if (req.path === '/api/login' || req.path === '/api/signup') return next()
	if (!req.headers.authorization)
		return res.json({ message: 'Envie el token en el headers', logOK: false })
	const token = String(req.headers.authorization).split(' ')[1]
	jwt.verify(token, secret, error => {
		if (error) return res.json({ message: 'Error token invalido', logOK: false })
		else return next()
	})
}
