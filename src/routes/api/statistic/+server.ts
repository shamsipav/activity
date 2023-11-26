import { query } from '$lib/db'
import type { IUnion } from '$lib/types'

export const GET = async () => {
    try {
        const activitiesResult = await query('SELECT * FROM public.activities')
        const caloriesResult = await query('SELECT * FROM public.foods')
        const stepsResult = await query('SELECT * FROM public.steps')

        const unionObject: IUnion = {
            activities: activitiesResult.rows,
            steps: caloriesResult.rows,
            foods: stepsResult.rows,
            date: undefined
        }


        return new Response(JSON.stringify(unionObject))
    }
    catch (error)
    {
        console.error(error)
        return new Response(error)
    }
}