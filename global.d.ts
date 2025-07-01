// global.d.ts
export {}

declare global {
  interface Window {
    electron: {
      openPreviewWindow: (mawbNumber: string) => Promise<void>
    }
  }
}
