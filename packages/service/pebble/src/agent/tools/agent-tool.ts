import type { z } from 'zod/v4';
import type { CellContent, DataCells } from '../../thread';
import type { Agent } from '../agent';
import type { ToolResponseResult } from '../hooks/tool-response';
import type { ToolInput } from './tool-input';
import type { AgentToolType } from './types';

/**
 * Represents a Pebble-native tool.
 * The model calls this tool through serialized Pebble tags.
 */
export abstract class AgentTool {
  public abstract readonly id: string;
  public abstract readonly description: string;
  public abstract readonly type: AgentToolType;
  protected agent!: Agent;

  public input?: z.ZodSchema;
  public output?: z.ZodSchema;

  /**
   * Injects the owning agent so the tool can read identity and emit events.
   */
  public initialize(agent: Agent) {
    this.agent = agent;
  }

  /**
   * A way for the tool to describe itself to the model so it knows usage syntax.
   */
  public abstract describe(): DataCells;

  /**
   * Executes this tool from a parsed model call. Returns either a sync
   * result or a promise that resolves to one — the agent loop awaits both.
   * Async invocations let tools call into runners (sub-agent spawn, etc.)
   * without forcing the rest of the loop to be partially synchronous.
   */
  public abstract invoke(input: ToolInput): ToolResponseResult | Promise<ToolResponseResult>;
}
