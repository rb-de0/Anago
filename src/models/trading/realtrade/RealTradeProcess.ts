import 'reflect-metadata'
import 'module-alias/register'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import MongoDB from 'infra/db/MongoDB'
import OandaAPI from 'infra/oanda/OandaAPI'
import CounterPairResolver from 'models/trading/common/CounterPairResolver'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import Logger from 'utils/Logger'
import RealTradeWorker from 'models/trading/realtrade/RealTradeWorker'

Logger.debug('realtrade process started')
process.on('unhandledRejection', (error) => {
    if (process.send != null) {
        process.send(error)
    }
    process.exit(-1)
})

const main = async () => {
    try {
        // MongoDBコネクションの準備
        const mongoDB = new MongoDB()
        await mongoDB.createConnection()
        process.on('exit', function () {
            mongoDB.releaseConnection()
        })

        // OandaAPIのセットアップ
        await OandaAPI.getInstance().setupToken()

        // Serviceのセットアップ
        const oandaAccountService = await OandaAccountService.create()
        container.bind<OandaAccountService>(TYPES.OandaAccountService).toConstantValue(oandaAccountService)
        const counterPairResolver = new CounterPairResolver(oandaAccountService.summary.currency)
        container.bind<CounterPairResolver>(TYPES.CounterPairResolver).toConstantValue(counterPairResolver)

        // バックテスト情報をDBから取得
        const worker = new RealTradeWorker()
        await worker.start()
    } catch (error) {
        if (process.send != null) {
            process.send(error.toString())
        }
        process.exit(1)
    }

    // exit success
    process.exit(0)
}

main()
