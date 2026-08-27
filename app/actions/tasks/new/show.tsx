import type { Handle } from 'remix/ui'
import { STATUS_LABELS, TASK_STATUSES, type TaskDetail } from '../../../data/task.ts'
import { routes } from '../../../routes.ts'
import { AppDocument } from '../../../ui/app-document.tsx'
import { AppShell } from '../../../ui/app-shell.tsx'
import { Temporal } from '@js-temporal/polyfill'

export interface TaskDetailPageProps {
  task: TaskDetail
}

function formatDate(value: string | null) {
  if (!value) {
    return 'No deadline'
  }

  return Temporal.PlainDate.from(value).toLocaleString('en-US', {
    month: 'long',
    day: 'numeric',
  })
}

export function TaskDetailPage(handle: Handle<TaskDetailPageProps>) {
  return () => {
    const task = handle.props.task

    return (
      <AppDocument title={task.title}>
        <AppShell showNav={false}>
          <div
            class="stack"
            style={{
              gap: '1.15rem',
            }}
          >
            <header class="page-header">
              <a class="icon-button" aria-label="Back to dashboard" href={routes.home.href()}>
                ‹
              </a>

              <span class="status-pill" data-status={task.status}>
                {STATUS_LABELS[task.status]}
              </span>
            </header>
            <section
              class="stack"
              style={{
                gap: '0.65rem',
              }}
            >
              <h1 class="task-title">{task.title}</h1>

              <p class="task-description">{task.description}</p>
            </section>

            <nav class="tabs" aria-label="Task information">
              <a data-active="true" href="#detail">
                Detail
              </a>

              <a href="#comments">Comment</a>

              <a href="#attachments">Attachment</a>
            </nav>

            <section class="task-meta" id="detail">
              <div
                class="stack"
                style={{
                  gap: '0.35rem',
                }}
              >
                <strong>Team Assign</strong>
                <div class="avatar-stack">
                  {task.assignees.map((user) => (
                    <span
                      key={user.id}
                      class="avatar avatar-small"
                      style={{
                        background: user.avatarColor,
                      }}
                      title={user.name}
                    >
                      {user.initials}
                    </span>
                  ))}
                  <span class="avatar avatar-small avatar-add" aria-hidden="true">
                    +
                  </span>
                </div>
              </div>

              <div class="deadline">
                <span aria-hidden="true">◷</span>

                <span>
                  Deadline: <strong>{formatDate(task.dueDate)}</strong>
                </span>
              </div>
            </section>

            <form
              class="status-editor"
              method="post"
              action={routes.tasks.status.href({
                taskId: String(task.id),
              })}
            >
              <label htmlFor="status">Status</label>

              <select id="status" name="status">
                {TASK_STATUSES.map((status) => (
                  <option key={status} value={status} selected={status === task.status}>
                    {STATUS_LABELS[status]}
                  </option>
                ))}
              </select>

              <button class="button button-small" type="submit">
                Update
              </button>
            </form>

            <section
              style={{
                gap: '0.8rem',
              }}
              class="stack"
            >
              <div class="repel">
                <h2 class="section-title">Checklist</h2>

                <span class="u-muted">{task.progress}%</span>
              </div>

              <ul class="checklist">
                {task.checklist.map((item) => (
                  <li
                    key={item.id}
                    class="checklist-item"
                    data-completed={item.completed ? 'true' : 'false'}
                  >
                    <form
                      method="post"
                      action={routes.tasks.checklist.toggle.href({
                        taskId: String(task.id),

                        itemId: String(item.id),
                      })}
                    >
                      <button
                        class="checkbox-button"
                        type="submit"
                        aria-pressed={item.completed}
                        aria-label={
                          item.completed
                            ? `Mark "${item.label}" incomplete`
                            : `Mark "${item.label}" complete`
                        }
                      >
                        {item.completed ? '✓' : ''}
                      </button>
                    </form>

                    <span>{item.label}</span>

                    <span class="item-menu" aria-hidden="true">
                      •••
                    </span>
                  </li>
                ))}
              </ul>

              <form
                class="add-checklist"
                method="post"
                action={routes.tasks.checklist.add.href({
                  taskId: String(task.id),
                })}
              >
                <label class="u-visually-hidden" htmlFor="checklist-label">
                  Add checklist item
                </label>

                <input
                  id="checklist-label"
                  name="label"
                  placeholder="Add checklist item"
                  maxLength={140}
                  required
                />

                <button class="button button-small" type="submit">
                  Add
                </button>
              </form>
            </section>

            <section id="comments" class="placeholder-panel">
              Comments will go here in the next enhancement.
            </section>

            <section id="attachments" class="placeholder-panel">
              Attachments will go here in the next enhancement.
            </section>
          </div>
        </AppShell>
      </AppDocument>
    )
  }
}
