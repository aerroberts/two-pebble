import {
  useCreateThirdPartyAgentInstall,
  useDetectClaudeCode,
  useDetectCodex,
  useThirdPartyAgentInstalls,
} from '@two-pebble/realtime';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function useThirdPartyAgentsPageState() {
  const createInstall = useCreateThirdPartyAgentInstall();
  const detectClaudeCodeInstall = useDetectClaudeCode();
  const detectCodexInstall = useDetectCodex();
  const installs = useThirdPartyAgentInstalls();
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [detecting, setDetecting] = useState(false);
  const [actionError, setActionError] = useState('');

  const createBlankInstall = async () => {
    setActionError('');
    setCreating(true);
    try {
      const created = await createInstall({
        data: { executablePath: '' },
        frameworkId: 'claude-code',
        name: 'Claude Code',
      });
      navigate(`/configuration/third-party-agents/${created.id}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not create install.');
    } finally {
      setCreating(false);
    }
  };

  const detectClaudeCode = async () => {
    setActionError('');
    setDetecting(true);
    try {
      const result = await detectClaudeCodeInstall();
      if (!result.detected) {
        setActionError('Could not find a `claude` executable on PATH. Install Claude Code first.');
        return;
      }
      navigate(`/configuration/third-party-agents/${result.installId}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not detect Claude Code.');
    } finally {
      setDetecting(false);
    }
  };

  const detectCodex = async () => {
    setActionError('');
    setDetecting(true);
    try {
      const result = await detectCodexInstall();
      if (!result.detected) {
        setActionError('Could not find a `codex` executable on PATH. Install OpenAI Codex first.');
        return;
      }
      navigate(`/configuration/third-party-agents/${result.installId}`);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not detect OpenAI Codex.');
    } finally {
      setDetecting(false);
    }
  };

  return {
    actionError,
    createBlankInstall,
    creating,
    detectClaudeCode,
    detectCodex,
    detecting,
    installs,
    navigate,
  };
}
