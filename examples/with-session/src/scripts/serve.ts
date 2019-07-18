import http from 'http'
import handler from '../index'

const port = process.env.PORT || 3000

const server = new http.Server(handler)

server.listen(port)
console.log(`Hosting... http://localhost:${port}`)
