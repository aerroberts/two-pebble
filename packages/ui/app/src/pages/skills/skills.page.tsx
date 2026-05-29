'use client';

import {
  AppBox,
  AuxiliarySidebarLayout,
  Button,
  Header,
  Input,
  MarkdownView,
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
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

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
    setSelectedFile(null);
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
          filesSkill={selectedSkill}
          loading={skills.status === 'loading'}
          onNewSkill={() => setEditing('new')}
          onSelectFile={setSelectedFile}
          onSelectSkill={(skillId) => {
            setSelectedSkillId(skillId);
            setSelectedFile(null);
          }}
          selectedFile={selectedFile}
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
          subtitle={selectedSkill?.diskFolderPath}
        >
          {selectedSkill?.name.length ? selectedSkill.name : 'Skills'}
        </Header>
        {selectedSkill === null ? (
          <AppBox variant="sidebar-empty">
            {skills.status === 'loading' ? 'Loading skills.' : 'No skills yet. Create one to get started.'}
          </AppBox>
        ) : (
          <SkillFileView selectedFile={selectedFile} skill={selectedSkill} />
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
  filesSkill: SkillRecord | null;
  loading: boolean;
  onNewSkill: () => void;
  onSelectFile: (file: string | null) => void;
  onSelectSkill: (skillId: string) => void;
  selectedFile: string | null;
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
      {props.filesSkill !== null ? (
        <SidebarSection title="Files">
          <SidebarOption
            active={props.selectedFile === null}
            icon="book-open"
            label="Overview"
            onClick={() => props.onSelectFile(null)}
          />
          <SkillFileTree selectedFile={props.selectedFile} skill={props.filesSkill} onSelectFile={props.onSelectFile} />
        </SidebarSection>
      ) : null}
    </Sidebar>
  );
}

function SkillFileTree(props: {
  onSelectFile: (file: string) => void;
  selectedFile: string | null;
  skill: SkillRecord;
}) {
  const datastore = useRealtimeDatastore();
  const [files, setFiles] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setFiles([]);
    setError(null);
    void datastore.skills
      .listFiles({ skillId: props.skill.id })
      .then((result) => {
        if (!cancelled) {
          setFiles(result.files);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [datastore, props.skill.id]);

  if (error !== null) {
    return <AppBox variant="sidebar-empty">{error}</AppBox>;
  }

  if (files.length === 0) {
    return <AppBox variant="sidebar-empty">No files found.</AppBox>;
  }

  return files.map((file) => {
    const depth = Math.max(0, file.split('/').length - 1);
    const label = file.split('/').at(-1) ?? file;
    return (
      <button
        className={`block w-full truncate rounded-lg py-1.5 pr-2 text-left text-[12px] leading-4 transition-colors ${
          props.selectedFile === file ? 'text-accent' : 'text-content-muted hover:text-content'
        }`}
        key={file}
        onClick={() => props.onSelectFile(file)}
        style={{ paddingLeft: `${0.75 + depth * 0.9}rem` }}
        title={file}
        type="button"
      >
        {label}
      </button>
    );
  });
}

function SkillFileView(props: { selectedFile: string | null; skill: SkillRecord }) {
  const datastore = useRealtimeDatastore();
  const [files, setFiles] = useState<string[]>([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFiles([]);
    setError(null);
    void datastore.skills
      .listFiles({ skillId: props.skill.id })
      .then((result) => {
        if (!cancelled) {
          setFiles(result.files);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      });
    return () => {
      cancelled = true;
    };
  }, [datastore, props.skill.id]);

  const indexFile = files.find((file) => file.toLowerCase() === 'index.md') ?? null;
  const fileToRead = props.selectedFile ?? indexFile;

  useEffect(() => {
    if (fileToRead === null) {
      setContent('');
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setError(null);
    void datastore.skills
      .readFile({ file: fileToRead, skillId: props.skill.id })
      .then((result) => {
        if (!cancelled) {
          setContent(result.content);
        }
      })
      .catch((caught: unknown) => {
        if (!cancelled) {
          setError(caught instanceof Error ? caught.message : String(caught));
        }
      })
      .finally(() => {
        if (!cancelled) {
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [datastore, fileToRead, props.skill.id]);

  if (error !== null) {
    return <AppBox variant="sidebar-empty">{error}</AppBox>;
  }

  if (props.selectedFile === null && indexFile === null) {
    return (
      <AppBox variant="sidebar-empty">
        This skill does not have an index.md file yet. Use Open on disk to add one to the skill folder.
      </AppBox>
    );
  }

  return (
    <Surface>
      <div className="mb-3 flex items-center justify-between gap-4 border-b border-border pb-3">
        <div className="min-w-0">
          <p className="truncate font-heading text-[13px] font-normal text-content">
            {props.selectedFile === null ? 'Overview' : props.selectedFile}
          </p>
          <p className="truncate text-[12px] text-content-muted">{fileToRead}</p>
        </div>
      </div>
      {loading ? (
        <p className="text-sm text-content-muted">Loading file.</p>
      ) : fileToRead?.toLowerCase().endsWith('.md') ? (
        <MarkdownView content={content} />
      ) : (
        <pre className="overflow-x-auto whitespace-pre-wrap break-words text-[12px] text-content">{content}</pre>
      )}
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
