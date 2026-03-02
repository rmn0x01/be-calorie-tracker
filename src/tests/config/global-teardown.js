const { execSync } = require('child_process')

const env = { ...process.env, NODE_ENV: 'test' }

module.exports = async () => {
  execSync('npx sequelize-cli db:drop', {
    env,
    stdio: 'inherit',
  })
}
