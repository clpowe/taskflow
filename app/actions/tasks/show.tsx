import { TaskChecklist } from './public/task-checklist.tsx'

import type { Handle } from 'remix/ui'
import { STATUS_LABELS, TASK_STATUSES, type TaskDetail } from '../../data/tasks.ts'
import { routes } from '../../routes.ts'
import { AppDocument } from '../../ui/app-document.tsx'
import { AppShell } from '../../ui/app-shell.tsx'
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

            <TaskChecklist taskId={task.id} checklist={task.checklist} />

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
