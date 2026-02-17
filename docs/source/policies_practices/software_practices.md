# Software practices

## Core principles

All of the teams in Scientific Computing adhere to a set of core principles about our software.

### Code Review 

At least one other software developer needs to approve a pull request in order for it to be merged. Please be courteous when providing feedback. The team lead can resolve any conflicts. 

### Style

We use `black`, `flake8`, and `interrogate` to enforce [PEP 8](https://peps.python.org/pep-0008/) standards with [docstrings](https://peps.python.org/pep-0257/) in [NUMPY](https://numpydoc.readthedocs.io/en/latest/format.html) format.

### Versioning

We use [semver](https://semver.org/) major.minor.patch versions, these are automatically incremented when you use the `aind-library-template`. Note that for major versions you need to put the exact string "BREAKING CHANGE" in the commit *comment* (not the title).

You should set patch version floor `>=1.0.0` and major version ceiling `<2` for each internal dependency that you use. This is good practice for all dependencies.

Team descriptions live in [AIND scientific computing teams](../aind/teams.md).

## Resources for SWEs

For research software engineers, [Good Research Code](https://goodresearch.dev/) is a good primer.

[Data structure fundamentals](https://www.crackingthecodinginterview.com/)
