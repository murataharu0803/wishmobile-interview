import db from '@/db'
import { PORT } from '@/env'
import server from '@/server'
import console from '@/utils/logger'

await db.authenticate()

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
