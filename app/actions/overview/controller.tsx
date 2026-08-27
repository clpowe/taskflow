import { createController } from 'remix/router'
import { getOverview } from '../../data/tasks.ts'
import { routes } from '../../routes.ts'
import { OverviewPage } from './page.tsx'

export default createController(routes.overview, {
  actions: {
    async index(context) {
      const data = await getOverview(context.db)

      return context.render(<OverviewPage data={data} />, {
        headers: {
          'Cache-Control': 'no-store',
        },
      })
    },
  },
})
