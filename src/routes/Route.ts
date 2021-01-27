import ExpressPromisRouter from 'express-promise-router'
import apiRoute from 'routes/APIRoute'
import fileRoute from 'routes/FileRoute'
import loginRoute from 'routes/LoginRoute'

const router = ExpressPromisRouter()

router.use('/api/v1', loginRoute)
router.use('/api/v1', apiRoute)
router.use(fileRoute)

export { router as default }
