import { plainToClass } from 'class-transformer'
import OandaAccount from 'infra/oanda/entities/OandaAccount'
import OandaAccountSummary from 'infra/oanda/entities/OandaAccountSummary'
import OandaAPI from 'infra/oanda/OandaAPI'
import ResponseValidator from 'infra/oanda/validation/ResponseValidator'

export default class OandaAccountRepository {
    private readonly context: any

    constructor() {
        this.context = OandaAPI.getInstance().getContext()
    }

    fetchAccounts(): Promise<OandaAccount[]> {
        return new Promise((resolve, reject) => {
            this.context.account.list((res: any) => {
                const error = ResponseValidator.validateAccount(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const accounts = plainToClass(OandaAccount, JSON.parse(res.rawBody).accounts)
                resolve(accounts)
            })
        })
    }

    fetchAccountSummary(id: string): Promise<OandaAccountSummary> {
        return new Promise((resolve, reject) => {
            this.context.account.get(id, (res: any) => {
                const error = ResponseValidator.validateAccountSummary(JSON.parse(res.rawBody))
                if (error != null) {
                    reject(error)
                }
                const summary = plainToClass(OandaAccountSummary, JSON.parse(res.rawBody).account as OandaAccountSummary)
                resolve(summary)
            })
        })
    }
}
