import type { Handle, RemixNode } from 'remix/ui'

import { routes } from '../routes.ts'

export type ActiveNav = 'home' | 'overview' | 'create' | null

export interface AppShellProps {
  children?: RemixNode
  active?: ActiveNav
  showNav?: boolean
}

export function AppShell(handle: Handle<AppShellProps>) {
  return () => {
    const active = handle.props.active ?? null
    const showNav = handle.props.showNav ?? true

    return (
      <div class="canvas">
        <div class="app-shell">
          <main class="app-main">{handle.props.children}</main>

          {showNav ? (
            <nav class="bottom-nav" aria-label="Primary navigation">
              <a
                class="nav-item"
                data-active={active === 'home' ? 'true' : undefined}
                aria-current={active === 'home' ? 'page' : undefined}
                href={routes.home.href()}
              >
                <span aria-hidden="true">⌂</span>
                <span class="u-visually-hidden"> Home </span>
              </a>
              <a
                class="nav-item"
                data-active={active === 'overview' ? 'true' : undefined}
                aria-current={active === 'overview' ? 'page' : undefined}
                href={routes.overview.index.href()}
              >
                <span aria-hidden="true">▣</span>
                <span class="u-visually-hidden">Overview</span>
              </a>

              <a
                class="nav-add"
                data-active={active === 'create' ? 'true' : undefined}
                href={routes.tasks.create.index.href()}
              >
                <span aria-hidden="true">+</span>
                <span class="u-visually-hidden">Create task</span>
              </a>

              <a class="nav-item" href={routes.home.href()}>
                <span aria-hidden="true">◫</span>
                <span class="u-visually-hidden">Tasks</span>
              </a>

              <a class="nav-item" href={routes.home.href()}>
                <span aria-hidden="true">○</span>
                <span class="u-visually-hidden">Profile</span>
              </a>
            </nav>
          ) : null}
        </div>
      </div>
    )
  }
}
