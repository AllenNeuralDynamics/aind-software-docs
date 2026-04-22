# Software practices

## Core principles

Scientists and engineers are expected to adhere to a set of core principles about our software.

The decision to deviate from these standards must be made on a per-package basis in consultation with an entire team and be manager-approved. Deviations must be implemented by modifying the `pyproject.toml` and/or relevant GitHub Actions. 

### Templates

These standards are maintained through the use of template repositories. Use the appropriate template when creating new repositories. Our maintained templates are:

| Template | URL |
| --- | --- |
| Python package | [aind-library-template](https://github.com/AllenNeuralDynamics/aind-library-template) |
| Code Ocean capsule | [aind-capsule-template](https://github.com/AllenNeuralDynamics/aind-capsule-template) |
| Code Ocean pipeline | [aind-pipeline-template](https://github.com/AllenNeuralDynamics/aind-pipeline-template) |

### Standards & Tools

- Package management must be handled by [uv](https://docs.astral.sh/uv/).
- All software must adhere to [PEP 8](https://peps.python.org/pep-0008/) standards with [docstrings](https://peps.python.org/pep-0257/) in [NUMPY](https://numpydoc.readthedocs.io/en/latest/format.html) format. Line lengths must have a maximum of **100** characters.
- We use [ruff](https://docs.astral.sh/ruff/) to enforce these standards. We modify the default settings of ruff in the following ways:
  - We explicitly [override ruff's default line length via pyproject.toml](https://docs.astral.sh/ruff/settings/#__tabbed_13_1)
  - Function parameters and return types to be annotated with [type hints](https://peps.python.org/pep-0484/).

- Use `ruff check` and `ruff check --fix` to run ruff. [ruff-pre-commit](https://github.com/astral-sh/ruff-pre-commit) can be used to run ruff automatically via pre-commit hooks. 

- Unit tests must use [pytest](https://docs.pytest.org/en/stable/). Coverage must be at 100%. Tests must be run before merging pull requests into `main` and `dev`.

- GitHub automation must use the AIND [reusable workflows](https://github.com/AllenNeuralDynamics/.github/tree/main/.github/workflows).

- Project documentation must be generated using [MkDocs](https://www.mkdocs.org/) with [mkdocstrings](https://mkdocstrings.github.io/) hosted through [Read the Docs](https://docs.readthedocs.com/platform/stable/index.html). Source code for the documentation must be in a root level `docs/` folder and examples must be in an `examples/` folder.

#### Recommendations

- Functions should not exceed a complexity of 10 paths.
- Functions should [return early](https://medium.com/swlh/return-early-pattern-3d18a41bba8) / [fail fast](https://en.wikipedia.org/wiki/Fail-fast_system).
- Code should be capable of being analyzed by static analysis tools.
- Modules (<1000 lines), classes, and functions (<100 lines) should be manageable size.
- Internal packages should use the naming pattern `<modality>-<process>` wherever possible.
- Packages should not be prefixed with our namespace (i.e. do not put `aind-` as a prefix).
- Internal dependencies should be pinned `==1.0.0` or use *both* a version floor and ceiling `>=1.0.0,<2`. 
- Unit tests should clean up test files or write to temporary folders. Do not version auto-generated code or data in repositories.
- TBD: Services should use structured logging using AIND standard format.
- TBD: pyproject.toml to be updated with individual authors?
- Software packages should be agnostic of the runtime infrastructure where possible. When not possible, use thin wrappers to the Python package, e.g. Code Ocean capsules should be thin wrappers to Python packages.
- Containerized environments should log their dependencies, e.g. Code Ocean capsules can use `pip list > /results/pip_list.txt`

### Security

- Environment files (.env) must not be committed
- Do not hardcode or otherwise expose secrets, tokens, or other credentials in unencrypted code
- Access Tokens must never be Permanent. We recommend no longer than 6 months.

### Branch Management

- `main` branch is reserved for production-ready code (deployed to a production environment or release).
- `dev` branch is the default branch for development and feature integration. It must be in a stable and deployable state (e.g., for integration tests) and contains code not yet released to production.
- Feature branches are used for developing new features, bug fixes, or other code changes. They must be Squash and Merged back into `dev` once work is complete and reviewed.
- `main` and `dev` branches must be protected and require at least 1 (human) review approval before merging.
- TBD: character limit in branch names, whether to require category prefixes or not

### Semantic Versioning

- Releases must follow [semantic versioning](https://semver.org/) with `major.minor.patch` versions.
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) to determine semantic versioning for packages manually or via automated GitHub actions on protected branches, for example: 

| Prefix | Commit message | Update |
| --- | --- | --- |
| `<any>:` | | patch |
| `feat:` | | minor |
| `feat!:` or `fix!:` | Include `BREAKING CHANGE` and details | major |

### Releases

Packages must use [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases) as their primary method of releasing. Packages that have general use externally should be published to [PyPI](https://pypi.org/). Packages that are primarily for internal use should be installed directly via GitHub Releases.

```bash
uv add git+https://github.com/AllenNeuralDynamics/aind-data-schema.git@v2.6.0
```

Each release should include a changelog listing all changes since the last release, with links to closed pull requests. This should be created using autogenerated GitHub Release Notes. If there are a large number of changes in a release, please provide a description of the most important changes at the top of the release notes.

### Level of Support

The template repositories include a support badge in their README.md indicating the current level of support from Neural Dynamics resources. These must be kept accurate and reflect the intended level of support, unrelated to responsiveness. Support badges must be one of the following: 

![support](https://img.shields.io/badge/support-supported-brightgreen) 
```html
![support](https://img.shields.io/badge/support-supported-brightgreen) 
```
![support](https://img.shields.io/badge/support-unsupported-red)
```html
![support](https://img.shields.io/badge/support-unsupported-red)
```

## Internal Operations

### Repository Permissions

All repositories must be created within the [AllenNeuralDynamics](https://github.com/AllenNeuralDynamics) GitHub organization. When creating a new repository, ensure that the appropriate GitHub Team is added to the repository. All repositories must add at least one GitHub Team. Teams should be added as Maintainer.

GitHub Teams:
- [Scientific Computing](https://github.com/orgs/AllenNeuralDynamics/teams/scientific-computing)
  - [Data Infrastructure](https://github.com/orgs/AllenNeuralDynamics/teams/data-infrastructure)
  - [Physio & Behavior Data](https://github.com/orgs/AllenNeuralDynamics/teams/physio-and-behavior-data)
  - TBD Data & Outreach
  - TBD Image Processing
- [SIPE](https://github.com/orgs/AllenNeuralDynamics/teams/sipe)
  - [SIPE Admin](https://github.com/orgs/AllenNeuralDynamics/teams/sipe-admin)
  - [SIPE SW](https://github.com/orgs/AllenNeuralDynamics/teams/sipe-sw)

### Code Review

We all want our code to be great. An essential part of this is getting eyes on it as early and often. To start a code review, open a Pull Request (PR) and add at least 1 team member as a reviewer via GitHub.

Please follow the [Google Code Review Guide](https://google.github.io/eng-practices/), which consists of two documents:

- [Author's Guide](https://google.github.io/eng-practices/review/developer/)
- [Reviewer's Guide](https://google.github.io/eng-practices/review/reviewer/)

The source code for the Google guide has been archived, but the content is still available and relevant.

The sections below describe practices that supplement the above guide:

- PRs should always be linked with an issue that is part of a Milestone.
- Every change to the codebase needs to be code reviewed, regardless of seniority.
- At least one other (human) software developer needs to approve a PR in order for it to be merged.
- Be courteous and respectful when providing and receiving feedback. Code review is a process to foster collaboration and improve code quality, and feedback is not personal.

See also [other Code Review resources](rse_resources.md#other-code-review-resources)

#### As an author

- Keep PRs small (~500 lines of code or fewer) and focused.
- Ensure code addresses the linked GitHub issue(s) and has been tested.
- Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/) to indicate the type of change.
  - For PRs into `dev`, the PR title **must** follow conventional commit format since it becomes the commit message after Squash and Merge.
- Use the PR description or comments to provide context or ask for in-depth review for various code aspects. For people who only need visibility, tag in comments rather than adding as a reviewer.
- Close the loop quickly. Follow up with your reviewer if you haven't heard back in 1 day.
- You are responsible for all aspects of the code modifications. You must be able to explain and justify all lines of code in your PR. This is especially important when using AI tools for code generation. Please see our [AI Generated Code](#ai-generated-code) guidelines for more details.

#### As a reviewer

- Review within 1 day unless otherwise communicated with the author. Code reviews are a normal part of a developer's day, and developers are expected to check for open PRs daily:
  - This [view from GitHub](https://github.com/pulls/review-requested) shows all PRs awaiting review.
  - Alternatively, utilize email notifications or your team's tracking board.
- Verify the code meets our standards and addresses the linked issue with the correct scope.
- Verify the code has been tested.
- Ensure author/reviewer consensus on the version bump the PR mandates (e.g., `BREAKING CHANGE` has been marked appropriately via conventional commits in the PR title).

### AI Generated Code

```{raw} html
<div class="admonition note">
<p class="admonition-title">Note</p>
<p>This guide collectively refers to large language models and AI agents as <em>AI Tools</em>.</p>
</div>
```

As an emerging technology, AI Tools have accelerated the creation of written code.
Because of the speed of technology development, always defer to the [Institute Policies](https://alleninstitute.sharepoint.com/sites/InstitutePolicies/SitePages/Third-Party-Generative-Artificial-Intelligence-Guidelines.aspx) and [approved tools and services](https://alleninstitute.sharepoint.com/sites/InstitutePolicies/SitePages/Third-Party-Generative-AI-Approved-%26-Disapproved-List.aspx) list first before relying on guidelines specified in this guide.


#### Expectations for Production Code

The following applies to code written or co-written by AI Tools:

- Code must still meet the coding standards specified above.
- Code must leverage or integrate with existing infrastructure and solutions to problems rather than sidestep/replace/duplicate them.
- Be prepared to justify every line of code you write or generate when submitting a PR. Do not offload this understanding solely to your reviewer.
- You are still responsible for maintaining this code.
- Code in a pull request must be reviewed by a human before it can be merged to _dev_ or _main_ branches. PRs cannot be merged by approvals solely given by AI Tools.

## Resources

Additional resources can be found at [Software Engineer Resources](rse_resources.md).