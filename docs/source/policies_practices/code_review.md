# Code Review

We all want our code to be great. An essential part of this is getting eyes on it as early and often. To start a code review, open a Pull Request (PR) and add at least 1 team member as a reviewer via GitHub.

Please follow the [Google Code Review Guide](https://google.github.io/eng-practices/), which consists of two documents:

- [Author's Guide](https://google.github.io/eng-practices/review/developer/)
- [Reviewer's Guide](https://google.github.io/eng-practices/review/reviewer/)

The source code for the Google guide has been archived, but the content is still available and relevant.

The sections below describe practices that supplement the above guide:

- Every change to the codebase needs to be code reviewed, regardless of seniority.
- At least one other software developer needs to approve a PR in order for it to be merged.
- Be courteous and respectful when providing and receiving feedback. Code review is a process to foster collaboration and improve code quality, and feedback is not personal.

## As an author
- Keep PRs small (~500 lines of code or fewer) and focused.
- Link the PR to the relevant GitHub issue(s). If an issue crosses multiple repositories, attach subissues to the main issue and link the PR to the relevant subissue.
- Ensure code addresses the linked GitHub issue(s) and has been tested.
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to indicate the type of change, e.g. `feat: add new feature`, `fix: resolve bug`, `docs: update documentation`, etc.
  - For PRs into `dev`, the PR title must follow conventional commit format since it becomes the commit message after Squash and Merge.
- Close the loop quickly. Follow up with your reviewer if you haven't heard back in 1 day.

## As a reviewer
- Review within 1 day unless otherwise communicated with the author. Code reviews should be treated as a normal part of a developer's day, and it is good daily practice to check for open PRs awaiting your review, e.g. [one view from GitHub](https://github.com/pulls/review-requested).
- Verify the code meets our standards and addresses the linked issue with the correct scope.
- Verify the code has been tested.
- Ensure author/reviewer consensus on the version bump the PR mandates (e.g., `BREAKING CHANGE` has been marked appropriately via conventional commits in the PR title).

## Merging Pull Requests

- Once approved, PRs to `dev` branches should be merged using **Squash and Merge** to maintain a clean commit history.

## Other Resources

- Microsoft ISE Engineering Fundamentals Playbook [Code Reviews](https://microsoft.github.io/code-with-engineering-playbook/code-reviews/)
- Jetbrains Qodana [Python Code Review Checklist (With Examples)](https://www.jetbrains.com/pages/static-code-analysis-guide/python-code-review-checklist/)
- MIT 6.005 Software Construction [Reading 4: Code Review](https://ocw.mit.edu/ans7870/6/6.005/s16/classes/04-code-review/)