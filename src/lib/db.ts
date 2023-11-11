import pkg from 'pg'

const { Pool } = pkg

const dbConfig = {
    host: '172.24.176.61',
    port: '5432',
    user: 'postgres',
    password:'postgresroot',
    database: 'activity',
    // host: 'postgres.c74073.h2',
    // port: '5432',
    // user: 'c74073_activity_na4u_ru',
    // password: 'YiPyuQemnabaq31',
    // database: 'c74073_activity_na4u_ru'
}

console.log(dbConfig)

const pool = new Pool(dbConfig)

export async function query(text: string, params: any) {
    const client = await pool.connect()
    try {
        const result = await client.query(text, params)
        return result
    } finally {
        client.release()
    }
}