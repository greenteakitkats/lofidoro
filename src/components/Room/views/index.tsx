import type { ComponentType } from 'react'
import { HillsView } from './HillsView'
import { CityView } from './CityView'
import { MountainsView } from './MountainsView'
import { OceanView } from './OceanView'
import { ForestView } from './ForestView'
import { AuroraView } from './AuroraView'
import { SpaceView } from './SpaceView'

export type WindowViewId =
  | 'hills'
  | 'city'
  | 'mountains'
  | 'ocean'
  | 'forest'
  | 'aurora'
  | 'space'

export interface WindowViewDef {
  id: WindowViewId
  label: string
  emoji: string
  component: ComponentType
}

export const WINDOW_VIEWS: WindowViewDef[] = [
  { id: 'hills', label: 'Hills', emoji: '🌄', component: HillsView },
  { id: 'city', label: 'City', emoji: '🌆', component: CityView },
  { id: 'mountains', label: 'Mountains', emoji: '🏔', component: MountainsView },
  { id: 'ocean', label: 'Ocean', emoji: '🌊', component: OceanView },
  { id: 'forest', label: 'Forest', emoji: '🌲', component: ForestView },
  { id: 'aurora', label: 'Aurora', emoji: '🌌', component: AuroraView },
  { id: 'space', label: 'Space', emoji: '🪐', component: SpaceView },
]

export const DEFAULT_VIEW: WindowViewId = 'hills'

export function isWindowViewId(v: string): v is WindowViewId {
  return WINDOW_VIEWS.some((w) => w.id === v)
}
