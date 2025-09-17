import { connectDB } from '@/db'
import { PORT } from '@/env'
import server from '@/server'
import console from '@/utils/logger'

await connectDB()

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`)
})
