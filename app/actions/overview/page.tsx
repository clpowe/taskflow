import type { Handle } from 'remix/ui'
import type { OverviewData } from '../../data/tasks.ts'
import { routes } from '../../routes.ts'
import { AppDocument } from '../../ui/app-document.tsx'
import { AppShell } from '../../ui/app-shell.tsx'
import { StatusCard } from '../../ui/status-card.tsx'
const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function linePoints(values: number[], maxValue: number) {
  return values
    .map((value, index) => {
      const x = 15 + index * 45
      const y = 95 - (value / maxValue) * 65
      return `${x},${y}`
    })
    .join(' ')
}

export interface OverviewPageProps {
  data: OverviewData
}

export function OverviewPage(handle: Handle<OverviewPageProps>) {
  return () => {
    const data = handle.props.data
    const maxValue = Math.max(1, ...data.inProgressByDay, ...data.completedByDay)
    const inProgressPoints = linePoints(data.inProgressByDay, maxValue)
    const completedPoints = linePoints(data.completedByDay, maxValue)

    return (
      <AppDocument title="Task Overview">
        <AppShell active="overview" showNav={false}>
          <div
            class="stack"
            style={{
              gap: '1rem',
            }}
          >
            <header class="page-header">
              <a class="icon-button" aria-label="Back" href={routes.home.href()}>
                ‹
              </a>

              <div class="cluster">
                <span class="icon-button" aria-hidden="true">
                  ▣
                </span>

                <span class="icon-button" aria-hidden="true">
                  ⋮
                </span>
              </div>
            </header>

            <h1 class="section-title">Task Overview</h1>

            <section class="overview-summary">
              <StatusCard
                label="In Process"
                count={data.counts.in_progress}
                tone="yellow"
                icon="◷"
              />

              <StatusCard label="Completed" count={data.counts.completed} tone="teal" icon="✓" />
            </section>

            <section class="chart-card">
              <div class="repel">
                <strong>Daily tasks overview</strong>

                <small>Weekly⌄</small>
              </div>

              <div class="line-chart">
                <svg viewBox="0 0 300 110" role="img" aria-label="Tasks by weekday">
                  <line class="chart-grid-line" x1="0" x2="300" y1="20" y2="20" />

                  <line class="chart-grid-line" x1="0" x2="300" y1="45" y2="45" />

                  <line class="chart-grid-line" x1="0" x2="300" y1="70" y2="70" />

                  <line class="chart-grid-line" x1="0" x2="300" y1="95" y2="95" />

                  <polyline
                    class="chart-line"
                    data-series="in-progress"
                    fill="none"
                    points={inProgressPoints}
                  />

                  <polyline
                    class="chart-line"
                    data-series="completed"
                    fill="none"
                    points={completedPoints}
                  />
                </svg>

                <div class="chart-days">
                  {DAYS.map((day) => (
                    <small key={day}>{day}</small>
                  ))}
                </div>

                <div class="chart-legend">
                  <span>
                    <i data-series="in-progress" />
                    In Process
                  </span>

                  <span>
                    <i data-series="completed" />
                    Completed
                  </span>
                </div>
              </div>
            </section>

            <section class="chart-card">
              <div class="repel">
                <div>
                  <strong>Project overview</strong>

                  <small class="u-muted">Avg project daily</small>
                </div>

                <small>Weekly⌄</small>
              </div>

              <div class="bar-chart">
                {data.projectProgressByDay.map((value, index) => (
                  <div class="bar-column" key={DAYS[index]}>
                    <div class="bar-track">
                      <span
                        class="bar"
                        style={{
                          height: `${Math.max(value, 4)}%`,
                        }}
                        aria-label={`${value}%`}
                      />
                    </div>

                    <small>{DAYS[index]}</small>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </AppShell>
      </AppDocument>
    )
  }
}
