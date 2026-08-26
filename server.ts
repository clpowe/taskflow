import { router } from './app/router.ts'

const port = process.env.PORT ? Number(process.env.PORT) : 44100

const server = Bun.serve({
  port,
  async fetch(request) {
    try {
      return await router.fetch(request)
    } catch (error) {
      if (!(request.signal.aborted && error === request.signal.reason)) {
        console.error(error)
      }

      return new Response('Internal Server Error', {
        status: 500,
      })
    }
  },
})

console.log(`Taskflow is running at http://localhost:${server.port}`)
