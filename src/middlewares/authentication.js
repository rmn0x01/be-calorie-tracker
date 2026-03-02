const userTokenService = require('../services/userToken')

async function authentication(req, res, next) {
  try {
    const authHeader = req.headers.authorization

    if (!authHeader || typeof authHeader !== 'string') {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Authorization header is required',
      })
    }

    const parts = authHeader.trim().split(/\s+/)
    if (parts[0] !== 'Bearer' || !parts[1]) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Invalid authorization format. Use: Bearer <token>',
      })
    }

    const token = parts[1]
    const userToken = await userTokenService.findUserTokenByToken(token)

    if (!userToken) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: 'Token is invalid or expired',
      })
    }

    req.userId = userToken.userId
    req.userToken = userToken
    next()
  } catch (err) {
    return res.status(500).json({
      error: 'INTERNAL_SERVER_ERROR',
      message: 'Authentication failed',
    })
  }
}

module.exports = authentication
