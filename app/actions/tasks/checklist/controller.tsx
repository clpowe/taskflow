import * as s from 'remix/data-schema'
import * as f from 'remix/data-schema/form-data'
import * as coerce from 'remix/data-schema/coerce'
import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'
import { addChecklistItem, getTask, toggleChecklistItem } from '../../../data/tasks.ts'
import { routes } from '../../../routes.ts'

const idSchema = coerce
  .number()
  .refine(Number.isInteger, 'Expected an id.')
  .refine((value) => value > 0, 'Expected an id.')

const checklistSchema = f.object({
  label: f.field(
    s
      .string()
      .refine((value) => value.trim().length >= 2, 'Checklist item is too short.')
      .refine((value) => value.length <= 140, 'Checklist item is too long.'),
  ),
})

export default createController(routes.tasks.checklist, {
  actions: {
    async add(context) {
      const parsedTaskId = s.parseSafe(idSchema, context.params.taskId)

      if (!parsedTaskId.success) {
        return new Response('Not Found', {
          status: 404,
        })
      }

      const task = await getTask(context.db, parsedTaskId.value)

      if (!task) {
        return new Response('Not Found', {
          status: 404,
        })
      }

      const parsed = s.parseSafe(checklistSchema, context.get(FormData))

      if (!parsed.success) {
        return new Response(parsed.issues.map((issue) => issue.message).join('\n'), {
          status: 400,
        })
      }

      await addChecklistItem(context.db, parsedTaskId.value, parsed.value.label)

      return redirect(
        routes.tasks.show.href({
          taskId: String(parsedTaskId.value),
        }),
        303,
      )
    },

    async toggle(context) {
      const parsedTaskId = s.parseSafe(idSchema, context.params.taskId)

      const parsedItemId = s.parseSafe(idSchema, context.params.itemId)

      if (!parsedTaskId.success || !parsedItemId.success) {
        return new Response('Not Found', {
          status: 404,
        })
      }

      await toggleChecklistItem(context.db, parsedTaskId.value, parsedItemId.value)

      return redirect(
        routes.tasks.show.href({
          taskId: String(parsedTaskId.value),
        }),
        303,
      )
    },
  },
})
