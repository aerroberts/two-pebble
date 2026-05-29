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
 * Lists a project's skills and hosts the create/edit modal. Skill content
 * is authored on disk, so there is no in-app body editor — the modal only
 * captures the metadata (name, description) and the absolute folder path the
 * daemon validates server-side.
 */
export function SkillsPage() {
  const projectId = useProjectId();
  const skills = useSkills({ projectId });
  const datastore = useRealtimeDatastore();
  const [editing, setEditing] = useState<SkillRecord | 'new' | null>(null);
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
          onNewSkill={() => setEditing('new')}
          onSelectSkill={setSelectedSkillId}
          selectedSkillId={selectedSkillId}
          skills={skillList}
        />
      }
      sidebarWidth="wide"
    >
      <PageLayout width="full">
        <Header
          actionItems={
            <ModalActions align="right">
              {selectedSkill !== null ? (
                <>
                  <Button leftIcon="folder-open" onClick={() => void openSelectedSkillOnDisk()}>
                    Open on disk
                  </Button>
                  <Button leftIcon="pencil" onClick={() => setEditing(selectedSkill)}>
                    Edit
                  </Button>
                </>
              ) : null}
              <Button leftIcon="plus" onClick={() => setEditing('new')} variant="primary">
                New skill
              </Button>
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
      {editing !== null ? (
        <SkillFormModal
          projectId={projectId}
          skill={editing === 'new' ? null : editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
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
    <Sidebar
      footer={
        <Button className="w-full" leftIcon="plus" onClick={props.onNewSkill} variant="primary">
          New skill
        </Button>
      }
      tone="auxiliary"
    >
      <SidebarSection title="Skills">
        {props.skills.length === 0 ? (
          <AppBox variant="sidebar-empty">{props.loading ? 'Loading skills.' : 'No skills yet.'}</AppBox>
        ) : (
          props.skills.map((skill) => (
            <SidebarOption
              active={skill.id === props.selectedSkillId}
              description={skill.diskFolderPath}
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
  return (
    <Surface>
      <dl className="grid gap-4 text-sm">
        <div>
          <dt className="font-heading text-[11px] font-normal uppercase tracking-[0.16em] text-content-muted">Name</dt>
          <dd className="mt-1 text-content">{props.skill.name.length > 0 ? props.skill.name : 'Untitled'}</dd>
        </div>
        <div>
          <dt className="font-heading text-[11px] font-normal uppercase tracking-[0.16em] text-content-muted">
            Description
          </dt>
          <dd className="mt-1 text-content">
            {props.skill.description.length > 0 ? props.skill.description : 'No description.'}
          </dd>
        </div>
        <div>
          <dt className="font-heading text-[11px] font-normal uppercase tracking-[0.16em] text-content-muted">
            File path
          </dt>
          <dd className="mt-1 break-all text-content">{props.skill.diskFolderPath}</dd>
        </div>
      </dl>
    </Surface>
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
