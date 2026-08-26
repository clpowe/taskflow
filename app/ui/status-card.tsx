import type {
  Handle,
} from "remix/ui"

export type StatusTone =
  | "blue"
  | "yellow"
  | "teal"
  | "coral"

export interface StatusCardProps {
  label: string
  count: number
  tone: StatusTone
  icon: string
}
