import {
  useDeleteThirdPartyAgentInstall,
  useDetectClaudeCode,
  useThirdPartyAgentInstalls,
  useUpdateThirdPartyAgentInstall,
} from '@two-pebble/realtime';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

export function useThirdPartyAgentSettingsPageState() {
  const installs = useThirdPartyAgentInstalls();
  const params = useParams();
  const navigate = useNavigate();
  const installId = params.installId ?? '';
  const install = installs.getItem(installId);
  const [name, setName] = useState('');
  const [executablePath, setExecutablePath] = useState('');
  const [detecting, setDetecting] = useState(false);
  const [actionError, setActionError] = useState('');
  const deleteInstall = useDeleteThirdPartyAgentInstall();
  const updateInstall = useUpdateThirdPartyAgentInstall();
  const detectClaudeCodeInstall = useDetectClaudeCode();

  useEffect(() => {
    if (install?.value !== null && install?.value !== undefined) {
      setName(install.value.name);
      setExecutablePath(install.value.data.executablePath);
    }
  }, [install?.value]);

  const deleteSelectedInstall = () => {
    void deleteInstall({ id: installId });
    navigate('/configuration/third-party-agents');
  };

  const updateName = () => {
    if (install?.value === null || install?.value === undefined || name === install.value.name) {
      return;
    }
    void updateInstall({
      data: install.value.data,
      frameworkId: install.value.frameworkId,
      id: installId,
      name,
    });
  };

  const updateExecutablePath = () => {
    if (
      install?.value === null ||
      install?.value === undefined ||
      executablePath === install.value.data.executablePath
    ) {
      return;
    }
    void updateInstall({
      data: { executablePath },
      frameworkId: install.value.frameworkId,
      id: installId,
      name: install.value.name,
    });
  };

  const detectAndFillPath = async () => {
    setActionError('');
    setDetecting(true);
    try {
      const result = await detectClaudeCodeInstall();
      if (!result.detected) {
        setActionError('Could not find a `claude` executable on PATH. Install Claude Code first.');
        return;
      }
      setExecutablePath(result.executablePath);
      if (install?.value !== null && install?.value !== undefined) {
        void updateInstall({
          data: { executablePath: result.executablePath },
          frameworkId: install.value.frameworkId,
          id: installId,
          name: install.value.name,
        });
      }
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Could not detect Claude Code.');
    } finally {
      setDetecting(false);
    }
  };

  return {
    actionError,
    deleteSelectedInstall,
    detectAndFillPath,
    detecting,
    executablePath,
    install,
    installId,
    name,
    redirectToList: installId.length === 0,
    setExecutablePath,
    setName,
    updateExecutablePath,
    updateName,
  };
}
