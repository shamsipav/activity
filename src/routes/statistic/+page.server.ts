import { query } from '$lib/db'
import type { IActivity } from '$lib/types'

export async function load() {
    try {

        const result: IActivity[] = await query('SELECT * FROM public.activities ORDER BY date DESC')

        return {
            activities: result.rows,
        }
    }
    catch(error)
    {
        console.log(error)
        return {
            activities: {},
        }
    }
}