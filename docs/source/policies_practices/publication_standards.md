# Publication standards for Code Ocean

This checklist is intended to make the code publication standards set out in the Open Science Policy document clearer and more usable in the context of code hosted on Code Ocean. The review process documents how we will help each other meet these standards. The best practices below go beyond the minimum standards to further promote reuse and reproducibility, and should be preferred when possible.

## Standards checklist

### Capsules and repositories
- [ ] Capsules (or pipelines) for all processing steps, from raw data to figures [^tools]
[^tools]: Tools that already have, or are progressing towards, a separate public release may be left out.
- [ ] Working copy of capsule shared internally and linked to a public github repository within AIND or AIBS github organization
- [ ] Released version of capsule added to manuscript collection (requires author and description in capsule metadata, sync to github, and reproducible run).
- [ ] Reproducible run script generates all outputs[^nb] (if manual steps are unavoidable, include step-by-step instructions and automate as much as possible).
[^nb]: This can trigger execution of notebooks (e.g. using nbconvert), as long as they run top to bottom with no interaction required.
- [ ] Figure outputs saved to `results` folder, with filenames indicating the corresponding figure number (and subpanel letter if possible).
- [ ] Code consolidated in `code` folder, with unused code removed or clearly documented.
- [ ] Explicitly specified (pinned) versions for all direct imports and other critical dependencies[^env]
[^env]: Versions must be recorded in the Environment Builder, dockerfile, or other files linked during docker build (postinstall, requirements.txt etc)

### Data
- [ ] All AIND data stored as external data assets (aind-open-data), with complete metadata 
- [ ] All *intermediate results* stored as external data assets (aind-open-data), with processing metadata added.
- [ ] All data from external sources documented and downloadable with clear instructions from a stable data repository, or mirrored in aind-open-data.
- [ ] If many individual assets are used, create combined data assets to organize them by data modality or type
- [ ] All data assets (combined if needed) added to public collection -- *intermediate results* should be included on a case-by-case basis.

### Readme and other docs
- [ ] Includes links to manuscript, github repo, and release capsule (add the latter before making a second release).[^*]
- [ ] Briefly describes all experimental data types and other inputs.
- [ ] Briefly describes all non-figure outputs (intermediate results).
- [ ] Briefly explains key analysis steps (reference relevant code by file or function names).
- [ ] LICENSE file at top level of repo (MIT license).

[^*]: This is a temporary solution that we hope to simplify/automate as part of the capsule release process.


## Code review

- Reviewer will adopt the perspective of an external user, and check that code meets these standards and is reproducible and reusable (able to identify and adjust key parameters, not necessarily understand each line).
- Reviewer must be a scientist who has not contributed to the capsule, but may be a manuscript author or someone otherwise knowledgeable about the general approach. A SciComp team member may be looped in for advise and oversight as necessary.
- Required edits will typically consist of moving/renaming, documenting, commenting, and otherwise making code intelligible without much refactoring.
- Review must be completed and issues addressed before biorxiv or other publicity.[^exc]
    
[^exc]: There may be exceptions to this as we adjust to the process, especially if infrastructure or other challenges prevent fulfilling the standards before a biorxiv release. The Capsule and Repositories requirements are a bare minimum, and all requirements must be met by final publication.

- Reviewer should also offer suggestions for refactoring to match best practices in this document and resolve code style issues (using flake8 as a guide).[^rev]
    
[^rev]: We are currently working on developing a clearer process for code review, including a selection of automated linter rules for reviewers to check.


## Additional best practices

- Ask SciComp to create an internal CO collection early in the manuscript process, keep it up to date as components are added, then make it public on biorxiv submission.
- Consolidate capsules that process the same data type with compatible dependencies, and 
consider separating code between capsules if it has very different dependencies or hardware requirements
- Whenever possible use a dockerfile generated from the environment builder, with minimal code in postinstall.
- Remove any user- or editor-specific configuration, including untracked config files like the `.vscode` directory.[^*]
- Trim down any very large files (including notebooks), and consider amending the git history as well if the repository size is very large.
- Where capsules depend on other capsules, link them in a pipeline
- For manual steps, save outputs as derived assets that downstream steps can use as input for a reproducible run, and document in readme, metadata and paper methods.
- For long-running steps, note approximate runtime in documentation; for very long steps, save outputs as derived assets also.
- Separate reusable components of the code into functions in python modules.
- Code used by multiple capsules should be moved to shared libraries.
- Minimize manual postprocessing of figures (e.g. adjustments in Illustrator)
