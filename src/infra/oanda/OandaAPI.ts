const Context = require('@oanda/v20/context').Context
import UserRepository from 'infra/db/repository/UserRepository'

export default class OandaAPI {
    private static instance: OandaAPI

    private context: any = null
    private readonly userRepository: UserRepository

    private constructor() {
        this.userRepository = new UserRepository()
    }

    static getInstance() {
        if (!OandaAPI.instance) {
            OandaAPI.instance = new OandaAPI()
        }
        return OandaAPI.instance
    }

    async setupToken() {
        const users = await this.userRepository.loadUsers()
        if (users.length > 0) {
            const endpoint = users[0].apiType == 'Real' ? 'api-fxtrade.oanda.com' : 'api-fxpractice.oanda.com'
            this.context = new Context(endpoint, 443, true, 'Anago')
            this.context.setToken(users[0].apiKey)
        } else {
            throw new Error('ユーザー情報が登録されていません')
        }
    }

    getContext() {
        return this.context
    }
}
