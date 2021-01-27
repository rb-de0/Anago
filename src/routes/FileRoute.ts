import express from 'express'
import PathUtil from 'utils/PathUtil'

const router = express.Router()

const projectRoot = PathUtil.getProjectRoot()

router.use(express.static(projectRoot + '/site/public'))
router.use(express.static(projectRoot + '/site/public/js'))

router.get(/.*/, function (_, res) {
    res.sendFile(projectRoot + '/site/public/index.html')
})

export { router as default }
