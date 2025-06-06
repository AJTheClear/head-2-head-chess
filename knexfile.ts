import { knexSnakeCaseMappers } from 'objection'

export const config = {
  development: {
    client: 'postgres',
    connection: {
      host: 'localhost',
      port: 5432,
      user: 'plh',
      password: '123456',
      database: 'chess'
    },
    ...knexSnakeCaseMappers()
  }
}

export default config