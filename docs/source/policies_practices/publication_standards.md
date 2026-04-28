# Publication standards for Code Ocean

## How do I use this?

These standards are intended to make the code quality standards set out in the Open Science Policy document clearer and more usable in the context of code hosted on Code Ocean. In addition to organizing and clarifying these minimum standards, we have added details on best practices that should be preferred when possible.

## Standards and Best Practices

### Capsules and repositories

- Manuscript public collection must include capsules or pipelines for all processing code, from raw data to figures
- Internal capsules linked to a public github repository within AIND or AIBS github organization
- Released version of each capsule added to manuscript collection (requires author and description in capsule metadata, sync to github, and reproducible run).
- Open license and up-to-date readme in each capsule.
- Explicit link to github repo in each readme
    
    ```{note}
    This is a temporary solution that we hope to automate in the capsule release process.
    ```


#### Best practice

- Ask SciComp to create an internal CO collection early in the manuscript process, keep it up to date as components are added, then make it public on biorxiv submission.
- Consolidate capsules that process the same data type with compatible dependencies, and 
consider separating code within a capsule that has very different dependencies or hardware requirements

### Environments

- Explicitly specified (pinned) versions for all direct imports and other critical dependencies
- Versions stored in the Environment Builder, dockerfile, or other files linked during docker build (postinstall, requirements.txt etc)

#### Best practice

- Whenever possible use a dockerfile generated from the environment builder, with minimal code in postinstall.
- Remove any user- or editor-specific configuration, including untracked config files like the `.vscode` directory.
    
    ```{note}
    This is a temporary solution that we hope to automate in the capsule release process.
    ```

### Data access

- Briefly describe all experimental data types and other inputs in the readme
- All AIND data in external assets, linked to open data bucket, with metadata
- All other data documented and downloadable with clear instructions from a stable data repository

#### Best practice

- If many individual assets are used, create combined data assets to organize them by data modality or type
- When releasing a public collection, highlight especially interesting or reusable data by including assets directly in the collection.

### Running code

- Reproducible run script and/or clear instructions for running steps in order
- Code consolidated in `code` folder, with unused code removed or clearly documented.
- Notebooks must be runnable top to bottom with no interaction required

#### Best practice

- Link all steps end-to-end in a run script (within capsule) or pipeline (across capsules)
- Briefly explain all steps in readme
- For manual steps, save outputs as derived assets that downstream steps can use as input for a reproducible run, and document in readme, metadata and paper methods.
- For long-running steps, note approximate runtime in documentation; for very long steps, save outputs as derived assets also.
- Separate reusable components of the code into functions in python modules.
- Code used by multiple capsules should be moved to shared libraries.

### Generating figures

- Code must save figure files to the `results` folder, with clear file naming indicating the correspondence to manuscript figures.

#### Best practice

- Minimize manual postprocessing of figures (e.g. adjustments in Illustrator)
- Save a results asset from a reproducible run containing all figures, with provenance (and processing metadata).

### Code review

- Reviewer from outside the author list (preferably Scientific Computing) will adopt the perspective of an external user, and check that code is reproducible and intelligible
- Review completed and issues addressed before biorxiv or other publicity.
    
    ```{note}
    There may be exceptions to this as we adjust to the process, especially if infrastructure or other challenges prevent fulfilling the standards before a biorxiv release. The Capsule and Repositories requirements are a bare minimum, and all requirements must be met by final publication.
    ```

#### Best practice

- Reviewer should offer suggestions for refactoring to match best practices in this document and resolve code style issues (using flake8 as a guide).
    
    ```{note}
    We are currently working on developing a clearer process for code review, including
    a selection of automated linter rules for reviewers to check.
    ```

