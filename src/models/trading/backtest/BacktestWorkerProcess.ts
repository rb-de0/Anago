import 'reflect-metadata'
import 'module-alias/register'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import MongoDB from 'infra/db/MongoDB'
import OandaAPI from 'infra/oanda/OandaAPI'
import OandaPairRepository from 'infra/oanda/OandaPairRepository'
import BacktestWorker from 'models/trading/backtest/BacktestWorker'
import CounterPairResolver from 'models/trading/common/CounterPairResolver'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import Pair from 'models/trading/core/Pair'
import BacktestRepository from 'infra/db/repository/BacktestRepository'
import Logger from 'utils/Logger'

Logger.debug('backtest process started')
process.on('unhandledRejection', (error) => {
    if (process.send != null) {
        process.send(error)
    }
    process.exit(-1)
})

const main = async () => {
    if (process.argv.length < 2) {
        if (process.send != null) {
            process.send('Invalid arguments for subprocess')
        }
        Logger.error('Invalid arguments for subprocess')
        process.exit(1)
    }
    const backtestId = process.argv[2]

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
        const backtest = await new BacktestRepository().loadBacktest(backtestId)
        if (backtest == null) {
            throw new Error('バックテストデータが見つかりません')
        }

        // Workerの起動/バックテストの開始
        const instruments = await new OandaPairRepository().fetchInstruments(oandaAccountService.summary.id)
        const pairs = instruments.instruments.map((i) => {
            return new Pair(i.name.replace('/', '_'), 10 ** i.pipLocation)
        })
        const worker = new BacktestWorker(backtest, backtestId, pairs)
        await worker.prepareAgent()
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
