import { createRouter, type MiddlewareContext } from 'remix/router'
import { formData } from 'remix/middleware/form-data'
import { staticFiles } from 'remix/middleware/static'

import controller from './actions/controller.tsx'
import overviewController from './actions/overview/controller.tsx'
import tasksController from './actions/tasks/controller.tsx'
import createTaskController from './actions/tasks/new/controller.tsx'
import checklistController from './actions/tasks/checklist/controller.tsx'
import { loadDatabase } from './middleware/database.ts'

import { render } from './middleware/render.tsx'
import { routes } from './routes.ts'

type AppContext = MiddlewareContext<
  [ReturnType<typeof formData>, ReturnType<typeof loadDatabase>, ReturnType<typeof render>]
>

declare module 'remix/router' {
  interface RouterTypes {
    context: AppContext
  }
}

export const router = createRouter<AppContext>({
  middleware: [staticFiles('./public', { index: false }), formData(), loadDatabase(), render()],
})

router.map(routes, controller)
router.map(routes.overview, overviewController)

router.map(routes.tasks, tasksController)

router.map(routes.tasks.create, createTaskController)

router.map(routes.tasks.checklist, checklistController)
