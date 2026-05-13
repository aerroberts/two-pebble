const ADJECTIVES = [
  'amber',
  'brave',
  'crisp',
  'dusty',
  'eager',
  'fuzzy',
  'gentle',
  'happy',
  'jolly',
  'lucky',
  'mellow',
  'nimble',
  'plucky',
  'quiet',
  'rapid',
  'silver',
  'sunny',
  'sturdy',
  'witty',
  'zesty',
];

const NOUNS = [
  'badger',
  'comet',
  'dolphin',
  'falcon',
  'glacier',
  'harbor',
  'island',
  'lantern',
  'meadow',
  'nebula',
  'orchid',
  'panda',
  'quartz',
  'raven',
  'sparrow',
  'tundra',
  'valley',
  'willow',
  'yarrow',
  'zephyr',
];

/**
 * Builds a short, readable slug like "amber-falcon-7k" suitable for a git branch.
 * Two random words plus a base36 suffix keep the name memorable but unique.
 * The suffix is short so the entire slug stays well under git ref limits.
 */
export function generateBranchSlug() {
  const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const suffix = Math.floor(Math.random() * 36 ** 3)
    .toString(36)
    .padStart(3, '0');
  return `${adjective}-${noun}-${suffix}`;
}
