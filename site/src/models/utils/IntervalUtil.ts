export default class IntervalUtil {
    readonly relations: IntervalPair[] = [
        new IntervalPair('S15', '15秒'),
        new IntervalPair('M1', '1分'),
        new IntervalPair('M15', '15分'),
        new IntervalPair('M30', '30分'),
        new IntervalPair('H1', '1時間'),
        new IntervalPair('H6', '6時間'),
        new IntervalPair('D', '1日'),
    ]

    convertToDomainValue(interval: string): string | null {
        const target = this.relations.find((r) => {
            return r.display == interval
        })
        if (target == null) {
            return null
        }
        return target.domain
    }

    convertToDisplayValue(interval: string): string | null {
        const target = this.relations.find((r) => {
            return r.domain == interval
        })
        if (target == null) {
            return null
        }
        return target.display
    }
}

class IntervalPair {
    domain: string
    display: string

    constructor(domain: string, display: string) {
        this.domain = domain
        this.display = display
    }
}
