import { query } from '$lib/db'
import { getLocalISOTimeString, replaceCommaWithDot } from '$lib/utils'
import type { RequestHandler } from './$types'
import { v4 as uuidv4 } from 'uuid'

export const POST = (async ({ request }) => {
    const form = await request.formData()
    const duration = String(form.get('duration'))
    let speed = String(form.get('speed'))
    let date = getLocalISOTimeString(new Date())
    speed = replaceCommaWithDot(speed)

    if (form.get('date') != null) {
        date = form.get('date')
    }

    const guid = uuidv4()

    try {
        await query('INSERT INTO public.activities (id, duration, speed, date) VALUES ($1, $2, $3, $4)', [guid, duration, speed, date])
        return new Response(JSON.stringify({ speed, duration, date, id: guid }))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}) satisfies RequestHandler

export const GET = async () => {
    try {
        const result = await query('SELECT * FROM public.activities ORDER BY date DESC')
        return new Response(JSON.stringify(result.rows))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}