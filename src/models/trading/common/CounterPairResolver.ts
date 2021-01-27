import Tick from 'models/trading/core/Tick'

/**
 * 取引通貨ペアをアカウントの通貨単位として計算するための変換処理を担う
 */
export default class CounterPairResolver {
    private accountCurrency: string
    private patterns: CounterRateResolvePattern[]

    constructor(accountCurrency: string) {
        this.accountCurrency = accountCurrency
        this.patterns = [new SameCurrency(), new RequireBridgePair(), new RequireHardCurrencyPairs()]
    }

    /**
     * allInstrumentsに指定された通貨ペアを利用して, instrumentsの全ての通貨ペアをaccountCurrencyで計算するために必要な通貨ペアを取得する
     * 解決できない場合は例外を投げる
     * @param allInstruments サービスで利用可能なすべての通貨ペア
     * @param instruments 利用したい通貨ペア
     */
    resolveRequiredInstruments(allInstruments: string[], instruments: string[]): string[] {
        const results = instruments
        for (const instrument of instruments) {
            const resolvePairs = this.pairs(instrument)
            const matchedPattern = this.patterns.find((p) => {
                return p.isMatched(allInstruments, resolvePairs)
            })
            if (matchedPattern != null) {
                const result = matchedPattern.requiredInstruments(allInstruments, resolvePairs)
                for (const i of result) {
                    const alreadyPushed = results.find((r) => {
                        return r === i
                    })
                    if (alreadyPushed == null) {
                        results.push(i)
                    }
                }
            }
        }
        return results
    }

    resolveRate(tick: Tick, instrument: string): number {
        const allInstruments = tick.values.map((v) => {
            return v.instrument
        })
        const resolvePairs = this.pairs(instrument)
        const matchedPattern = this.patterns.find((p) => {
            return p.isMatched(allInstruments, resolvePairs)
        })
        if (matchedPattern == null) {
            throw new Error('CouterRateの計算をするための通貨ペアが存在しません')
        }
        return matchedPattern.resolveRate(tick, resolvePairs)
    }

    private pairs(pairName: string): ResolvePairs {
        const splited = pairName.split('_')
        const target = splited[splited.length - 1]
        return new ResolvePairs(target, this.accountCurrency)
    }
}

/**
 * target: 変換対象の通貨
 * account: アカウント通貨
 */
class ResolvePairs {
    readonly target: string
    readonly account: string

    constructor(target: string, account: string) {
        this.target = target
        this.account = account
    }

    instrument(): string {
        return this.target + '_' + this.account
    }
}

/**
 * 為替レートを取得するための方法
 */
interface CounterRateResolvePattern {
    isMatched(allInstruments: string[], pairs: ResolvePairs): boolean
    resolveRate(tick: Tick, pairs: ResolvePairs): number
    requiredInstruments(allInstruments: string[], pairs: ResolvePairs): string[]
}

/**
 * 通貨単位が同じ場合は変換しない
 */
class SameCurrency implements CounterRateResolvePattern {
    isMatched(_: string[], pairs: ResolvePairs): boolean {
        return pairs.target === pairs.account
    }

    resolveRate(): number {
        return 1.0
    }

    requiredInstruments(): string[] {
        return []
    }
}

/**
 * EUR_USDをJPYに変換したい場合, USD_JPYのレートを使えば計算可能
 */
class RequireBridgePair implements CounterRateResolvePattern {
    isMatched(allInstruments: string[], pairs: ResolvePairs): boolean {
        const matched = allInstruments.find((i) => {
            return i === pairs.instrument()
        })
        return matched != null
    }

    resolveRate(tick: Tick, pairs: ResolvePairs): number {
        const matched = tick.get(pairs.instrument())
        if (matched == null) {
            throw new Error('CouterRateの計算をするための通貨ペアが存在しません')
        }
        return matched.mid()
    }

    requiredInstruments(allInstruments: string[], pairs: ResolvePairs): string[] {
        const matched = allInstruments.find((i) => {
            return i === pairs.instrument()
        })
        if (matched == null) {
            throw new Error('CouterRateの計算をするための通貨ペアが存在しません')
        }
        return [matched]
    }
}

/**
 * AUD_DKKの場合DKK_JPYが存在しないためRequireBridgePairを使うことができない
 * このパターンはUSD_DKKやEUR_DKKとUSD_JPY, EUR_JPYを使うことで計算できる
 * これはUSDやEUR等のハードカレンシーを共通通貨として扱う方法である
 */
class RequireHardCurrencyPairs implements CounterRateResolvePattern {
    isMatched(allInstruments: string[], pairs: ResolvePairs): boolean {
        for (const currency of ['USD', 'EUR']) {
            const bridgeToAccount = currency + '_' + pairs.account
            const bridgeToTarget = currency + '_' + pairs.target
            const matchedToAccount = allInstruments.find((i) => {
                return i === bridgeToAccount
            })
            const matchedToTarget = allInstruments.find((i) => {
                return i === bridgeToTarget
            })
            return matchedToAccount != null && matchedToTarget != null
        }
        return false
    }

    resolveRate(tick: Tick, pairs: ResolvePairs): number {
        const allInstruments = tick.values.map((v) => {
            return v.instrument
        })
        const required = this.requiredInstruments(allInstruments, pairs)
        if (required.length < 2) {
            throw new Error('CouterRateの計算をするための通貨ペアが存在しません')
        }
        const matchedToAccount = tick.get(required[0])
        const matchedToTarget = tick.get(required[1])
        if (matchedToAccount != null && matchedToTarget != null) {
            return matchedToAccount.mid() / matchedToTarget.mid()
        }
        throw new Error('CouterRateの計算をするための通貨ペアが存在しません')
    }

    requiredInstruments(allInstruments: string[], pairs: ResolvePairs): string[] {
        for (const currency of ['USD', 'EUR']) {
            const bridgeToAccount = currency + '_' + pairs.account
            const bridgeToTarget = currency + '_' + pairs.target
            const matchedToAccount = allInstruments.find((i) => {
                return i === bridgeToAccount
            })
            const matchedToTarget = allInstruments.find((i) => {
                return i === bridgeToTarget
            })
            if (matchedToAccount != null && matchedToTarget != null) {
                return [matchedToAccount, matchedToTarget]
            }
        }
        throw new Error('CouterRateの計算をするための通貨ペアが存在しません')
    }
}
