import { createController } from 'remix/router'
import { assetServer } from '../assets.ts'
import { getDashboard } from '../data/tasks.ts'
import { routes } from '../routes.ts'
import { HomePage } from './home.tsx'

export default createController(routes, {
  actions: {
    async assets(context) {
      return (
        (await assetServer.fetch(context.request)) ??
        new Response('Not Found', {
          status: 404,
        })
      )
    },

    async home(context) {
      const data = await getDashboard(context.db)
      return context.render(<HomePage data={data} />, {
        headers: {
          'Cache-Control': 'no-store',
        },
      })
    },
  },
})
