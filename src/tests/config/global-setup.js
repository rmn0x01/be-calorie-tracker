const { execSync } = require('child_process')

const env = { ...process.env, NODE_ENV: 'test' }

function run(cmd, ignoreError = false) {
  try {
    execSync(cmd, { env, stdio: 'inherit' })
  } catch (e) {
    if (!ignoreError) throw e
  }
}

module.exports = async () => {
  run('npx sequelize-cli db:drop', true)
  run('npx sequelize-cli db:create && npx sequelize-cli db:migrate')
}
