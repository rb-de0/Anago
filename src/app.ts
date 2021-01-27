import 'reflect-metadata'
import 'core/Importer'
import express from 'express'
import session from 'express-session'
import passport from 'passport'
import compression from 'compression'
import { Strategy as LocalStrategy } from 'passport-local'
import { Request, Response, NextFunction } from 'express'
import cors from 'cors'
import bcrypt from 'bcrypt'
import memorystore from 'memorystore'
import container from 'config/inversify.config'
import TYPES from 'config/types'
import MongoDB from 'infra/db/MongoDB'
import OandaAPI from 'infra/oanda/OandaAPI'
import CounterPairResolver from 'models/trading/common/CounterPairResolver'
import OandaAccountService from 'models/trading/common/OandaAccountService'
import appRoute from 'routes/Route'
import Logger from 'utils/Logger'
import RealTradeProcessLauncher from 'models/trading/realtrade/RealTradeProcessLauncher'
import User from 'models/common/User'
import UserRepository from 'infra/db/repository/UserRepository'

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

        // サーバー起動
        const app = express()
        const port = 3000

        // Passportのセットアップ
        passport.serializeUser((user: User, done) => {
            done(null, user._id)
        })
        passport.deserializeUser((userID: string, done) => {
            new UserRepository()
                .loadUser(userID)
                .then((user) => {
                    done(null, user)
                })
                .catch((error) => {
                    done(error, null)
                })
        })
        // ログイン処理
        passport.use(
            new LocalStrategy((username, password, done) => {
                new UserRepository()
                    .loadUsers()
                    .then((users) => {
                        if (users.length > 0) {
                            const user = users[0]
                            const matched = user.username === username && bcrypt.compareSync(password, user.password)
                            if (matched === true) {
                                done(null, users[0])
                            } else {
                                done(null, false, { message: 'Bad Request' })
                            }
                        } else {
                            done(null, false, { message: 'Bad Request' })
                        }
                    })
                    .catch((error) => {
                        done(error, null)
                    })
            })
        )

        app.use((request: Request, _response: Response, next: NextFunction) => {
            const requestLog = `${request.method} ${request.url}`
            Logger.debug(requestLog)
            next()
        })
        app.use(compression())
        const MemoryStore = memorystore(session)
        app.use(
            session({
                secret: 'anago-secret-session',
                resave: false,
                saveUninitialized: false,
                store: new MemoryStore({
                    checkPeriod: 86400000,
                }),
                cookie: {
                    httpOnly: true,
                    secure: false,
                    maxAge: 1000 * 60 * 60 * 24,
                },
            })
        )
        app.use(passport.initialize())
        app.use(passport.session())
        if (process.env.NODE_ENV === 'production') {
            const allowedOrigin = process.env.ANAGO_ORIGIN
            if (allowedOrigin == null) {
                throw new Error('ANAGO_ORIGIN enviromnent value not set')
            }
            app.use(
                cors({
                    origin: allowedOrigin,
                    credentials: true,
                })
            )
        } else {
            app.use(
                cors({
                    origin: true,
                    credentials: true,
                })
            )
        }
        app.use(express.json())
        app.use('/', appRoute)
        app.use((err: any, _request: Request, response: Response, next: NextFunction) => {
            if (response.headersSent) {
                next()
            }
            response.status(500).json({
                error: err.toString(),
            })
        })
        app.listen(port, () => {
            // RMTタスクの起動
            container.get<RealTradeProcessLauncher>(TYPES.RealTradeProcessLauncher).launch()
            Logger.debug(`Started HTTP Server on ${port}`)
        })
    } catch (error) {
        Logger.error(error)
        process.exit(1)
    }
}

main()
