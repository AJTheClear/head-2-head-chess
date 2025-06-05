import 'dotenv/config'
import convict from 'convict'
//var convict = require('convict');

export const config = convict({
  database: {
    host: {
      doc: 'Host',
      env: 'DB_HOST',
      type: '*',
      default: 'localhost',
    },
    port: {
      doc: 'Port',
      env: 'DB_PORT',
      type: '*',
      default: 5432,
    },
    username: {
      doc: 'Username',
      env: 'DB_USERNAME',
      type: '*',
      default: 'plh',
    },
    password: {
      doc: 'Password',
      env: 'DB_PASSWORD',
      type: '*',
      default: '123456'
    },
    name: {
      doc: 'DBName',
      env: 'DB_NAME',
      type: '*',
      default: 'chess'
    },
  },
})

config.validate()