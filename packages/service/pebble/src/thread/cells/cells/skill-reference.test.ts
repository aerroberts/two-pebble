import { describe, expect, test } from 'bun:test';
import { renderSkillReferenceText, skillReference } from './skill-reference';

describe('feature: skillReference cell', () => {
  test('compose-time: captures only id and name', () => {
    const cell = skillReference({ skillId: 'skills:abc', name: 'Log access' });
    expect(cell).toEqual({
      type: 'skillReference',
      content: { skillId: 'skills:abc', name: 'Log access' },
    });
  });

  test('resolve-time: carries description, folder, and files', () => {
    const cell = skillReference({
      skillId: 'skills:abc',
      name: 'Log access',
      description: 'Reads access logs',
      diskFolderPath: '/Users/x/skills/log-access',
      files: ['run.sh', 'README.md'],
    });
    expect(cell.content.files).toEqual(['run.sh', 'README.md']);
  });
});

describe('feature: renderSkillReferenceText', () => {
  test('happy: renders the index block the model receives', () => {
    const text = renderSkillReferenceText({
      skillId: 'skills:abc',
      name: 'Log access',
      description: 'Reads access logs',
      diskFolderPath: '/Users/x/skills/log-access',
      files: ['run.sh', 'README.md'],
    });
    expect(text).toBe(
      [
        '[skill: Log access] Reads access logs',
        'Folder (read/run with workspace tools): /Users/x/skills/log-access',
        'Files: run.sh, README.md',
      ].join('\n'),
    );
  });

  test('degrades: missing resolve fields render as empty rather than throwing', () => {
    const text = renderSkillReferenceText({ skillId: 'skills:abc', name: 'Log access' });
    expect(text).toBe(['[skill: Log access]', 'Folder (read/run with workspace tools): ', 'Files: '].join('\n'));
  });
});
