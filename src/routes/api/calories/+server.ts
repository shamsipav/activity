import { query } from '$lib/db'
import type { RequestHandler } from './$types'
import { v4 as uuidv4 } from "uuid";

export const POST = (async ({ request }) => {
    const form = await request.formData()
    const calories = String(form.get('calories'))
    let date = form.get('date')

    try {
        let exist = await query('SELECT * FROM public.foods WHERE date = $1', [date])
        
        if (exist.rows.length > 0) {
            const queryStr = 'UPDATE public.foods SET calories = $1 WHERE date = $2'
            const values = [calories, date]
            await query(queryStr, values)
        } else {
            await query('INSERT INTO public.foods (date, calories) VALUES ($1, $2)', [date, calories])
        }

        return new Response(JSON.stringify({ date, calories }))
    } 
    catch (error) 
    {
        console.error(error)
        return new Response(error)
    }
}) satisfies RequestHandler

export const GET = async () => {
    try {
        const result = await query('SELECT * FROM public.activities');
        return new Response(JSON.stringify(result.rows))
    } 
    catch (error) 
    {
        console.error(error)
        return new Response(error)
    }
}