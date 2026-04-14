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

Individual projects that deviate from these standards **must do so by modifying the pyproject.toml**.

#### Standard

Package management should be handled by [uv](https://docs.astral.sh/uv/).

We use [ruff](https://docs.astral.sh/ruff/) to enforce [PEP 8](https://peps.python.org/pep-0008/) standards with [docstrings](https://peps.python.org/pep-0257/) in [NUMPY](https://numpydoc.readthedocs.io/en/latest/format.html) format. Use `ruff check` and `ruff check --fix`. Line lengths should have a maximum of **100** characters, or more.

Releases should follow [semantic versioning](https://semver.org/) with `major.minor.patch` versions. Only external-facing packages should be published to [pypi](https://pypi.org/), internal packages should be installed from github releases. Use the following prefixes to trigger version updates automatically after merges to main:

| Prefix | Update |
| `<any>:` | patch |
| `feat:` | minor |
| `BREAKING CHANGE` | major |

Unit tests should use [pytest](https://docs.pytest.org/en/stable/). Coverage should be at 100%. The decision to lower test coverage below 100% must be made in consultation with an entire team and be manager-approved. Tests should be run before merging pull requests into `main` and `dev`.

#### Recommended

- Functions to be annotated with [type hints](https://peps.python.org/pep-0484/).
- Functions should not exceed a complexity of 10 paths (ruff default).
- Functions should [return early](https://medium.com/swlh/return-early-pattern-3d18a41bba8) / [fail fast](https://en.wikipedia.org/wiki/Fail-fast_system).
- Code should be capable of being analyzed by static analysis tools.
- Modules (<1000 lines), classes, and functions (<100 lines) should be manageable size.
- Internal packages should use the naming pattern `<modality>-<process>` wherever possible.
- Packages should not be prefixed with our namespace (i.e. do not put `aind-` as a prefix).
- Internal dependencies should use *both* a version floor and ceiling `>=1.0.0,<2`. 
- Unit tests should cleanup test files or write to temporary folders. Do not version auto-generated code or data in repositories.

### Code Review 

[TODO UPDATE] 
At least one other software developer needs to approve a pull request in order for it to be merged. Please be courteous when providing feedback. The team lead can resolve any conflicts. 

## Resources for SWEs

For research software engineers, [Good Research Code](https://goodresearch.dev/) is a good primer.

[Data structure fundamentals](https://www.crackingthecodinginterview.com/)
