import type { Handle } from 'remix/ui'
import type { DashboardData } from '../data/tasks.ts'
import { AppDocument } from '../ui/app-document.tsx'
import { AppShell } from '../ui/app-shell.tsx'
import { StatusCard } from '../ui/status-card.tsx'
import { TaskCard } from '../ui/task-card.tsx'

export interface HomePageProps {
  data: DashboardData
}

export function HomePage(handle: Handle<HomePageProps>) {
  return () => {
    const data = handle.props.data

    return (
      <AppDocument title="Taskflow">
        <AppShell active="home">
          <div
            className="stack"
            style={{
              gap: '1.25rem',
            }}
          >
            <header class="home-header">
              <div className="cluster">
                <span className="avatar" data-tone="coral" aria-hidden="true">
                  BR
                </span>
                <div>
                  <p class="eyebrow">Hi, Bruce 👋</p>

                  <small class="u-muted">Your daily adventure starts now</small>
                </div>
              </div>
              <span class="icon-button" aria-hidden="true">
                ▦
              </span>
            </header>

            <section class="summary-grid" aria-label="Task status summary">
              <StatusCard
                label="Ongoing"
                count={data.counts.ongoing}
                tone="blue"
                icon="↻"
              ></StatusCard>
              <StatusCard
                label="In Process"
                count={data.counts.in_progress}
                tone="yellow"
                icon="◷"
              />

              <StatusCard label="Completed" count={data.counts.completed} tone="teal" icon="✓" />

              <StatusCard label="Cancelled" count={data.counts.cancelled} tone="coral" icon="×" />
            </section>

            <section
              class="stack"
              style={{
                gap: '0.75rem',
              }}
            >
              <h2 class="section-title">Recent Task</h2>

              <div className="stack" style={{ gap: '0.75rem' }}>
                {data.tasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          </div>
        </AppShell>
      </AppDocument>
    )
  }
}
