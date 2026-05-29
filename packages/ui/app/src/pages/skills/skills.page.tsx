'use client';

import {
  Button,
  Header,
  Input,
  ListLayout,
  Modal,
  ModalActions,
  ModalBody,
  PageLayout,
  RelativeTime,
} from '@two-pebble/components';
import { type SkillRecord, useSkillMutations, useSkills } from '@two-pebble/realtime';
import { useState } from 'react';
import { useProjectId } from '../../project-context';

/**
 * Lists a project's skills and hosts the create/edit modal. Skill content
 * is authored on disk, so there is no in-app body editor — the modal only
 * captures the metadata (name, description) and the absolute folder path the
 * daemon validates server-side.
 */
export function SkillsPage() {
  const projectId = useProjectId();
  const skills = useSkills({ projectId });
  const [editing, setEditing] = useState<SkillRecord | 'new' | null>(null);

  return (
    <PageLayout width="fixed">
      <Header
        actionItems={
          <Button leftIcon="plus" onClick={() => setEditing('new')} variant="primary">
            New skill
          </Button>
        }
      >
        Skills
      </Header>
      <ListLayout
        emptyState={skills.status === 'loading' ? 'Loading skills.' : 'No skills yet — create one to get started.'}
        items={skills.values().map((skill) => ({
          icon: 'book-marked',
          key: skill.id,
          onClick: () => setEditing(skill),
          subtitle: skill.diskFolderPath,
          trailingAccessory: <RelativeTime date={skill.updatedAt} hideIcon />,
          title: skill.name.length > 0 ? skill.name : 'Untitled',
        }))}
      />
      {editing !== null ? (
        <SkillFormModal
          projectId={projectId}
          skill={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
    </PageLayout>
  );
}

function SkillFormModal(props: { projectId: string; skill: SkillRecord | null; onClose: () => void }) {
  const mutations = useSkillMutations();
  const isEditing = props.skill !== null;
  const [name, setName] = useState(props.skill?.name ?? '');
  const [description, setDescription] = useState(props.skill?.description ?? '');
  const [diskFolderPath, setDiskFolderPath] = useState(props.skill?.diskFolderPath ?? '');
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
      if (props.skill === null) {
        await mutations.createSkill({
          description: description.trim(),
          diskFolderPath: trimmedPath,
          name: trimmedName,
          projectId: props.projectId,
        });
      } else {
        await mutations.renameSkill({ id: props.skill.id, name: trimmedName });
        await mutations.updateSkillDescription({ description: description.trim(), id: props.skill.id });
        if (trimmedPath !== props.skill.diskFolderPath) {
          await mutations.updateSkillFolder({ diskFolderPath: trimmedPath, id: props.skill.id });
        }
      }
      props.onClose();
    } catch (error) {
      // The daemon validates the folder server-side and rejects a missing or
      // non-directory path; surface that as a field error rather than closing.
      setFolderError(error instanceof Error ? error.message : 'Could not save skill.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (props.skill === null) {
      return;
    }
    setSaving(true);
    try {
      await mutations.deleteSkill({ id: props.skill.id });
      props.onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      onClose={props.onClose}
      open
      subtitle="Point the skill at a folder on disk. Its files are listed into context when referenced with /skill."
      title={isEditing ? 'Edit skill' : 'New skill'}
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
          {isEditing ? (
            <Button disabled={saving} onClick={() => void handleDelete()}>
              Delete
            </Button>
          ) : null}
          <Button disabled={saving} onClick={props.onClose}>
            Cancel
          </Button>
          <Button disabled={saveDisabled} onClick={() => void handleSave()} variant="primary">
            {saving ? 'Saving' : isEditing ? 'Save' : 'Create skill'}
          </Button>
        </ModalActions>
      </ModalBody>
    </Modal>
  );
}
