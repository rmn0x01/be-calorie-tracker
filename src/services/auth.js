const bcrypt = require('bcrypt')
const { v4: uuidv4 } = require('uuid')

const UserService = require('./user')
const UserToken = require('../models/userToken')

const AuthService = {
  async login({ email, password }) {
    const user = await UserService.findByEmail(email)

    if (!user) {
      return null
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return null
    }

    const token = uuidv4()

    await UserToken.create({
      userId: user.id,
      token,
    })

    const userData = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
    }

    return {
      token,
      user: userData,
    }
  },
}

module.exports = AuthService

