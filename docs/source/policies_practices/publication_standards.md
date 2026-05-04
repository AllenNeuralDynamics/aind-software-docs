# Publication standards for Code Ocean

This <project:#standards-checklist> is intended to make the code publication standards set out in the Open Science Policy document clearer and more usable in the context of code hosted on Code Ocean. The <project:#code-review-process> documents how we will help each other meet these standards. The <project:#additional-best-practices> below go beyond the minimum standards to further promote reuse and reproducibility, and should be preferred when possible.

## Standards checklist

```{admonition} Use this checklist on github
:class: hint

This link generator will let you open an issue on your capsule's github repository with the checklist pre-filled. You can use this to track tasks or coordinate with a reviewer.

<p>
<input type="text" id="userInput" placeholder="Github repository url">
<!-- Button to trigger the link generation -->
<button onclick="generateLink()">Generate Link</button>
<a id="resultLink" href="#" target="_blank"></a>
</p>

<script>
async function generateLink() {
    const value = document.getElementById('userInput').value;
    if (!value) return;

    const linkElement = document.getElementById('resultLink');
    const response = await fetch('../standards_checklist.md');
    const checklist = await response.text();

    const fullUrl = value + "/issues/new?title=Publication-standards&body=" + encodeURIComponent(checklist);
    linkElement.href = fullUrl;
    linkElement.innerText = "Open github issue";
}
</script>

```

```{include} standards_checklist.md
```

## Code review process

- Reviewer will adopt the perspective of an external user, and check that code meets these standards and is reproducible and reusable (able to identify and adjust key parameters, not necessarily understand each line).
- Reviewer must be a scientist who has not contributed to the capsule, but may be a manuscript author or someone otherwise knowledgeable about the general approach. A SciComp team member may be looped in for advise and oversight as necessary.
- Required edits will typically consist of moving/renaming, documenting, commenting, and otherwise making code intelligible without much refactoring.
- Review must be completed and issues addressed before biorxiv or other publicity.[^6]
[^6]: There may be exceptions to this as we adjust to the process, especially if infrastructure or other challenges prevent fulfilling the standards before a biorxiv release. The Capsule and Repositories requirements are a bare minimum, and all requirements must be met by final publication.

- Reviewer should also offer suggestions for refactoring to match best practices in this document and resolve code style issues (using flake8 as a guide).[^7]
[^7]: We are currently working on developing a clearer process for code review, including a selection of automated linter rules for reviewers to check.


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
