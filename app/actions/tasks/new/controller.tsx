import * as s from 'remix/data-schema'
import * as f from 'remix/data-schema/form-data'
import * as coerce from 'remix/data-schema/coerce'

import { createController } from 'remix/router'
import { redirect } from 'remix/response/redirect'
import { createTask, getUsers, TASK_CATEGORIES } from '../../../data/tasks.ts'
import { routes } from '../../../routes.ts'
import { NewTaskPage, type NewTaskFormValues } from './page.tsx'
import { Temporal } from '@js-temporal/polyfill'
import type { FormDataEntryValue } from 'bun'

const titleSchema = s
  .string()
  .refine(
    (value) => value.trim().length >= 2 && value.trim().length <= 120,
    'Task title must be between 2 and 120 characters.',
  )

const dateSchema = s
  .string()
  .refine((value) => /^\d{4}-\d{2}-\d{2}$/.test(value), 'Choose a valid due date.')

const assigneeSchema = coerce
  .number()
  .refine(Number.isInteger, 'Choose a valid assignee.')
  .refine((value) => value > 0, 'Choose a valid assignee.')

const descriptionSchema = s
  .string()
  .refine((value) => value.length <= 1000, 'Task details must be 1000 characters or fewer.')

const createTaskSchema = f.object({
  title: f.field(titleSchema),
  dueDate: f.field(dateSchema),
  assigneeId: f.field(assigneeSchema),
  description: f.field(descriptionSchema),
  category: f.field(s.enum_(TASK_CATEGORIES)),
})

function todayPlusOne() {
  return Temporal.Now.plainDateISO().add({ days: 1 }).toString()
}

function stringValue(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value : ''
}

function valuesFromForm(formData: FormData): NewTaskFormValues {
  return {
    title: stringValue(formData.get('title')),
    dueDate: stringValue(formData.get('dueDate')),
    assigneeId: stringValue(formData.get('assigneeId')),
    description: stringValue(formData.get('description')),
    category: stringValue(formData.get('category')),
    alertEnabled: formData.get('alertEnabled') === 'true',
  }
}

export default createController(routes.tasks.create, {
  actions: {
    async index(context) {
      const users = await getUsers(context.db)

      return context.render(
        <NewTaskPage
          users={users}
          values={{
            title: '',
            dueDate: todayPlusOne(),
            assigneeId: '',
            description: '',
            category: 'Design',
            alertEnabled: false,
          }}
        />,
      )
    },

    async action(context) {
      const formData = context.get(FormData)
      const users = await getUsers(context.db)
      const values = valuesFromForm(formData)

      const parsed = s.parseSafe(createTaskSchema, formData)

      if (!parsed.success) {
        return context.render(
          <NewTaskPage
            users={users}
            values={values}
            errors={parsed.issues.map((issue) => issue.message)}
          />,
          {
            status: 400,
          },
        )
      }

      const userExists = users.some((user) => user.id === parsed.value.assigneeId)

      if (!userExists) {
        return context.render(
          <NewTaskPage users={users} values={values} errors={['Choose a valid assignee.']} />,
          {
            status: 400,
          },
        )
      }

      const taskId = await createTask(context.db, {
        ...parsed.value,
        alertEnabled: formData.get('alertEnabled') === 'true',
      })

      return redirect(
        routes.tasks.show.href({
          taskId: String(taskId),
        }),
        303,
      )
    },
  },
})
