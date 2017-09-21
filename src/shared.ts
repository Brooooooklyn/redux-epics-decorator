import { Reducer } from 'redux-actions'

export const currentReducers = new Map<string, Reducer<any, any>>()
export const currentSetEffectQueue: ((...args: any[]) => any)[] = []
