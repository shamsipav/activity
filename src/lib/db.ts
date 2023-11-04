import { Pool } from 'pg'
import { env } from '$env/dynamic/private'

const dbConfig = {
    host: env.HOST,
    port: env.PORT,
    user: env.LOGIN,
    password: env.PASSWORD,
    database: env.DATABASE,
}


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