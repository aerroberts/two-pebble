Use the GitHub capability when you have opened a pull request for a task deliverable.

Call `submit-pr` with the task deliverable id and pull request URL. This records the PR, submits the `pr_url` deliverable, and puts your owning task into waiting while the daemon tracks mergeability, checks, and merge state.

When you receive a PR update, inspect the reported state:
- `merged`: the task has been completed.
- `unmergeable` or `closed`: continue work or submit a replacement PR.
