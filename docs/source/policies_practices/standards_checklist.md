### Capsules and repositories
- [ ] Capsules (or pipelines) for all processing steps, from raw data to figures [^3]
[^3]: Tools that already have, or are progressing towards, a separate public release may be left out.
- [ ] Working copy of capsule shared internally and [linked to a public github repository](../how_to/github_backed_capsules.md) within AIND or AIBS github organization
- [ ] Released version of capsule added to manuscript collection (requires author and description in capsule metadata, sync to github, and reproducible run).
- [ ] Reproducible run script generates all outputs[^4] (if manual steps are unavoidable, include step-by-step instructions and automate as much as possible).
[^4]: This can trigger execution of notebooks (e.g. using nbconvert), as long as they run top to bottom with no interaction required.
- [ ] Figure outputs saved to `results` folder, with filenames indicating the corresponding figure number (and subpanel letter if possible).
- [ ] Code consolidated in `code` folder, with unused code removed or clearly documented.
- [ ] Explicitly specified (pinned) versions for all direct imports and other critical dependencies[^5]
[^5]: Versions must be recorded in the Environment Builder, dockerfile, or other files linked during docker build (postinstall, requirements.txt etc)

### Data
- [ ] All AIND data stored as external data assets (aind-open-data), with complete metadata 
- [ ] All {term}`intermediate result`s stored as external data assets (aind-open-data), with processing metadata added ([Tutorial](../explore_analyze/create_processing_metadata.md)).
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
