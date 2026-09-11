# Deploying pipelines across backends

A pipeline can use the same processing code on Code Ocean, local Docker, and a SLURM
cluster. Portability requires more than moving container images: source code, input
data, model files, metadata, and task resources must also be available on each backend.

This guide describes the approach being developed for the
[pophys pipeline](pophys_portability.md), informed by the ephys multi-backend pipeline
and Camilo Laiton's *Pipeline deployment guide - SmartSPIM example*. It supports the
discussion in [aind-software-docs#214](https://github.com/AllenNeuralDynamics/aind-software-docs/issues/214).
The development and promotion workflow below is a proposed practice, not a replacement
for the existing [pipeline versioning policy](../policies_practices/version_pipelines.md)
or an announcement that every AIND pipeline supports these backends.

## Separate the processing step from its deployment

Keep processing logic in installable libraries. A capsule should provide a small,
consistent entrypoint that prepares its inputs and calls the library. See
[Capsules vs Libraries](../explore_analyze/co_best_practices.md#capsules-vs-libraries).

Use standardized input and output layouts between steps. A backend change should not
change the processing algorithm, output filenames, or metadata contract. If an
environment change affects numerical results, evaluate and version that change rather
than treating it as deployment-only.

For a hand-written Nextflow DSL2 pipeline, keep the workflow in one `main.nf` and select
backend-specific configuration files. Executors, queues, CPU/memory limits, GPU flags,
container engines, bind mounts, and reporting paths belong in configuration.
Code Ocean UI-managed pipelines have a different source of truth; do not mix generated
pipeline configuration with a hand-maintained workflow without understanding which
files Code Ocean regenerates.

Record each step's capsule source commit, processing-library commit, container
reference, and required runtime assets in a version-controlled manifest. A capsule
commit and its installed library commit identify different repositories; neither is
interchangeable with a Code Ocean capsule ID.

### Capture a known-good run before refactoring

Select a computation whose results contain the required stages and artifacts. Record
its resolved parameters, raw input and model asset IDs, source pins, image references,
and whether it used debug/truncated data, caching, or disabled aggregation.
Preserve that evidence separately from new candidate defaults.

For Code Ocean pipeline API runs, pass the complete intended named-parameter set and
read the resolved values back. App-panel defaults can differ from repository examples.
Do not assume a repository's `pipeline_parameters.json` is used unless the workflow
actually reads that file at the mounted location. Declare the per-job data assets
explicitly and account for assets attached by the pipeline itself.

Declare global execution controls in the App Panel before relying on API overrides.
For the pipeline API, `named_parameters` is a top-level request field; it does not
make an undeclared control effective. Immediately compare every resolved parameter
against the submitted contract, especially smoke/debug selectors, input URLs, image
sets, and aggregation switches. A run name is not evidence of its execution mode.
Resolve the actual input path: a workflow's explicit S3 URL can take precedence over
an attached asset with a familiar mount name.

Verify the selected CO branch and fetched source before syncing. Git's advertised
`HEAD` identifies a default branch, not necessarily the branch selected in the UI.
Use the supported pipeline API for the installed SDK/platform, and inspect sync
results: a sync can push as well as pull.

When rebasing onto a known-good revision, compare both the source checkout and image
pin for every stage. A change confined to capsule `code/` may not require an image
rebuild when the task clones that code at startup; a library installed during image
creation does. Never identify the library revision from the capsule's checkout line.

## Build small, independently versioned images

Start with one image per processing step. Shared build tooling does not require a
shared fleet image. Different steps may need different Python versions, scientific
dependencies, or GPU runtimes.

Prefer a minimal suitable base over a general-purpose notebook environment. Use slim
Python images where possible and specialized environments where required. For example,
CaImAn may require conda-forge, while a classifier may require CUDA-enabled PyTorch.
Do not remove a library's declared dependencies solely to reach an image-size target.

Order the build so that frequently changed application code is installed last:

1. Install the OS and Python runtime.
2. Install the locked scientific and shared-library dependencies.
3. Build the processing library from an exact commit.
4. Install that library's noneditable wheel without resolving dependencies again.

Build compilers, temporary source checkouts, and wheelhouses in a separate build stage.
Copy or mount only what the runtime needs. Keep datasets and model weights outside
the image. Clean package caches within the layer that creates them, or use BuildKit
cache mounts that are not part of the final image.

A code-only library change should not invalidate the dependency layer. Keep its source
SHA out of dependency-layer inputs, while including changes to dependency declarations
and build tools in the appropriate cache keys. A shared-library change may invalidate
the dependency layer even when the processing library is unchanged.

Measure compressed layer size, runtime image size, and cache reuse separately.
An OCI archive's size is not the same as its extracted filesystem size. Inspect actual
build output and `docker history` rather than judging image size by Dockerfile length.

### Lock what the image actually installs

The library's dependency declarations remain the starting point. Record the resolved
versions, Git commits, Python version, base image, and relevant build tools used to
create an image. A branch name or a version tag is not an immutable content identifier.
Pin production image references by digest.

An exported Code Ocean Dockerfile reproduces a recipe, not necessarily a historical
environment. Ranged dependencies, moving Git branches, different package builds, and
base-image updates can change the result. A successful build log and runtime package
inventory provide additional evidence when reconstructing an environment.

Conda and pip installation phases must be considered separately. Do not ask the Conda
solver to supply a version that the historical build installed later through pip.
Conversely, do not allow pip to overwrite Conda's native packages without reviewing
the specific replacement. Two differently named distributions can also own the same
Python module, as with OpenCV's `cv2`. Check the effective import, not only package names.

### Validate the candidate before promotion

Check installed dependency compatibility, the actual library entrypoint, and native
imports inside the image. Importing a version-only package `__init__.py` is insufficient.
Use small numerical checks where practical, followed by representative data runs.

Include the workflow engine's task wrapper in runtime checks, not just the library.
Pophys CO trials required `ps` from `procps` for the Nextflow metrics wrapper before
the user script could start. Install and check required utilities in every applicable
image. Then run a deliberately non-scientific smoke task on the target backend.
An echoed image digest is a declaration, not independent proof of runtime identity.

Keep these milestones distinct:

| Milestone | What it establishes |
|---|---|
| Dependency resolution | The declared package constraints have a solution |
| Image build | The recipe completed and produced an artifact |
| Entrypoint/import checks | The installed code can load in that runtime |
| Data-backed comparison | Processing and metadata behave as intended on representative inputs |
| Backend run | Mounts, resources, credentials, scheduling, and outputs work on that backend |
| Release promotion | A reviewed, identified artifact is selected for production |

A GPU package importing on an Apple Silicon Mac under amd64 emulation does not
establish GPU execution. Run that check on the target GPU host. Similarly, an exit code
of zero does not establish that all workflow stages ran or that their outputs were
published. Inspect expected per-plane/per-step artifacts and emitted metadata.
Compare the computation's exit code and task logs with its status label; the observed
CO SDK has reported `end_status=succeeded` with exit code 1. If a mistaken submission
must be stopped, use a supported stop control (the UI when necessary), not deletion
as a cancellation workaround. Preserve the failed run as diagnostic evidence.

## Develop libraries without rebuilding for every edit

When a library is installed during image creation, changing its source means changing
the environment artifact. Updating only the capsule wrapper does not update that
installed library.

The proposed development mode separates compatible source experiments from production
packaging:

| Mode | Code selection | Rebuild requirement |
|---|---|---|
| Development | Exact library SHAs selected by a Git-tracked development manifest | Reuse an image only if its dependencies satisfy the selected code |
| Release candidate | Accepted library revisions installed in the image, without runtime overrides | Build and evaluate the candidate image |
| Production | Accepted candidate image selected by digest | Promote the same digest; do not rebuild during promotion |

The development manifest can select one or several processing libraries independently.
Each library's dependency declaration selects its shared metadata revision; different
steps may use different shared-library versions. Test their inter-step contracts rather
than requiring version equality across the fleet.

Record the actual source revisions and resolved environment used by each task, and
include the override selection in Nextflow cache identity. Released package versions
alone may not distinguish two experimental commits.

If dependencies outside the explicitly replaced library set are incompatible, stop
before scientific processing and request an image rebuild. Do not silently upgrade the
scientific environment at startup. The same manifest-selection mechanism should work
for standalone capsule runs and pipeline tasks. This mode is designed but is not yet
implemented in the pophys image-building work.

## Publish and promote exact artifacts

Candidate images may contain internal source code even when their Dockerfiles live in a
public repository. Review the distribution audience before publishing. For the pophys
work, Private and Internal GHCR visibility were the initial accepted audiences.
Public distribution was subsequently explicitly approved for all eleven development
packages after a CO pull-authentication failure. That project authorization is not
an organization-wide public-default policy or an independent audit of all layers.
Internal visibility includes authenticated enterprise members, not only repository
collaborators.

Before public publication, review the distribution rights and contents of every
version/layer, not only the current source tree. Public package visibility exposes
all versions and cannot be changed back to private according to
[GitHub's visibility documentation](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility).
Do not change source-repository visibility as a side effect. Keep publication tools
private/internal by default, reject unknown visibility, and require explicit
package-specific public opt-ins.

Treat container access and runtime source access separately. A public image can start
successfully and still fail if its task wrapper clones a nonpublic capsule repository.
Prefer self-contained images; otherwise inventory every runtime clone, verify the exact
pinned commit is accessible from the target worker, and document any deliberate source
visibility change. Libraries already installed during an authenticated build do not
need runtime repository access.

Image prefetch is backend-specific. A Singularity/Apptainer prefetch script can populate
a shared cache for local or SLURM runs. Do not assume that mechanism prefetches images
for Code Ocean AWS Batch, where task workers pull their own container images.

Use [GitHub Container Registry](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry)
with explicit candidate tags and record the resulting digests. GHCR creates a package on
its first push; there is no separate empty-package creation step. GitHub documents a
private default for first publication, but verify the effective visibility and access
settings rather than assuming them.

To publish a candidate already evaluated locally, copy its existing OCI archive instead
of rebuilding:

```bash
skopeo copy --preserve-digests \
  oci-archive:/path/to/candidate/image.tar \
  docker://ghcr.io/organization/image:candidate-tag
```

Before copying, reject an existing package with an unacceptable audience and refuse to
overwrite a candidate tag with different content. Afterward, compare the remote manifest
digest with the recorded local digest and verify package visibility. Keep a per-image
publication record so a retry can skip already matching artifacts.

Record OCI index and platform-manifest digests distinctly. On a macOS host inspecting
a Linux amd64 index, specify Skopeo `--override-os linux --override-arch amd64`;
host-platform selection errors do not by themselves show that an upload failed.
Verify anonymous access separately when public pulling is the intended contract.
Preserve older inventories as historical artifacts rather than rewriting them to
describe later builds or live visibility.

Update the production manifest separately after backend and scientific validation.
Publishing a candidate must not automatically change production.

A development-only image selector can evaluate exact candidate digests while leaving
the default image and source manifests intact. Validate the selector, every required
stage, and digest syntax before task submission; do not prepend a backend registry
host to a fully qualified external reference. This image-selection mechanism is
distinct from the proposed compatible-environment source overrides described above.

### Credentials and permissions

Source-repository access and package-registry access are separate permissions. A token
that can clone an internal library may still lack `read:packages` or `write:packages`.
Registry login can succeed while organization access remains blocked by SSO.

For local publication, use an appropriately scoped classic GitHub token and authorize
the organization through **Configure SSO** where required. Enter it at the password
prompt, not in source code, command arguments, or shared chat:

```bash
docker login ghcr.io --username YOUR_USERNAME
skopeo login ghcr.io --username YOUR_USERNAME
```

Docker Desktop and Skopeo may use different credential stores; a successful Docker login
does not prove Skopeo has credentials. Protect any registry auth file. Repository admin
access also does not imply organization-owner access.

For Actions, use `GITHUB_TOKEN` with the required package permissions and configure
[Manage Actions access](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)
where necessary. Use a separate, suitably scoped credential for internal source reads.
Confirm the approved use of organization secrets rather than assuming a secret's name
establishes its permissions.

Mount source credentials only while fetching Git objects. Run package build hooks in
subsequent steps without the secret mounted. Do not export internal source, wheels,
or image layers to a public repository's Actions cache. Private image visibility alone
does not protect intermediate build caches or verbose build logs.

## Keep development off the production branch

An on-demand Actions build can publish selected candidate images without updating
production. However, GitHub requires a `workflow_dispatch` workflow to exist on the
default branch before it can be manually dispatched against another ref.

If the production branch must remain untouched, build the feature checkout locally
with Docker/BuildKit or use a separate approved private builder. Do not change the
production branch merely to bootstrap the experiment. On Apple Silicon, explicitly
target `linux/amd64` when that is the deployment platform and account for emulation cost.

## Prepare the other backends

Pre-pull images and build Apptainer/Singularity SIFs on a compute node with sufficient
resources before submitting a large SLURM pipeline. Keep the cache and Nextflow work
directory accessible to the execution nodes. Avoid converting large images on an
undersized submission node.

GPU processes need both a scheduler allocation and container GPU access. Configure
queues, wall time, memory, and GPU flags for the actual cluster.

Do not assume the container root is writable. If task scripts create root-level
symlinks such as `/data`, `/results`, or `/scratch`, pre-existing directories can change
`ln -s` behavior, while a read-only SIF can reject the operation entirely. Design
explicit task-directory binds or another supported writable arrangement and verify it
as the ordinary cluster user. A writable overlay alone is not proof of permission to
write root-owned paths.

Treat models and schemas as explicit inputs, with stable identifiers and file hashes.
Prefer staged Nextflow paths over hidden mounts. Internal registry images require
credentials on the pulling backend; local login does not establish CO or cluster access.

Audit the complete path contract, not just library settings. Configurable library
input/output directories do not relocate Nextflow staging, root aliases, output globs,
or publication. Trace temporary files and model caches separately. In the audited
pophys workflow, only three of eleven stages receive pipeline I/O parameters and two
receive the temp parameter; this is not fleet-wide relocation support.

Keep launcher-side model discovery and container bind sources consistent. A host
`DATA_PATH` bind does not automatically change paths searched by Nextflow. Verify
task-visible `PIPELINE_NAME`, `PIPELINE_VERSION`, and `PIPELINE_URL` with every backend
config, and resolve all parameter-file overrides before validation and final logging.
On POSIX storage, check whether published outputs are symlinks into the work directory;
require durable copies or a documented work-directory retention contract.

The current pophys images target Linux amd64. Running them through Docker on another
host OS is distinct from native Windows support. Neither image platform declarations
nor Python `Path` usage establishes that a backend's mounts, permissions, GPU access,
or scientific outputs work.

For large S3 inputs, assess where staging occurs. Nextflow may otherwise make the
launcher stage terabytes through its work directory. An optional first processing task
that reads efficiently from S3 can avoid that bottleneck, provided input identity and
output contracts remain explicit.

## References

- [ephys multi-backend implementation](https://github.com/AllenNeuralDynamics/aind-ephys-pipeline/tree/co-main)
- [SmartSPIM pipeline](https://github.com/AllenNeuralDynamics/aind-smartspim-pipeline)
- [GitHub package visibility and access](https://docs.github.com/en/packages/learn-github-packages/configuring-a-packages-access-control-and-visibility)
- [GitHub Actions cache access restrictions](https://docs.github.com/en/actions/reference/workflows-and-actions/dependency-caching)
- [GitHub workflow dispatch](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows#workflow_dispatch)
- [Docker multi-stage builds](https://docs.docker.com/build/building/multi-stage/)
