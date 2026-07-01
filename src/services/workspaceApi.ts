import type { WorkspaceAnalysis } from '../../shared/types'

export interface AnalyzeResult {
  success: boolean
  workspaceId?: string
  analysis?: WorkspaceAnalysis
  error?: string
}

// All REST communication with the EKE Service lives here — UI components
// never call fetch directly. In dev, Vite proxies /api to eke-service
// (see vite.config.ts) so this stays a same-origin relative call.
export async function analyzeWorkspace(workspaceId: string, text: string): Promise<AnalyzeResult> {
  try {
    const res = await fetch('/api/v1/workspace/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ workspaceId, text }),
    })
    if (!res.ok) {
      return { success: false, error: `EKE Service responded with ${res.status}` }
    }
    const data = await res.json() as { workspaceId: string; analysis: WorkspaceAnalysis }
    return { success: true, workspaceId: data.workspaceId, analysis: data.analysis }
  } catch (err) {
    return { success: false, error: (err as Error).message }
  }
}
