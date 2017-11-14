import { allDeps } from './Module'

export const Injectable = () =>
  (target: any) => {
    allDeps.add(target)
    return target
  }
