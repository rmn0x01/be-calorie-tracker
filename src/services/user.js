const User = require('../models/user')

const UserService = {
  async findById(id) {
    if (!id) {
      return null
    }

    const user = await User.findByPk(id)
    return user
  },

  async findByEmail(email) {
    if (!email) {
      return null
    }

    const user = await User.findOne({
      where: { email },
    })

    return user
  },

  async updateById(id, updates) {
    if (!id || !updates) {
      return null
    }

    const [updatedRowsCount] = await User.update(updates, {
      where: { id },
    })

    return updatedRowsCount > 0
  },
}

module.exports = UserService

