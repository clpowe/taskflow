import * as s from 'remix/data-schema'
import * as f from 'remix/data-schema/form-data'
import * as coerce from 'remix/data-schema/coerce'
import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'
import { getTask, TASK_STATUSES, updateTaskStatus } from '../../data/tasks.ts'
import { routes } from '../../routes.ts'
import { TaskDetailPage } from './show.tsx'

const idSchema = coerce
  .number()
  .refine(Number.isInteger, 'Expected a task id.')
  .refine((value) => value > 0, 'Expected a task id.')

const statusSchema = f.object({ status: f.field(s.enum_(TASK_STATUSES)) })

export default createController(routes.tasks, {
  actions: {
    async show(context) {
      const parsedId = s.parseSafe(idSchema, context.params.taskId)
      if (!parsedId.success) {
        return new Response('Not Found', {
          status: 404,
        })
      }

      const task = await getTask(context.db, parsedId.value)

      if (!task) {
        return new Response('Not Found', {
          status: 404,
        })
      }

      return context.render(<TaskDetailPage task={task} />, {
        headers: {
          'Cache-Control': 'no-store',
        },
      })
    },

    async status(context) {
      const parsedId = s.parseSafe(idSchema, context.params.taskId)

      if (!parsedId.success) {
        return new Response('Not Found', {
          status: 404,
        })
      }

      const task = await getTask(context.db, parsedId.value)

      if (!task) {
        return new Response('Not Found', {
          status: 404,
        })
      }

      const parsed = s.parseSafe(statusSchema, context.get(FormData))

      if (!parsed.success) {
        return new Response('Invalid status', {
          status: 400,
        })
      }

      await updateTaskStatus(context.db, parsedId.value, parsed.value.status)

      return redirect(
        routes.tasks.show.href({
          taskId: String(parsedId.value),
        }),
        303,
      )
    },
  },
})
