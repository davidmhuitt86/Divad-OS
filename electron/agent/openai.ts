import OpenAI from 'openai'
import { randomUUID } from 'crypto'
import { fetch, Agent } from 'undici'
import type { AgentMessage } from '../../shared/types/index.js'
import {
  createObject, updateObject, approveObject,
  saveAgentMessage, getConfig, setConfig, logActivity,
} from '../db/queries.js'

let client: OpenAI | null = null

export function initOpenAI(apiKey: string, _asstId: string) {
  const dispatcher = new Agent({ connections: 10, pipelining: 1 })
  const stableFetch: typeof globalThis.fetch = (input, init) =>
    fetch(input as Parameters<typeof fetch>[0], { ...init, dispatcher } as Parameters<typeof fetch>[1]) as unknown as Promise<Response>

  client = new OpenAI({ apiKey, fetch: stableFetch, timeout: 60000, maxRetries: 2 })
}

// ── Tool definitions ───────────────────────────────────────────────────────────

const TOOLS: OpenAI.Chat.ChatCompletionTool[] = [
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
      description: 'Set the active AP, APO, APT, or MIT shown in the dashboard header',
      parameters: {
        type: 'object',
        properties: {
          ap_id:  { type: 'string' },
          apo_id: { type: 'string' },
          apt_id: { type: 'string' },
          mit_id: { type: 'string' },
        },
      },
    },
  },
]

// ── Tool execution ─────────────────────────────────────────────────────────────

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
      return { success: true, id: obj.id, title: obj.title }
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

// ── Conversation history (in-memory, keyed by session) ────────────────────────
// Persists across messages within an app session; resets on restart.
const history: OpenAI.Chat.ChatCompletionMessageParam[] = []

const SYSTEM_PROMPT = `You are the Chief Engineer AI for Divad Technology Group's Engineering Operating System (Divad OS).
You assist David Huitt, Chief Engineer, in managing engineering knowledge, tasks, decisions, architecture phases, and objectives.

You can:
- Create and update EKE objects (tasks, decisions, knowledge objects, architecture phases, research, meetings, etc.)
- Approve objects and move them through the workflow
- Set the current active AP/APO/APT/MIT shown on the dashboard
- Answer engineering questions and provide strategic guidance
- Help structure thinking and document decisions

Be concise, professional, and action-oriented. When creating objects, confirm what you created.`

// ── Main send function ─────────────────────────────────────────────────────────

export async function sendToAgent(
  userMessage: string,
  _context?: Record<string, unknown>
): Promise<AgentMessage> {
  if (!client) throw new Error('OpenAI not initialized — check your API key in openaiassistantkey.env')

  // Add user message to history
  history.push({ role: 'user', content: userMessage })

  const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history,
  ]

  let response = await client.chat.completions.create({
    model: 'gpt-4o',
    messages,
    tools: TOOLS,
    tool_choice: 'auto',
  })

  let msg = response.choices[0].message

  // Handle tool calls in a loop (model may call multiple tools)
  while (msg.tool_calls && msg.tool_calls.length > 0) {
    // Push the assistant's tool-call message into history
    history.push(msg)
    messages.push(msg)

    // Execute each tool and push results
    for (const tc of msg.tool_calls) {
      const args = JSON.parse(tc.function.arguments) as Record<string, unknown>
      const result = await executeTool(tc.function.name, args)
      const toolResult: OpenAI.Chat.ChatCompletionMessageParam = {
        role: 'tool',
        tool_call_id: tc.id,
        content: JSON.stringify(result),
      }
      history.push(toolResult)
      messages.push(toolResult)
    }

    // Ask the model to continue with the tool results
    response = await client.chat.completions.create({
      model: 'gpt-4o',
      messages,
      tools: TOOLS,
      tool_choice: 'auto',
    })
    msg = response.choices[0].message
  }

  const text = typeof msg.content === 'string' ? msg.content : '[No response]'

  // Push final assistant reply into history
  history.push({ role: 'assistant', content: text })

  const agentMsg: AgentMessage = {
    id: randomUUID(),
    role: 'assistant',
    content: text,
    created_at: new Date().toISOString(),
  }
  await saveAgentMessage(agentMsg)
  return agentMsg
}
