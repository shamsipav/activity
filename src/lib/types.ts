export interface IActivity {
    speed: number;
    duration: number;
    id: string;
    date: Date
}

export interface IFood {
    calories: number;
    date: Date
}

export interface IStep {
    steps: number;
    date: Date
}

export interface IModal {
    open: () => void,
    close: () => void,
    toggle: () => void
}

export interface IUnion {
    steps: IStep[]
    foods: IFood[]
    activities: IActivity[]
    date: Date | undefined
}