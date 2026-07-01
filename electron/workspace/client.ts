const EKE_SERVICE_URL = process.env.EKE_SERVICE_URL ?? 'http://127.0.0.1:3000'

export interface WorkspaceAnalysis {
  knownObjects: unknown[]
  candidateObjects: unknown[]
  relationships: unknown[]
  measurements: unknown[]
  warnings: string[]
  suggestedCorrections: unknown[]
  confidence: number
}

export interface AnalyzeResult {
  success: boolean
  workspaceId?: string
  analysis?: WorkspaceAnalysis
  error?: string
}

export async function analyzeWorkspaceText(workspaceId: string, text: string): Promise<AnalyzeResult> {
  try {
    const res = await fetch(`${EKE_SERVICE_URL}/api/v1/workspace/analyze`, {
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
