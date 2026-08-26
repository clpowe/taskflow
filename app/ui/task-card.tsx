import type { Handle } from 'remix/ui'

import { TaskSummary } from '../data/tasks.ts'

import { routes } from '../routes.ts'

export interface TaskCardProps {
  task: TaskSummary
}

export function TaskCard(handle: Handle<TaskCardProps>) {
  return () => {
    const task = handle.props.task

    return (
      <a
        class="task-card"
        data-status={task.status}
        href={routes.tasks.show.href({ taskId: String(task.id) })}
      >
        <div class="stack">
          <strong>{task.title}</strong>
          <small>{task.category}</small>
        </div>
        <div
          className="progress-ring"
          style={{
            background:
              `conic-gradient(` + `var(--progress-color) ` + `${task.progress}%, ` + `#ECEFF0 0)`,
          }}
          aria-label={`${task.progress}% complete`}
        >
          <span>{task.progress}%</span>
        </div>
      </a>
    )
  }
}
