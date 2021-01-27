import Order, { ModifyOrder, OrderResult } from 'models/trading/core/Order'
import Position from 'models/trading/core/Position'
import ClosingPolicy from 'models/trading/core/ClosingPolicy'
import AccountSummary from 'models/trading/core/AccountSummary'

export default interface Broker {
    //　オーダーする
    order(order: Order): Promise<OrderResult>
    // オーダーを修正する
    modifyOrder(order: Order, modifyOrder: ModifyOrder): Promise<void>
    // オーダーをキャンセルする
    cancelOrder(id: string): Promise<void>
    // ポジションを修正する
    modifyPosition(id: string, closingPolicy: ClosingPolicy): Promise<void>
    // ポジションをキャンセルする
    closePosition(id: string): Promise<void>
    // ポジションを取得する
    positions(): Promise<Position[]>
    // オーダーを取得する
    orders(): Promise<Order[]>
    // アカウント情報を取得する
    fetchAccount(): Promise<AccountSummary>
}
