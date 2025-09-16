
import Koa from 'koa'
import json from 'koa-json'

import { errorHandler } from '@/utils/controller'
import { logger } from '@/utils/logger'

const koaServer = new Koa()

koaServer.use(json())
koaServer.use(logger)

koaServer.use(errorHandler)

export default koaServer
