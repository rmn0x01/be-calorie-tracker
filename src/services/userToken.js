const UserToken = require('../models/userToken')

const userTokenService = {
  async findUserTokenByToken(token) {
    if (!token || typeof token !== 'string') {
      return null
    }

    const trimmed = token.trim()
    if (!trimmed) {
      return null
    }

    const record = await UserToken.findOne({
      where: { token: trimmed },
    })

    return record
  },
}

module.exports = userTokenService
