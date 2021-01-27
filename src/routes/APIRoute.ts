import ExpressPromisRouter from 'express-promise-router'
import { body, query } from 'express-validator'
import moment from 'moment'
import { Request, Response, NextFunction } from 'express'
import csrf from 'csurf'
import AgentController from 'controllers/AgentController'
import BacktestController from 'controllers/BacktestController'
import CandleController from 'controllers/CandleController'
import InstrumentController from 'controllers/InstrumentController'
import PositionController from 'controllers/PositionController'
import RealTradeController from 'controllers/RealTradeController'
import APIError from 'error/APIError'
import UserController from 'controllers/UserController'

const router = ExpressPromisRouter()

router.use((request: Request, response: Response, next: NextFunction) => {
    if (request.isAuthenticated() === true) {
        next()
    } else {
        response.status(403).json({
            error: 'Unauthorized',
        })
    }
})

const csrfProtection = csrf({ cookie: false })
router.use(csrfProtection)

const backtestController = new BacktestController()
router.get('/backtests', backtestController.getBacktests)
router.get('/backtests/:id', backtestController.getBacktest)
router.post('/backtests/:id/restart', backtestController.restartBacktest)
router.post(
    '/backtests',
    [
        body('name').notEmpty().isString(),
        body('description').optional({ nullable: true }).isString(),
        body('startDate').isISO8601(),
        body('endDate')
            .isISO8601()
            .custom((endDate, { req }) => {
                if (moment(endDate).isSameOrBefore(moment(req.body.startDate))) {
                    throw new Error('Invalid value')
                } else {
                    return true
                }
            }),
        body('interval').notEmpty(),
        body('balance').optional({ nullable: true }).isInt(),
        body('agent').notEmpty().isString(),
        body('instruments').notEmpty().isArray(),
    ],
    backtestController.startBacktest
)
router.delete('/backtests/:id', backtestController.deleteBacktest)

const agentController = new AgentController()
router.get('/agents', agentController.getAgents)
router.post('/agents', agentController.createNewAgent)
router.delete('/agents/:name', agentController.deleteAgent)
router.put('/agents/rename', [body('name').notEmpty().isString(), body('newName').notEmpty().isString()], agentController.renameAgentName)
router.get('/agent-body', [query('name').notEmpty().isString()], agentController.getAgentBody)
router.post('/agent-body', [body('name').notEmpty().isString(), body('body').notEmpty().isString()], agentController.updateAgentBody)

const instrumentController = new InstrumentController()
router.get('/instruments', instrumentController.getInstruments)

const realTradeController = new RealTradeController()
router.get('/trade-settings', realTradeController.getRealTradeSettings)
router.post('/trade-settings', [body('settings').isArray(), body('settings.*.agent').notEmpty().isString()], realTradeController.updateTradeSettings)
router.get('/instrument-settings', realTradeController.getInstrumentSettings)
router.post('/instrument-settings', [body('settings').isArray(), body('settings.*.name').notEmpty().isString()], realTradeController.updateInstrumentSettings)
router.get('/logs', realTradeController.getLogs)
router.get('/status', realTradeController.getStatus)

const positionController = new PositionController()
router.get('/positions', [query('lastId').optional({ nullable: true }).isString()], positionController.getPositions)

const userController = new UserController()
router.get('/user/instrument', userController.getInstrument)
router.post('/user/instrument', [body('instrument').notEmpty().isString()], userController.updateInstrument)

const candleController = new CandleController()
router.get(
    '/candles',
    [
        query('from').isISO8601(),
        query('to')
            .isISO8601()
            .custom((to, { req }) => {
                if (req.query == null) {
                    throw new Error('Invalid value')
                }
                if (moment(to).isSameOrBefore(moment(req.query.from))) {
                    throw new Error('Invalid value')
                } else {
                    return true
                }
            }),
        query('instrument').isString(),
        query('interval').isString(),
    ],
    candleController.getCandleSticks
)

router.use((err: Error, _request: Request, response: Response, next: any) => {
    if (response.headersSent) {
        return next()
    }
    const apiError = err as APIError
    if (apiError.type !== 'APIError') {
        return next(err)
    }
    response.status(apiError.statusCode).json(apiError)
})

export { router as default }
