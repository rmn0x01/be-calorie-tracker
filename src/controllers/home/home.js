const HomeService = require('../../services/home')

module.exports = class Controller {
  static async getHome(req, res) {
    const home = await HomeService.printHome()
    return res.status(200).json({
      data: home
    })
  }
}