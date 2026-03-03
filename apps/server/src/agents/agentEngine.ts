import { agentRepository } from '../repositories/agentRepository.js'
import { agentRunRepository } from '../repositories/agentRunRepository.js'
import { ollamaService, type OllamaChatMessage } from '../ai/ollamaService.js'
import { agentTools, buildToolsSchema } from './agentTools.js'
import type { AgentRunStep, AgentToolName, RunAgentInput } from '@semantic-notes/shared'
import { MAX_AGENT_STEPS } from '@semantic-notes/shared'

// ─── Agent Engine ─────────────────────────────────────────────────────────────

export const agentEngine = {
  /**
   * Run an agent by ID with given input context
   */
  async run(
    agentId: string,
    input: RunAgentInput
  ): Promise<{ runId: string }> {
    const agent = agentRepository.findById(agentId)
    if (!agent) throw new Error(`Agent not found: ${agentId}`)

    const userInput = buildUserInput(input)
    const run = agentRunRepository.create(agentId, userInput)
    const startTime = Date.now()

    // Run async, don't await in the HTTP handler
    agentEngine
      ._execute(agent, run.id, userInput, startTime)
      .catch((err) => {
        console.error('[AgentEngine] Uncaught error:', err)
        agentRunRepository.updateStatus(run.id, 'error', String(err))
      })

    return { runId: run.id }
  },

  /**
   * Internal: ReAct execution loop
   */
  async _execute(
    agent: Awaited<ReturnType<typeof agentRepository.findById>> & object,
    runId: string,
    userInput: string,
    startTime: number
  ): Promise<void> {
    if (!agent) return

    const systemPrompt = interpolatePrompt(agent.system_prompt ?? '', {
      today: new Date().toDateString(),
    })

    const messages: OllamaChatMessage[] = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userInput },
    ]

    const tools = buildToolsSchema(agent.tools as AgentToolName[])
    let stepIndex = 0

    while (stepIndex < MAX_AGENT_STEPS) {
      const response = await ollamaService.chat(messages, tools, agent.model)

      if (!response) {
        agentRunRepository.updateStatus(
          runId,
          'error',
          undefined,
          Date.now() - startTime
        )
        return
      }

      const { message } = response
      const step: AgentRunStep = {
        index: stepIndex,
        timestamp: new Date().toISOString(),
      }

      // ─── Tool calls ───────────────────────────────────────────────────────
      if (message.tool_calls && message.tool_calls.length > 0) {
        for (const toolCall of message.tool_calls) {
          const toolName = toolCall.function.name as AgentToolName
          const tool = agentTools[toolName]

          step.action = toolName
          step.tool_call = {
            name: toolName,
            input: JSON.parse(toolCall.function.arguments || '{}'),
          }

          if (!tool) {
            step.observation = `Tool "${toolName}" not found`
          } else {
            let parsedArgs: unknown = {}
            try {
              parsedArgs = JSON.parse(toolCall.function.arguments || '{}')
            } catch {
              parsedArgs = {}
            }

            const result = await tool.execute(parsedArgs)

            agentRunRepository.logToolCall(
              runId,
              toolName,
              parsedArgs,
              result.data ?? result.error
            )

            step.observation = result.success
              ? JSON.stringify(result.data)
              : `Error: ${result.error}`
          }

          agentRunRepository.appendStep(runId, step)

          // Feed observation back
          messages.push({
            role: 'assistant',
            content: message.content ?? '',
            tool_call_id: toolCall.id,
          })
          messages.push({
            role: 'tool',
            content: step.observation ?? '',
            tool_call_id: toolCall.id,
          })
        }

        stepIndex++
        continue
      }

      // ─── Final answer ─────────────────────────────────────────────────────
      if (message.content) {
        step.thought = message.content

        agentRunRepository.appendStep(runId, step)
        agentRunRepository.updateStatus(
          runId,
          'success',
          message.content,
          Date.now() - startTime
        )
        return
      }

      // No content and no tool calls → done
      agentRunRepository.updateStatus(
        runId,
        'success',
        '',
        Date.now() - startTime
      )
      return
    }

    // Max steps exceeded
    agentRunRepository.updateStatus(
      runId,
      'error',
      'Max steps exceeded',
      Date.now() - startTime
    )
  },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildUserInput(input: RunAgentInput): string {
  const parts: string[] = []
  if (input.note_id) parts.push(`Note ID: ${input.note_id}`)
  if (input.selected_text) parts.push(`Selected text: "${input.selected_text}"`)
  if (input.input) parts.push(input.input)
  return parts.join('\n') || 'Run agent task'
}

function interpolatePrompt(
  prompt: string,
  vars: Record<string, string>
): string {
  return prompt.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`)
}
