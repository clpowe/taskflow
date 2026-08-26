import type { Handle } from 'remix/ui'

export type StatusTone = 'blue' | 'yellow' | 'teal' | 'coral'

export interface StatusCardProps {
  label: string
  count: number
  tone: StatusTone
  icon: string
}

export interface StatusCardProps {
  label: string
  count: number
  tone: StatusTone
  icon: string
}

export function StatusCard(handle: Handle<StatusCardProps>) {
  return () => (
    <article class="status-card" data-tone={handle.props.tone}>
      <span class="status-card-icon" aria-hidden="true">
        {handle.props.icon}
      </span>
      <div>
        <strong>{handle.props.label}</strong>
        <small>
          {handle.props.count} {handle.props.count === 1 ? 'Task' : 'Tasks'}
        </small>
      </div>
    </article>
  )
}
