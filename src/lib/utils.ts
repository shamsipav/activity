import type { IActivity, IFood, IStep } from './types'

export const getStats = (allActivities: IActivity[], foodsByDate: IFood[], steps: IStep[]) => {
    const groupedActivities = allActivities.reduce((result, activity) => {
        const dateString = new Date(activity.date)
        if (result[dateString]) {
            result[dateString].push(activity)
        } else {
            result[dateString] = [activity]
        }
        return result
    }, {})

    const calculateBurnedCalories = (duration: number, speed: number) => {
        const met = interpolate(speed, [4.8, 8.5], [2.5, 4.9])
        return Math.round(48 * met * 0.0175 * duration)
    }

    const interpolate = (value: number, inputRange: [number, number], outputRange: [number, number]) => {
        const [inputMin, inputMax] = inputRange
        const [outputMin, outputMax] = outputRange
        return outputMin + ((outputMax - outputMin) * (value - inputMin)) / (inputMax - inputMin)
    }

    const calculateTotalCalories = (activities: IActivity[]) => {
        let totalCalories = 0
        activities.forEach((activity) => {
            totalCalories += calculateBurnedCalories(activity.duration, activity.speed)
        })
        return totalCalories
    }

    const foodInDay = (date: Date) => {
        const finedFood = foodsByDate.find(f => new Date(f.date).toLocaleDateString() == new Date(date).toLocaleDateString())
        return +finedFood?.calories || 0
    }

    const stepsInDay = (date: Date) => {
        if (steps) {
            const finedSteps = steps.find(f => new Date(f.date).toLocaleDateString() == new Date(date).toLocaleDateString())
            return (0.5 * 48 * +finedSteps?.steps) || 0
        }

        return 0
    }

    let totalReceivedCalories = 0
    let totalSpentCalories = 0
    let totalSpentStepCalories = 0
    let receivedCount = 0
    let spentCount = 0
    let spentStepCount = 0

    console.log('Start utils GetStats debug:')
    console.log('----------------------------')

    Object.entries(groupedActivities).forEach(([date, activities]) => {
        const foodInDate = foodInDay(activities[0]?.date)
        console.log('foodInDate: ', foodInDate)
        if (foodInDate > 0) {
            totalReceivedCalories += foodInDate
            receivedCount++
        }

        const caloriesInDate = calculateTotalCalories(activities)
        console.log('caloriesInDate: ', caloriesInDate)
        if (caloriesInDate > 0) {
            totalSpentCalories += caloriesInDate
            spentCount++
        }

        const stepsInDate = stepsInDay(activities[0]?.date)
        console.log('stepsInDate: ', stepsInDate)
        if (stepsInDate > 0) {
            totalSpentStepCalories += stepsInDate
            spentStepCount++
        }
    })

    console.log('')

    // TODO: Сделать адекватные названия
    const averageReceivedCalories = totalReceivedCalories ? Math.round(totalReceivedCalories / receivedCount) : 0
    const averageSpentTrainCalories = totalSpentCalories ? Math.round(totalSpentCalories / spentCount) : 0
    const averageSpentStepCalories = totalSpentStepCalories ? Math.round(totalSpentStepCalories / spentStepCount) : 0

    console.log('averageReceivedCalories: ', averageReceivedCalories)
    console.log('averageSpentCalories: ', averageSpentTrainCalories)
    console.log('averageSpentStepCalories: ', averageSpentStepCalories)

    console.log('')

    console.log('End utils GetStats debug:')
    console.log('----------------------------')

    return { averageReceivedCalories, averageSpentCalories: averageSpentStepCalories + averageSpentTrainCalories }
}