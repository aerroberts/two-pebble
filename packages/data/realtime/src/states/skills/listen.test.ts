import { describe, expect, test } from 'bun:test';
import { listenToSkills } from './listen';
import { createSkillsState } from './state';
import type { SkillRecord, SkillsState } from './types';

type ListenerMap = {
  skillDeleted?: (payload: { id: string }) => void;
  skillUpdated?: (payload: SkillRecord) => void;
};

describe('feature: skills realtime listeners', () => {
  test('happy: skillUpdated replaces the registry entry', () => {
    const listeners: ListenerMap = {};
    const datastore = createFakeDatastore(listeners);
    const record = sampleSkill({ name: 'Updated' });

    listenToSkills({ datastore } as never);
    listeners.skillUpdated?.(record);

    expect(datastore.state.skills.getItem(record.id)?.value?.name).toBe('Updated');
  });

  test('happy: skillDeleted removes the registry entry', () => {
    const listeners: ListenerMap = {};
    const datastore = createFakeDatastore(listeners);
    const record = sampleSkill({ name: 'Deleted' });
    datastore.patch({ skills: datastore.state.skills.withItem(record.id, record, 'ready') });

    listenToSkills({ datastore } as never);
    listeners.skillDeleted?.({ id: record.id });

    expect(datastore.state.skills.getItem(record.id)).toBeNull();
  });
});

function createFakeDatastore(listeners: ListenerMap) {
  const state: SkillsState = createSkillsState();
  return {
    state,
    client: {
      listen: (name: keyof ListenerMap, handler: never) => {
        listeners[name] = handler;
      },
    },
    patch: (patch: Partial<SkillsState>) => {
      Object.assign(state, patch);
    },
  };
}

function sampleSkill(input: { name: string }): SkillRecord {
  return {
    id: 'skills:test',
    createdAt: 1,
    updatedAt: 2,
    name: input.name,
    description: '',
    projectId: 'proj_default',
    diskFolderPath: '/Users/x/skills/test',
  };
}
