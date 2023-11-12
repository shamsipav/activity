import { query } from '$lib/db'
import type { IActivity, IFood, IStep } from '$lib/types'

export async function load() {
    try {

        const result: IActivity[] = await query('SELECT * FROM public.activities WHERE date = CURRENT_DATE')
        const foodsByDate: IFood[] = await query('SELECT * FROM public.foods ORDER BY date DESC')
        const allActivities: IActivity[] = await query('SELECT * FROM public.activities ORDER BY date DESC')
        const steps: IStep[] = await query('SELECT * FROM public.steps ORDER BY date DESC')

        return {
            activities: result.rows,
            foodsByDate: foodsByDate.rows,
            allActivities: allActivities.rows,
            steps: steps.rows
        }
    }
    catch(error)
    {
        console.log(error)
        return {
            activities: {},
            foodsByDate: {},
            allActivity: {},
            steps: {}
        }
    }
}