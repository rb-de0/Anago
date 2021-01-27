import ExpressPromisRouter from 'express-promise-router'
import { Request, Response, NextFunction } from 'express'
import passport from 'passport'
import csrf from 'csurf'
import APIError from 'error/APIError'

const router = ExpressPromisRouter()
const csrfProtection = csrf({ cookie: false })

router.post('/login', passport.authenticate('local'), (request: Request, response: Response) => {
    if (request.user != null) {
        response.json({})
    }
    response.status(500).json({})
})

router.get('/csrfToken', csrfProtection, (request: Request, response: Response) => {
    const json = {
        csrfToken: request.csrfToken(),
    }
    response.json(json)
})

router.use((err: Error, _request: Request, response: Response, next: NextFunction) => {
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
