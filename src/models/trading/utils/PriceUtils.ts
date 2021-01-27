import { SellOrBuy } from 'models/trading/core/SellOrBuy'
import Tick from 'models/trading/core/Tick'

/**
 * レート計算用ユーティリティ
 */
export default class PriceUtils {
    // 約定前は買い注文の場合はask, 売りの場合はbidで計算する
    static entryPrice(tick: Tick, instrument: string, sellOrBuy: SellOrBuy): number {
        const targetTick = tick.get(instrument)
        if (targetTick == null) {
            throw new Error('指定された通貨ペアに対するティックが見つかりません')
        }
        return sellOrBuy === 'Buy' ? targetTick.ask : targetTick.bid
    }

    // 約定後の場合は買い注文はbid, 売りの場合はbidで計算する
    static currentPrice(tick: Tick, instrument: string, sellOrBuy: SellOrBuy): number {
        const targetTick = tick.get(instrument)
        if (targetTick == null) {
            throw new Error('指定された通貨ペアに対するティックが見つかりません')
        }
        return sellOrBuy === 'Buy' ? targetTick.bid : targetTick.ask
    }
}
