const AuthService = require('../../services/auth')

module.exports = class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body || {}

      if (!email || !password) {
        return res.status(400).json({
          error: 'INVALID_REQUEST_BODY',
          message: 'email and password are required',
        })
      }

      const result = await AuthService.login({ email, password })

      if (!result) {
        return res.status(401).json({
          error: 'INVALID_CREDENTIALS',
          message: 'email or password is incorrect',
        })
      }

      return res.status(200).json({
        data: result,
      })
    } catch (error) {
      // In a real app we might log the error or pass to a centralized error handler
      return res.status(500).json({
        error: 'INTERNAL_SERVER_ERROR',
        message: 'Something went wrong while processing login',
      })
    }
  }
}

