import OandaAccountSummary from 'infra/oanda/entities/OandaAccountSummary'
import OandaAccountRepository from 'infra/oanda/OandaAccountRepository'

/**
 * Oandaのアカウント情報を保持する
 */
export default class OandaAccountService {
    readonly summary: OandaAccountSummary

    constructor(summary: OandaAccountSummary) {
        this.summary = summary
    }

    static async create(): Promise<OandaAccountService> {
        const repository = new OandaAccountRepository()
        const accounts = await repository.fetchAccounts()
        if (accounts.length > 0) {
            const account = accounts[accounts.length - 1]
            const accountSummary = await repository.fetchAccountSummary(account.id)
            return new OandaAccountService(accountSummary)
        }
        throw new Error('アカウント情報の取得に失敗しました')
    }
}
