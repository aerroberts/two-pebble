interface CiStep {
  name: string;
  command: string[];
}

const CI_STEPS: CiStep[] = [
  { name: 'Lint', command: ['bun', 'run', 'lint:check'] },
  { name: 'Guard', command: ['bun', 'run', 'guard'] },
  { name: 'Typecheck', command: ['bun', 'run', 'typecheck'] },
  { name: 'Build', command: ['bun', 'run', 'build'] },
  { name: 'Database Check', command: ['bun', 'run', 'db:check'] },
  { name: 'Test', command: ['bun', 'run', 'test'] },
];

const failures: string[] = [];

for (const step of CI_STEPS) {
  console.log(`\n==> ${step.name}`);

  const result = Bun.spawnSync({
    cmd: step.command,
    stderr: 'inherit',
    stdout: 'inherit',
  });

  if (result.exitCode !== 0) {
    failures.push(`${step.name} exited with code ${result.exitCode}`);
  }
}

if (failures.length > 0) {
  console.error('\nCI failed:');
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exit(1);
}

console.log('\nCI passed.');
