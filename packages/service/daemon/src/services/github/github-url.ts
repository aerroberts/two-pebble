import type { ParsedGithubPrUrl } from './types';

export function parseGithubPrUrl(url: string): ParsedGithubPrUrl {
  const parsed = new URL(url);
  if (parsed.hostname !== 'github.com') {
    throw new Error('Only github.com pull request URLs are supported.');
  }
  const parts = parsed.pathname.split('/').filter(Boolean);
  if (parts.length < 4 || parts[2] !== 'pull') {
    throw new Error('Expected a GitHub pull request URL like https://github.com/owner/repo/pull/123.');
  }
  const number = Number(parts[3]);
  if (!Number.isInteger(number) || number <= 0) {
    throw new Error('GitHub pull request URL has an invalid PR number.');
  }
  return { repo: `${parts[0]}/${parts[1]}`, number };
}
