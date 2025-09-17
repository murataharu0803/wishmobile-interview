import Router from '@koa/router'

import {
  createService,
  deleteService,
  getPublicService,
  listPublicServices,
  updateService,
} from '@/controllers/service'
import { login, register } from '@/controllers/user'
import auth from '@/middleware/auth'

const router = new Router()

const userRouter = new Router()
userRouter.post('/register', register)
userRouter.post('/login', login)
router.use('/user', userRouter.routes(), userRouter.allowedMethods())

const serviceRouter = new Router()
serviceRouter.get('/all', listPublicServices)
serviceRouter.get('/:id', getPublicService)
serviceRouter.post('/', auth, createService)
serviceRouter.put('/:id', auth, updateService)
serviceRouter.delete('/:id', auth, deleteService)
router.use('/service', serviceRouter.routes(), serviceRouter.allowedMethods())

export default router
