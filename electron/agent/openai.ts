import OpenAI from 'openai'
import { randomUUID } from 'crypto'
import { fetch, Agent } from 'undici'
import type { AgentMessage } from '../../shared/types/index.js'
import {
  createObject, updateObject, approveObject,
  saveAgentMessage, listAgentMessages, logActivity, setConfig, getConfig
} from '../db/queries.js'

let client: OpenAI | null = null
let assistantId = ''

export function initOpenAI(apiKey: string, asstId: string) {
  // Node 24's native fetch has premature-close bugs with OpenAI's keep-alive.
  // Force undici (Node 24's built-in HTTP client) with explicit keep-alive.
  const dispatcher = new Agent({ connections: 10, pipelining: 1 })
  const stableFetch: typeof globalThis.fetch = (input, init) =>
    fetch(input as Parameters<typeof fetch>[0], { ...init, dispatcher } as Parameters<typeof fetch>[1]) as unknown as Promise<Response>

  client = new OpenAI({
    apiKey,
    fetch: stableFetch,
    timeout: 60000,
    maxRetries: 3,
  })
  assistantId = asstId
}

// ── Tool definitions (passed to the run so the assistant can call them) ───────

const TOOLS: OpenAI.Beta.AssistantTool[] = [
  {
    type: 'function',
    function: {
      name: 'create_object',
      description: 'Create a new EKE object (task, decision, knowledge object, APO, APT, MIT, etc.)',
      parameters: {
        type: 'object',
        properties: {
          type:        { type: 'string', description: 'Object type: document | task | knowledge_object | decision | architecture_phase | research | meeting | journal | product | requirement | risk | question | standard | apo | apt | apm | aar | mit' },
          title:       { type: 'string' },
          description: { type: 'string' },
          priority:    { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          tags:        { type: 'array', items: { type: 'string' } },
          parent_id:   { type: 'string', description: 'Parent object ID if applicable' },
        },
        required: ['type', 'title'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'update_object',
      description: 'Update an existing EKE object by ID',
      parameters: {
        type: 'object',
        properties: {
          id:          { type: 'string' },
          title:       { type: 'string' },
          description: { type: 'string' },
          status:      { type: 'string', enum: ['draft', 'in_review', 'approved', 'published', 'revised', 'archived'] },
          priority:    { type: 'string', enum: ['low', 'medium', 'high', 'critical'] },
          tags:        { type: 'array', items: { type: 'string' } },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'approve_object',
      description: 'Approve an EKE object, moving it to approved status',
      parameters: {
        type: 'object',
        properties: {
          id:   { type: 'string' },
          note: { type: 'string' },
        },
        required: ['id'],
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'set_current_focus',
      description: 'Set the current active AP, APO, APT, or MIT shown in the dashboard header',
      parameters: {
        type: 'object',
        properties: {
          ap_id:  { type: 'string', description: 'Architecture Phase object ID' },
          apo_id: { type: 'string', description: 'Architecture Phase Objective ID' },
          apt_id: { type: 'string', description: 'Architecture Phase Task ID' },
          mit_id: { type: 'string', description: 'Most Important Task ID' },
        },
      },
    },
  },
]

// ── Tool execution ────────────────────────────────────────────────────────────

async function executeTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'create_object': {
      const obj = await createObject({
        type: args.type as string,
        title: args.title as string,
        description: (args.description as string) ?? null,
        status: 'draft',
        owner: 'agent',
        tags: (args.tags as string[]) ?? [],
        priority: (args.priority as 'low' | 'medium' | 'high' | 'critical') ?? null,
        metadata: {},
        parent_id: (args.parent_id as string) ?? null,
      } as Parameters<typeof createObject>[0])
      await logActivity('agent_created_object', obj, `Agent created: ${obj.title}`, 'agent')
      return { success: true, id: obj.id, title: obj.title, status: obj.status }
    }
    case 'update_object': {
      const obj = await updateObject(args.id as string, args as Parameters<typeof updateObject>[1])
      if (obj) await logActivity('agent_updated_object', obj, `Agent updated: ${obj.title}`, 'agent')
      return { success: !!obj, id: args.id }
    }
    case 'approve_object': {
      const obj = await approveObject(args.id as string, args.note as string)
      if (obj) await logActivity('agent_approved_object', obj, `Agent approved: ${obj.title}`, 'agent')
      return { success: !!obj }
    }
    case 'set_current_focus': {
      if (args.ap_id)  await setConfig('current_ap_id',  args.ap_id as string)
      if (args.apo_id) await setConfig('current_apo_id', args.apo_id as string)
      if (args.apt_id) await setConfig('current_apt_id', args.apt_id as string)
      if (args.mit_id) await setConfig('current_mit_id', args.mit_id as string)
      return { success: true }
    }
    default:
      return { error: `Unknown tool: ${name}` }
  }
}

// ── Thread management ─────────────────────────────────────────────────────────

async function getOrCreateThread(): Promise<string> {
  const existing = await getConfig('openai_thread_id')
  if (existing) return existing

  const thread = await client!.beta.threads.create()
  await setConfig('openai_thread_id', thread.id)
  return thread.id
}

// ── Main send function ────────────────────────────────────────────────────────

export async function sendToAgent(
  userMessage: string,
  context?: Record<string, unknown>
): Promise<AgentMessage> {
  if (!client) throw new Error('OpenAI not initialized')
  if (!assistantId) throw new Error('Assistant ID not configured')

  const threadId = await getOrCreateThread()

  // Save user message locally
  const userMsg: AgentMessage = {
    id: randomUUID(),
    role: 'user',
    content: userMessage,
    created_at: new Date().toISOString(),
  }
  await saveAgentMessage(userMsg)

  // Add the message to the thread
  const contextNote = context
    ? `\n\n[Context: ${JSON.stringify(context)}]`
    : ''

  await client.beta.threads.messages.create(threadId, {
    role: 'user',
    content: userMessage + contextNote,
  })

  // Create a run and poll until complete
  let run = await client.beta.threads.runs.createAndPoll(threadId, {
    assistant_id: assistantId,
    tools: TOOLS,
  })

  // Handle tool calls if the run requires action
  while (run.status === 'requires_action') {
    const toolCalls = run.required_action?.submit_tool_outputs?.tool_calls ?? []
    const toolOutputs: { tool_call_id: string; output: string }[] = []

    for (const tc of toolCalls) {
      const args = JSON.parse(tc.function.arguments) as Record<string, unknown>
      const result = await executeTool(tc.function.name, args)
      toolOutputs.push({ tool_call_id: tc.id, output: JSON.stringify(result) })
    }

    run = await client.beta.threads.runs.submitToolOutputsAndPoll(threadId, run.id, {
      tool_outputs: toolOutputs,
    })
  }

  if (run.status !== 'completed') {
    throw new Error(`Run ended with status: ${run.status}`)
  }

  // Get the latest assistant message
  const messages = await client.beta.threads.messages.list(threadId, { limit: 1, order: 'desc' })
  const latest = messages.data[0]
  const content = latest?.content[0]
  const text = content?.type === 'text' ? content.text.value : '[No response]'

  const agentMsg: AgentMessage = {
    id: randomUUID(),
    role: 'assistant',
    content: text,
    created_at: new Date().toISOString(),
  }
  await saveAgentMessage(agentMsg)
  return agentMsg
}
