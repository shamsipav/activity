import { query } from '$lib/db'
import type { RequestHandler } from '@sveltejs/kit'

export const DELETE = (async ({ params }) => {
    try {
        const guid = params.id
        const result = await query('DELETE FROM public.activities WHERE id = $1', [guid])

        return new Response(JSON.stringify(result.rows))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}) satisfies RequestHandler

export const PUT = (async ({ request }) => {
    const form = await request.formData()
    const duration = String(form.get('duration'))
    const speed = String(form.get('speed'))
    const guid = String(form.get('id'))

    try {
        const queryStr = 'UPDATE public.activities SET duration = $1, speed = $2 WHERE id = $3'
        const values = [duration, speed, guid] // Пример значений для обновления
        await query(queryStr, values)
        console.log('database update [id]')
        return new Response(JSON.stringify({ speed, duration, id: guid }))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}) satisfies RequestHandler