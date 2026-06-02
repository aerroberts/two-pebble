import { AgentCapability } from '../agent-capability';
import systemPrompt from './prompts/system.md?raw';
import { buildSubmitPrTool } from './tools/submit-pr/handler';

/**
 * Agent capability that attaches a GitHub PR to a task's `pr_url` deliverable.
 * The daemon's GitHub heartbeat owns PR status from there; agents are fully
 * decoupled from PR tracking and do not wait on or react to PR signals.
 */
export class GithubCapability extends AgentCapability<Record<string, never>> {
  public readonly id = 'github';
  public readonly description = 'Attaches GitHub pull requests to task deliverables for the daemon to track.';

  public override hookOnRegister() {
    return {
      system: systemPrompt,
      tools: [buildSubmitPrTool(this)],
    };
  }
}
