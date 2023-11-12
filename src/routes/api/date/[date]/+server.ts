import { query } from '$lib/db'
import type { IUnion } from '$lib/types'
import type { RequestHandler } from '@sveltejs/kit'

export const GET = (async ({ params }) => {
    try {
        const date = params.date
        const activitiesByDateResult = await query('SELECT * FROM public.activities WHERE DATE = $1', [date])
        const stepsByDateResult = await query('SELECT * FROM public.steps WHERE DATE = $1', [date])
        const caloriesByDateResult = await query('SELECT * FROM public.foods WHERE DATE = $1', [date])
        
        const unionObject: IUnion = {
            activities: activitiesByDateResult.rows,
            steps: stepsByDateResult.rows,
            foods: caloriesByDateResult.rows,
            date: undefined
        }


        return new Response(JSON.stringify(unionObject))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}) satisfies RequestHandler