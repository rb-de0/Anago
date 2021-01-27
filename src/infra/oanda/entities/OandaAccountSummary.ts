import { Transform } from 'class-transformer'

export default class OandaAccountSummary {
    id: string
    currency: string
    @Transform((value) => {
        return parseFloat(value)
    })
    balance: number

    constructor(id: string, currency: string, balance: number) {
        this.id = id
        this.currency = currency
        this.balance = balance
    }
}
