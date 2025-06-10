export interface ModelInfo {
  id: string
  name: string
  version: string
  displayName?: string
  previewImage?: string
  description?: string
  category?: string
  tags?: string[]
  isStarred?: boolean
  isInstalled?: boolean
  downloadUrl?: string
  size?: string
  author?: string
  createdAt?: string
  updatedAt?: string
}

export interface ModelCategory {
  id: string
  name: string
  count: number
}

export type ModelSortBy =
  | 'name'
  | 'version'
  | 'created'
  | 'updated'
  | 'popularity'
export type ModelFilterBy = 'all' | 'installed' | 'starred' | 'my-models'
