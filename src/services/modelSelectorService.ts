import { markRaw } from 'vue'

import ModelSelectorDialog from '@/components/dialog/content/ModelSelectorDialog.vue'
import { useDialogStore } from '@/stores/dialogStore'
import type { ModelInfo } from '@/types/model'

export interface ModelSelectorOptions {
  title?: string
  onSelect?: (model: ModelInfo) => void
  currentModelId?: string
}

export const useModelSelectorService = () => {
  const dialogStore = useDialogStore()

  const showModelSelector = (options: ModelSelectorOptions = {}) => {
    const {
      title = 'Select CHECKPOINT1',
      onSelect = () => {},
      currentModelId
    } = options

    return dialogStore.showDialog({
      key: 'model-selector',
      title,
      component: markRaw(ModelSelectorDialog),
      props: {
        onSelect,
        currentModelId
      },
      dialogComponentProps: {
        maximizable: true,
        modal: true,
        closable: true,
        position: 'center',
        pt: {
          root: {
            class: 'model-selector-dialog-root'
          },
          content: {
            class: 'p-0'
          }
        }
      }
    })
  }

  return {
    showModelSelector
  }
}
