import type { Handle, RemixNode } from 'remix/ui'

import { Document } from '../actions/document.tsx'

export interface AppDocumentProps {
  children?: RemixNode
  title: string
}

export function AppDocument(handle: Handle<AppDocumentProps>) {
  return () => (
    <Document
      title={handle.props.title}
      head={
        <>
          <meta name="theme-color" content="#F2F3F3" />

          <link rel="stylesheet" href="/styles/app.css" />
        </>
      }
    >
      {handle.props.children}
    </Document>
  )
}
