import { knexSnakeCaseMappers } from 'objection'
import { config } from './db/src/config.js'

export const knexConfig = {
  development: {
    client: 'postgres',
    connection: {
      host: config.get('database.host'),
      port: config.get('database.port'),
      user: config.get('database.username'),
      password: config.get('database.password'),
      database: config.get('database.name')
    },
    ...knexSnakeCaseMappers()
  }
}

export default knexConfig