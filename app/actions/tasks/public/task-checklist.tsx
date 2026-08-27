import { clientEntry, on } from 'remix/ui'
import { Handle } from 'remix/ui'
import type { ChecklistItem } from '../../../data/tasks.ts'
import { routes } from '../../../routes.ts'

export interface TaskChecklistProps {
  taskId: number
  checklist: ChecklistItem[]
}

export const TaskChecklist = clientEntry(
  import.meta.url,
  function TaskChecklist(handle: Handle<TaskChecklistProps>) {
    let items = handle.props.checklist

    return () => {
      const completedCount = items.filter((item) => item.completed).length

      const progress = items.length === 0 ? 0 : Math.round((completedCount / items.length) * 100)

      return (
        <section
          class="stack"
          style={{
            gap: '0.8rem',
          }}
        >
          <div class="repel">
            <h2 class="section-title">Checklist</h2>
            <span class="u-muted">{progress}%</span>
          </div>

          <ul className="checklist">
            {items.map((item) => (
              <ChecklistRow></ChecklistRow>
            ))}
          </ul>
        </section>
      )
    }
  },
)

interface ChecklistRowProps {
  taskId: number
  item: ChecklistItem
  onToggle: (itemId: number) => Promise<void>
}

function ChecklistRow(handle: Handle<ChecklistRowProps>) {
  let pending = false

  return () => {
    const { taskId, item, onToggle } = handle.props

    return (
      <li
        class="checklist-item"
        data-completed={item.completed ? 'true' : 'false'}
        data-pending={pending ? 'true' : undefined}
      >
        <form
          method="post"
          action={routes.tasks.checklist.toggle.href({
            taskId: String(taskId),
            itemId: String(item.id),
          })}
          mix={on('submit', async (event) => {
            event.preventDefault()

            if (pending) {
              return
            }
            pending = true
            await handle.update()

            try {
              await onToggle(item.id)
            } finally {
              pending = false
              await handle.update()
            }
          })}
        >
          <button
            class="checkbox-button"
            type="submit"
            disabled={pending}
            aria-pressed={item.completed}
            aria-label={
              item.completed ? `Mark "${item.label}" incomplete` : `Mark "${item.label}" complete`
            }
          >
            {pending ? '…' : item.completed ? '✓' : ''}
          </button>
        </form>
        <span>{item.label}</span>

        <span class="item-menu" aria-hidden="true">
          •••
        </span>
      </li>
    )
  }
}
