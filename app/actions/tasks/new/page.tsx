import type { Handle } from 'remix/ui'
import { TASK_CATEGORIES, type UserOption } from '../../../data/tasks.ts'
import { routes } from '../../../routes.ts'
import { AppDocument } from '../../../ui/app-document.tsx'
import { AppShell } from '../../../ui/app-shell.tsx'

export interface NewTaskFormValues {
  title: string
  dueDate: string
  assigneeId: string
  description: string
  category: string
  alertEnabled: boolean
}

export interface NewTaskPageProps {
  users: UserOption[]
  values: NewTaskFormValues
  errors?: string[]
}

export function NewTaskPage(handle: Handle<NewTaskPageProps>) {
  return () => {
    const { users, values, errors = [] } = handle.props

    return (
      <AppDocument title="New Task">
        <AppShell active="create" showNav={false}>
          <div className="stack" style={{ gap: '1rem' }}>
            <header class="page-header">
              <a href={routes.home.href()} className="icon" aria-label="Cancel">
                ×
              </a>
              <span className="icon-button" aria-hidden="true">
                ⌕
              </span>
            </header>
            <h1 className="page-title">New Task</h1>
            {errors.length > 0 ? (
              <div className="form-errors" id="form-errors" role="alert">
                <strong>Check the form</strong>

                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <form
              action={routes.tasks.create.action.href()}
              className="task-form stack"
              style={{ gap: '0.85rem' }}
            >
              <div className="field">
                <label className="u-visually-hidden" htmlFor="title">
                  Task title
                </label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  value={values.title}
                  placeholder="Task Title"
                  maxLength={120}
                  required
                />
              </div>
              <div class="field">
                <label class="u-visually-hidden" htmlFor="dueDate">
                  Due date
                </label>

                <input id="dueDate" name="dueDate" type="date" value={values.dueDate} required />
              </div>
              <div className="field">
                <label class="u-visually-hidden" htmlFor="assigneeId">
                  Assignee
                </label>
                <select name="assigneeId" id="assigneeId" required>
                  <option value="">Assignee</option>
                  {users.map((user) => (
                    <option
                      key={user.key}
                      value={user.id}
                      selected={values.assigneeId === String(user.id)}
                    >
                      {user.name}
                    </option>
                  ))}
                </select>
              </div>
              <div class="field">
                <label class="u-visually-hidden" htmlFor="description">
                  Task details
                </label>

                <textarea
                  id="description"
                  name="description"
                  placeholder="Add your task details"
                  maxLength={1000}
                  value={values.description}
                />
              </div>

              <fieldset class="category-fieldset">
                <legend>Category</legend>

                <div class="category-list">
                  {TASK_CATEGORIES.map((category) => {
                    const id = `category-${category.toLowerCase().replaceAll(' ', '-')}`

                    return (
                      <div key={category}>
                        <input
                          class="u-visually-hidden"
                          id={id}
                          name="category"
                          type="radio"
                          value={category}
                          checked={values.category === category}
                        />

                        <label class="category-chip" htmlFor={id}>
                          {category}
                        </label>
                      </div>
                    )
                  })}
                </div>
              </fieldset>

              <label class="switch-row">
                <span>Get alert for this task</span>

                <span class="switch">
                  <input
                    class="u-visually-hidden"
                    name="alertEnabled"
                    type="checkbox"
                    value="true"
                    checked={values.alertEnabled}
                  />

                  <span class="switch-track" aria-hidden="true" />
                </span>
              </label>

              <button class="button" type="submit">
                Create Task
              </button>
            </form>
          </div>
        </AppShell>
      </AppDocument>
    )
  }
}
