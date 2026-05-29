'use client';

import {
  AppBox,
  AuxiliarySidebarLayout,
  Button,
  Header,
  Input,
  Modal,
  ModalActions,
  ModalBody,
  PageLayout,
  Sidebar,
  SidebarOption,
  SidebarSection,
  Surface,
} from '@two-pebble/components';
import { type SkillRecord, useRealtimeDatastore, useSkillMutations, useSkills } from '@two-pebble/realtime';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useProjectId } from '../../project-context';

/**
 * Lists a project's skills and hosts the create modal. Skill content
 * is authored on disk, so there is no in-app body editor — the modal only
 * captures the metadata (name, description) and the absolute folder path the
 * daemon validates server-side. Existing skill metadata is edited inline.
 */
export function SkillsPage() {
  const projectId = useProjectId();
  const skills = useSkills({ projectId });
  const datastore = useRealtimeDatastore();
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);

  const skillList = skills.values();
  const selectedSkill = useMemo(
    () => skillList.find((skill) => skill.id === selectedSkillId) ?? null,
    [skillList, selectedSkillId],
  );

  useEffect(() => {
    if (selectedSkillId !== null && skillList.some((skill) => skill.id === selectedSkillId)) {
      return;
    }
    setSelectedSkillId(skillList[0]?.id ?? null);
  }, [skillList, selectedSkillId]);

  const openSelectedSkillOnDisk = useCallback(async () => {
    if (selectedSkill === null) {
      return;
    }
    await datastore.skills.openFolder({ skillId: selectedSkill.id });
  }, [datastore, selectedSkill]);

  return (
    <AuxiliarySidebarLayout
      sidebar={
        <SkillsSidebar
          loading={skills.status === 'loading'}
          onNewSkill={() => setCreateModalOpen(true)}
          onSelectSkill={setSelectedSkillId}
          selectedSkillId={selectedSkillId}
          skills={skillList}
        />
      }
    >
      <PageLayout width="full">
        <Header
          actionItems={
            <ModalActions align="right">
              {selectedSkill !== null ? (
                <Button leftIcon="folder-open" onClick={() => void openSelectedSkillOnDisk()}>
                  Open on disk
                </Button>
              ) : null}
            </ModalActions>
          }
        >
          Skills
        </Header>
        {selectedSkill === null ? (
          <AppBox variant="sidebar-empty">
            {skills.status === 'loading' ? 'Loading skills.' : 'No skills yet. Create one to get started.'}
          </AppBox>
        ) : (
          <SkillDetailsView skill={selectedSkill} />
        )}
      </PageLayout>
      {createModalOpen ? <CreateSkillModal projectId={projectId} onClose={() => setCreateModalOpen(false)} /> : null}
    </AuxiliarySidebarLayout>
  );
}

function SkillsSidebar(props: {
  loading: boolean;
  onNewSkill: () => void;
  onSelectSkill: (skillId: string) => void;
  selectedSkillId: string | null;
  skills: SkillRecord[];
}) {
  return (
    <Sidebar footer={<SidebarOption icon="plus" label="New skill" onClick={props.onNewSkill} />}>
      <SidebarSection title="Skills">
        {props.skills.length === 0 ? (
          <AppBox variant="sidebar-empty">{props.loading ? 'Loading skills.' : 'No skills yet.'}</AppBox>
        ) : (
          props.skills.map((skill) => (
            <SidebarOption
              active={skill.id === props.selectedSkillId}
              icon="book-marked"
              key={skill.id}
              label={skill.name.length > 0 ? skill.name : 'Untitled'}
              onClick={() => props.onSelectSkill(skill.id)}
            />
          ))
        )}
      </SidebarSection>
    </Sidebar>
  );
}

function SkillDetailsView(props: { skill: SkillRecord }) {
  const mutations = useSkillMutations();
  const [name, setName] = useState(props.skill.name);
  const [description, setDescription] = useState(props.skill.description);
  const [diskFolderPath, setDiskFolderPath] = useState(props.skill.diskFolderPath);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setName(props.skill.name);
    setDescription(props.skill.description);
    setDiskFolderPath(props.skill.diskFolderPath);
    setError(null);
  }, [props.skill]);

  const saveMetadata = async () => {
    const nextName = name.trim();
    const nextDescription = description.trim();
    const nextDiskFolderPath = diskFolderPath.trim();

    if (nextName.length === 0) {
      setError('Name is required.');
      return;
    }
    if (nextDiskFolderPath.length === 0) {
      setError('Folder path is required.');
      return;
    }
    if (
      nextName === props.skill.name &&
      nextDescription === props.skill.description &&
      nextDiskFolderPath === props.skill.diskFolderPath
    ) {
      return;
    }

    setSaving(true);
    setError(null);
    try {
      if (nextName !== props.skill.name) {
        await mutations.renameSkill({ id: props.skill.id, name: nextName });
      }
      if (nextDescription !== props.skill.description) {
        await mutations.updateSkillDescription({ description: nextDescription, id: props.skill.id });
      }
      if (nextDiskFolderPath !== props.skill.diskFolderPath) {
        await mutations.updateSkillFolder({ diskFolderPath: nextDiskFolderPath, id: props.skill.id });
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not update skill.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Surface>
      <div className="grid gap-3">
        <Input
          disabled={saving}
          label="Name"
          onBlur={() => void saveMetadata()}
          onChange={(event) => setName(event.target.value)}
          value={name}
        />
        <Input
          disabled={saving}
          label="Description"
          onBlur={() => void saveMetadata()}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this skill does and when to use it"
          value={description}
        />
        <Input
          disabled={saving}
          label="Folder path"
          leadingIcon="folder"
          onBlur={() => void saveMetadata()}
          onChange={(event) => setDiskFolderPath(event.target.value)}
          value={diskFolderPath}
        />
        {error !== null ? <p className="text-[12px] leading-4 text-danger">{error}</p> : null}
      </div>
    </Surface>
  );
}

function CreateSkillModal(props: { projectId: string; onClose: () => void }) {
  const mutations = useSkillMutations();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [diskFolderPath, setDiskFolderPath] = useState('');
  const [folderError, setFolderError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const trimmedName = name.trim();
  const trimmedPath = diskFolderPath.trim();
  const saveDisabled = saving || trimmedName.length === 0 || trimmedPath.length === 0;

  const handleSave = async () => {
    if (saveDisabled) {
      return;
    }
    setSaving(true);
    setFolderError(null);
    try {
      await mutations.createSkill({
        description: description.trim(),
        diskFolderPath: trimmedPath,
        name: trimmedName,
        projectId: props.projectId,
      });
      props.onClose();
    } catch (error) {
      // The daemon validates the folder server-side and rejects a missing or
      // non-directory path; surface that as a field error rather than closing.
      setFolderError(error instanceof Error ? error.message : 'Could not save skill.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={props.onClose}
      open
      subtitle="Point the skill at a folder on disk. Its files are listed into context when referenced with /skill."
      title="New skill"
    >
      <ModalBody>
        <Input label="Name" onChange={(event) => setName(event.target.value)} placeholder="Log access" value={name} />
        <Input
          label="Description"
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What this skill does and when to use it"
          value={description}
        />
        <Input
          label="Folder path"
          leadingIcon="folder"
          onChange={(event) => {
            setDiskFolderPath(event.target.value);
            setFolderError(null);
          }}
          placeholder="/Users/you/skills/log-access"
          value={diskFolderPath}
        />
        {folderError !== null ? <p className="text-[12px] leading-4 text-danger">{folderError}</p> : null}
        <ModalActions>
          <Button disabled={saving} onClick={props.onClose}>
            Cancel
          </Button>
          <Button disabled={saveDisabled} onClick={() => void handleSave()} variant="primary">
            {saving ? 'Saving' : 'Create skill'}
          </Button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
