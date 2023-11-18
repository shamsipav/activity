import { query } from '$lib/db'
import type { RequestHandler } from './$types'

export const POST = (async ({ request }) => {
    const form = await request.formData()
    const steps = String(form.get('steps'))
    const date = form.get('date')
    console.log('DATE BEFORE POST CALORIES: ', date)

    try {
        const exist = await query('SELECT * FROM public.steps WHERE date = $1', [date])

        if (exist.rows.length > 0) {
            const queryStr = 'UPDATE public.steps SET steps = $1 WHERE date = $2'
            const values = [steps, date]
            await query(queryStr, values)
        } else {
            await query('INSERT INTO public.steps (date, steps) VALUES ($1, $2)', [date, steps])
        }

        return new Response(JSON.stringify({ date, steps }))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}) satisfies RequestHandler

export const GET = async () => {
    try {
        const result = await query('SELECT * FROM public.steps')
        return new Response(JSON.stringify(result.rows))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}