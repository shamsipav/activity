import { query } from '$lib/db'
import type { RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ params }) => {
    try {
        const date = params.date
        const result = await query('SELECT * FROM public.activities WHERE DATE = $1', [date])
        console.log(result.rows)


        return new Response(JSON.stringify(result.rows))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}) satisfies RequestHandler