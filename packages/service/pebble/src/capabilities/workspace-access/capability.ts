import { AgentCapability } from '../agent-capability';
import { buildBashTool } from './tools/bash/handler';
import { buildCreateFileTool } from './tools/create-file/handler';
import { buildEditFileTool } from './tools/edit-file/handler';
import { buildPatchFileTool } from './tools/patch-file/handler';
import { buildReadFileTool } from './tools/read-file/handler';
import { buildWriteFileTool } from './tools/write-file/handler';

/**
 * Exposes workspace-scoped shell + file tools to the agent. Every file
 * operation resolves paths inside `agent.workspacePath` and rejects anything
 * that escapes via absolute paths, parent traversal, or symlinks. Bash runs
 * with cwd locked to the workspace root. The capability holds no state — all
 * tools are pure side effects against disk.
 */
export class WorkspaceAccessCapability extends AgentCapability {
  public readonly id = 'workspace-access';
  public readonly description = 'Workspace-scoped shell and file tools (bash, read, create, write, edit, patch).';

  /**
   * Registers file and shell tools bound to the agent workspace.
   * Each handler receives the workspace root so path validation and cwd
   * selection stay consistent across tools.
   */
  public override hookOnRegister() {
    return {
      tools: [
        buildBashTool(this),
        buildReadFileTool(this),
        buildCreateFileTool(this),
        buildWriteFileTool(this),
        buildEditFileTool(this),
        buildPatchFileTool(this),
      ],
    };
  }

  public workspacePath(): string {
    return this.agent.workspacePath;
  }
}
