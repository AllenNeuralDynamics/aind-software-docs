# Software practices

## Core principles

Scientists and engineers are expected to adhere to a set of core principles about our software.

### Style

These standards are maintained by the [aind-library-template](https://github.com/AllenNeuralDynamics/aind-library-template). Use the template when creating new packages. Our maintained templates are:

| Template | URL |
| --- | --- |
| Python package | https://github.com/AllenNeuralDynamics/aind-library-template |
| Code Ocean capsule | ... |
| Code Ocean pipeline | ... |
| Analysis capsule | ... |

The decision to deviate from these style standards must be made in consultation with an entire team and be manager-approved. Deviations must be implemented by modifying the `pyproject.toml`. 

#### Standard

Package management should be handled by [uv](https://docs.astral.sh/uv/).

We use [ruff](https://docs.astral.sh/ruff/) to enforce [PEP 8](https://peps.python.org/pep-0008/) standards with [docstrings](https://peps.python.org/pep-0257/) in [NUMPY](https://numpydoc.readthedocs.io/en/latest/format.html) format. Line lengths should have a maximum of **100** characters.

Use `ruff check` and `ruff check --fix` to run ruff. [ruff-pre-commit](https://github.com/astral-sh/ruff-pre-commit) can be used to run ruff automatically via pre-commit hooks.

Releases should follow [semantic versioning](https://semver.org/) with `major.minor.patch` versions. Packages that have general use externally should be published to [pypi](https://pypi.org/), packages that are primarily for internal use should be installed from github releases. Use [conventional commits](https://www.conventionalcommits.org/en/v1.0.0/#summary) to determine semantic versioning for packages manually or via automated GitHub actions on protected branches, for example:

| Prefix | Commit message | Update |
| `<any>:` | | patch |
| `feat:` | | minor |
| `feat!:` or `fix!:` | Include `BREAKING CHANGE` and details | major |

Unit tests should use [pytest](https://docs.pytest.org/en/stable/). Coverage should be at 100%. Tests should be run before merging pull requests into `main` and `dev`.

GitHub automation should use the AIND [reusable workflows](https://github.com/AllenNeuralDynamics/.github/tree/main/.github/workflows).

#### Recommended

- Functions to be annotated with [type hints](https://peps.python.org/pep-0484/).
- Functions should not exceed a complexity of 10 paths.
- Functions should [return early](https://medium.com/swlh/return-early-pattern-3d18a41bba8) / [fail fast](https://en.wikipedia.org/wiki/Fail-fast_system).
- Code should be capable of being analyzed by static analysis tools.
- Modules (<1000 lines), classes, and functions (<100 lines) should be manageable size.
- Internal packages should use the naming pattern `<modality>-<process>` wherever possible.
- Packages should not be prefixed with our namespace (i.e. do not put `aind-` as a prefix).
- Internal dependencies should be pinned `==1.0.0` or use *both* a version floor and ceiling `>=1.0.0,<2`. 
- Unit tests should cleanup test files or write to temporary folders. Do not version auto-generated code or data in repositories.

### Code Review 

[TODO UPDATE] 
At least one other software developer needs to approve a pull request in order for it to be merged. Please be courteous when providing feedback. The team lead can resolve any conflicts. 

## Resources for SWEs

For research software engineers, [Good Research Code](https://goodresearch.dev/) is a good primer.

[Data structure fundamentals](https://www.crackingthecodinginterview.com/)
