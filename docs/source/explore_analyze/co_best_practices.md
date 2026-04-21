
# Best practices for working in Code Ocean

## General guidance

### Capsules vs Libraries

- Capsules should have a narrow, well-defined scope and leverage
  installable libraries as much as possible. Put another way, capsules
  should configure libraries to answer a question with specific data.

- Capsules can and should be re-usable, but ultimately the code in them
  should be relatively simple and specific to the question at hand.
  Generally, useful functions should find their way into libraries that
  can be installed into other capsules' environments.

- The code within a capsule should call library functions in a specific
  order or be dataset specific.

- By placing code in GitHub libraries, it's easier for code to be
  adopted by internal and external users for new purposes.

- Capsules are git repositories. They can be easily synchronized with
  GitHub if created with the "Clone from Git" option. Recommended
  workflow:

  - On GitHub, use the
    [aind-capsule-template](https://github.com/AllenNeuralDynamics/aind-capsule-template)
    repository to create your own repo.

  - In Code Ocean, create a new capsule via the "Clone from Git" option.
    Note that this will require github credentials to be added in your
    CO account settings.

  - Now, your "commit changes" button in Code Ocean becomes a "sync"
    button.

### Collaboration

- When developing code, collaboration is best done on GitHub, not within
  Code Ocean. Individual contributors might have capsules where they
  develop code, but changes should be merged into a shared repository on
  GitHub.

- External users can run capsules in the public [Open Science
  Library](https://codeocean.com/explore?page=1&filter=all) with 10
  hours of free compute time. This can be used as a quick demonstration
  of code. If they want to develop their own analyses, they can use the
  github library to do further development outside of code ocean or pay
  for their own compute time on code ocean.

### Library Development

You can use Code Ocean to work with a library that is actively being
developed.

- To install a package from github in the environment builder, specify
  it in the format
  `git+https://github.com/<organization>/<package>.git#egg=<package>`
  (note that the package name appears twice). This will install and pin
  the latest version (by its commit hash), which you can force it to
  update on a future build by deleting the pinned version to move to the
  latest again (as with other environment builder packages).

- With this approach, the library source code will be installed (in
  "editable" mode) in the /src folder, which you can access (and edit)
  from VScode, but not from Jupyter. Be sure to sync your changes back
  to github if you edit though (they will be erased when the capsule
  rebuilds)!

- To run examples or tests from a library repository within Code Ocean,
  you can also create a capsule cloning the repo directly. You will need
  to configure an appropriate environment after creating the capsule (if
  you own the repo you may want to save this by committing the
  dockerfile). After launching a workstation, install the library in
  place via pip install -e .

- When transitioning work in a single capsule into a library, you can
  create submodules within the /code/ folder and make them installable
  by other users via github -- just create a pyproject.toml in the root
  of the capsule that points to the code location (and sets appropriate
  dependencies).

### Customization and Personalization

If you want to customize your workflow (e.g. user settings for themes,
font color, etc), then you can use the postInstall script to pull
configuration files from a github repo.

```bash
git clone <url-of-config-files>
# move files to relevant locations
```

- This won't work for VSCode/code-server settings, as those are stored
  inside the capsule filesystem (not available during the Docker build)
  -- on the plus side, setting changes here *are* persistent across
  rebuilds.

- Customizations of this nature are specific to code development, and
  shouldn't be included when sharing capsules with others. Before
  sharing the capsule, remove the customizations from the postInstall
  file.

## Tips for ...

### JupyterLab

- In a JupyterLab workstation, you can pop out notebook figures by right
  clicking and selecting "Create New View for Output." They won't be
  in floating windows, but you can keep them in view without scrolling
  and organize them within different tabs.

- Your matplotlib code runs, but the figures aren't displayed under your
  notebook cells? You likely need to set the backend of matplotlib to
  "inline" at the top of your notebook, using either:

  - `%matplotlib inline`

  - `get_ipython().run_line_magic('matplotlib', 'inline')`

### Code-server (VS Code fork)

- To use a more recent version of code-server than the CO default,
  install it directly in your postInstall. Example code:
  <https://gist.github.com/tmchartrand/5dfa687698cae6b349f86628de36f559>

- Leave your tab open if you have a process running Python, processes
  running in Visual Studio will be terminated when the tab is closed,
  unlike in JupyterLab.

#### Essential code-server settings

- "Git: Use Integrated Ask Pass": False

  - If your GitHub credentials are attached to your Code Ocean account,
    this will let code-server use those credentials rather than
    prompting you to log in to github for every git operation!

- "Python: Language server": Jedi

  - On certain versions of code-server, language server features like
    autocompletion and hints will not work in Jupyter notebooks with the
    default "Auto" setting.

  - Alternatively, install the "basedpyright" extension, and set the
    language server to "None"

### Pipelines

#### Template

Use the
[aind-pipeline-template](https://github.com/allenNeuralDynamics/aind-pipeline-template)
template repository to create a new pipeline. This will take care of
basic things like setting up a license.

#### Tagging

Tag your pipeline runs so we can monitor their cost and execution.
Create a nextflow.config file in your pipeline folder (same folder as
the main.nf script) and put the following in it:

`process.resourceLabels = ['allen-batch-pipeline': 'YOUR-TAG-GOES-HERE']`

Then replace YOUR-TAG-GOES-HERE with something appropriate and
relatively unique for your pipeline.

#### Resource Allocation

Do not request 512 GB of RAM. As of Code Ocean 2.19.4 (deployed April
2024), there is a bug that causes jobs to hang if you request that much
RAM. You can safely request up to 480GB of RAM.

### Environment Building

- If your environment build fails and you want to see the full build log
  (not the truncated log file linked by the "Run failed: See logs" red
  button that initially pops up), exit out of the "Run failed" window by
  clicking "< Back to Timeline" at the top. Then, in the "Environment
  Build Failed" event on your timeline, click on the blue "Build"
  hyperlink to open the full build log:
  ![](media/image1.png){width="2.146890857392826in"
  height="0.9835761154855643in"}

- If your environment is failing to build, you can debug locally in a
  conda environment, export the environment dependencies as a env.yml,
  and copy-paste this file into the conda option under your capsule
  environment tab. Much faster feedback loop then debugging through the
  code ocean UI.

- If your environment builds but immediately terminates when starting
  Jupyter notebook, it's possible that JupyterLab is not installed
  correctly. Code Ocean may attempt to automatically install/update
  JupyterLab. If it picks JupyterLab > 4.0, you will be missing the
  notebook executable. You can fix this by:

  - If JupyterLab has been added to your conda package list, remove it

  - Add the "notebook" package to your conda package list.

### Improving file I/O performance

Data access in cloud workstations differs from local workflows. To
fine-tune performance of your code, you will need to understand the
various filesystems you have available to you and how they interact with
different kinds of data assets. The following are available to you in a
cloud environment:pi

`<more to come>`

## How do I...?

*Ask your question here and someone will answer it*

### Install the GitHub Copilot extension in VSCode? 

The VScode in Code Ocean is actually code-server, which does not support
every extension in the VSCode extension marketplace. Instead, you can
use the following script to download and install extensions from the
official marketplace:
<https://gist.github.com/tmchartrand/0c46bdec6a4205aa7ce7555fd8f4c3b5>

(Note that Pylance is one extension that cannot be installed at all,
even using this workaround)

By default, extensions are not saved across rebuilds and this will need
to be done on every build (can be added to postInstall).

**Every time I rebuild the environment and then run a jupyter notebook
in VS Code it asks me to re-install the notebook extension in VS code.
How can I save these VS code extension installations?**

You can add custom extensions/packages to your VSCode environment in the
[post-install
script](https://gist.github.com/rhngla/81c7e5a7fa0b29de79b1d1bb2db12885).
 
Add model or simulation results as a data asset?

Save your model or simulation results as a data asset as you would any
other files produced during a capsule run. Output your files to the
"/results" folder and capture them by clicking on the run caret/chevron
in your capsule history and choosing "capture as data asset".

### Make my Streamlit app running in Code Ocean externally accessible?

Currently this is not possible.

Can we keep variables in memory while shutting down cloud workstations?

Instance RAM state is not preserved when instances are paused. By
default, instances should remain live for 60min before automatically
pausing. As a workaround, use a disk cache (on /scratch) to save results
for any slower-running functions -- this can be as simple as adding a
decorator from the built-in joblib.
(<https://joblib.readthedocs.io/en/latest/memory.html>)

### Download a data-asset to a local machine?

Generally, we should minimize how much data we are downloading from Code
Ocean. This is particularly true of larger data (GBs) that require long,
easily interruptible download times. That said:

- You can hover over most data assets in the My Data viewer and there is
  an option to download.

- If the data-asset is "external" then CO does not support direct
  downloads.

- You can run a cloud workstation, save the data-asset as a file in the
  "results" folder, and then download the dataset.

- S3fs is a python package for making AWS S3 bucket data look like files
  and folders.

### Generate interactive figures outside of a jupyter notebook?

Aside from Streamlit and Shiny applications, this is not possible at the
moment. Interactive figures that open in new windows (e.g. the "agg" or
"qt" backends for matplotlib) require access to desktop applications
installed on your local machine. Browser apps like Code Ocean do not
have an easy/secure way to ask applications to open outside of their
tab. For this reason, in-browser widgets like JupyterWidgets are the
preferred way to open interactive figures.

Python users: Code Ocean also is able to open streamlit applications
defined within a capsule. R users: the same is true for Shiny apps.

Update: Other web apps (in addition to streamlit/shiny) can likely be
viewed by running in a vscode/code-server workstation and using the
built-in port-forwarding, which generates a link to access the web app
process in a new tab.

### Transition an existing capsule without a github link to a new github-backed capsule?

Follow the steps for cloning a capsule to generate a Code Ocean git URL
([https://docs.codeocean.com/user-guide/compute-capsule-basics/version-control/clone-via-git](https://docs.codeocean.com/user-guide/compute-capsule-basics/version-control/clone-via-git...)
), then use this URL to import a new repository into github
(<https://github.com/new/import> using your CO account email and API
token as credentials). Finally, create a new capsule on Code Ocean as a
clone of this new github repo.

### Add my github credentials to code ocean?

<https://docs.codeocean.com/user-guide/git-provider-integration-guide/setting-up-the-integration>

As shown in the docs, make sure to use a github **classic token**, not a
fine-grained token. If you are accessing internal repositories, be sure
to configure SSO for the token and authorize it to access the relevant
organization.

### Start an AWS instance through Code Ocean and then SSH to it, avoiding the GUI?

This is technically possible but not supported now. Compute instances
are in a private network that is not open to public SSH access. This is
a security best practice. That said, if there is sufficient demand for
this workflow we can look into supporting this ([comment
here](https://github.com/AllenNeuralDynamics/aind-code-ocean-info/issues/60)).

### Request a new base image?

Base images can come from any public docker image registry. Ask @David
Feng directly or post on the Code Ocean Teams channel and tag David.

(reduce-screen-real-estate)=
### Reduce the screen real-estate used by Code Ocean (full-screen mode)?

In Mac, press ^ + cmd + F, or see below. In Windows, press F11.

![Full screen command screenshot](image.png)

(avoid-pipeline-api-permission-denied)=
### Avoid pipeline API "permission denied errors" despite being able to run capsules?

This problem can arise if two or more users collaboratively build a
pipeline together, and at least one capsule does not have sufficient AWS
credential secrets attached. This will show as a bypassable warning when
running the pipeline manually with "Reproducible Run", but will not run
via API. Attach AWS secrets to all capsules and the issue is resolved.

(create-nextflow-config)=
### Create a nextflow.config file to configure process execution?

Add a nextflow.config file to the pipeline directory. The process scope
controls process execution in the Nextflow workflow. Add the parameters
below to your nextflow.config file:

```nextflow
process {
  executor = 'awsbatch'
  queueSize = 100
  errorStrategy = 'retry'
  maxRetries = 20
  maxErrors = 100
}
```

`executor`: What is executing the pipeline.

`queueSize`: Number of parallel instances that can be executed at any
given time.

`errorStrategy`: How the pipeline should handle failures; in this case,
it will retry.

`maxRetries`: How many retries are performed.

`maxErrors`: Threshold for error accumulation in a given process.

Configuration white paper is found
[here](https://www.nextflow.io/docs/latest/config.html#configuration-file)
to see what other configurations are available.
