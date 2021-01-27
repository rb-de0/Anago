export type Interval = 'S15' | 'M1' | 'M15' | 'M30' | 'H1' | 'H6' | 'D'

export class IntervalUtil {
    static secondsFromString(interval: string): number {
        return this.secondsFromInterval(this.intervalFromString(interval))
    }

    static intervalFromString(interval: string): Interval {
        switch (interval) {
            case 'S15':
                return 'S15'
            case 'M1':
                return 'M1'
            case 'M15':
                return 'M15'
            case 'M30':
                return 'M30'
            case 'H1':
                return 'H1'
            case 'H6':
                return 'H6'
            case 'D':
                return 'D'
        }
        return 'S15'
    }

    static secondsFromInterval(interval: Interval): number {
        switch (interval) {
            case 'S15':
                return 15
            case 'M1':
                return 60
            case 'M15':
                return 60 * 15
            case 'M30':
                return 60 * 30
            case 'H1':
                return 60 * 60
            case 'H6':
                return 60 * 60 * 6
            case 'D':
                return 60 * 60 * 24
        }
    }
}
