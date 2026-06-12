---
orphan: true
---

# Explore, QC & analyze

Raw assets uploaded from platforms at AIND are run through automated pipelines that produce derived assets. You can explore these assets through the [Data Portal](https://data.allenneuraldynamics.org/assets).

The Data Portal exposes a range of views tailored to different slices of the data:

- The [**Assets**](https://data.allenneuraldynamics.org/assets) view is your entry point into all data assets acquired in Neural Dynamics.
- [**Subject**](https://data.allenneuraldynamics.org/subject) views let you explore the history of an experimental subject from birth through surgical procedures, data acquisitions, perfusion, etc. Clicking into individual events pulls up the detailed metadata about that event as well as interactive viewers.
- [**Project**](https://data.allenneuraldynamics.org/project) views show data acquisitions for each subject within a project, and can be used to identify the modality or behavior curriculum stage for each acquisition.

There are also Platform dashboards for each of the major platforms in Neural Dynamics:

| Platform | Dashboard | Internal Site |
| -- | -- | -- |
| SmartSPIM | [Dashboard](https://data.allenneuraldynamics.org/smartspim) | [Internal Site](https://alleninstitute.sharepoint.com/sites/NeuralDynamics/SitePages/SmartSPIM-Platform.aspx) |
| Fiber Photometry | [Dashboard](https://data.allenneuraldynamics.org/fiber_photometry) | [Internal site](https://alleninstitute.sharepoint.com/sites/NeuralDynamics/SitePages/Fiber-Photometry-Platform.aspx) |
| Dynamic Foraging | [Dashboard](https://data.allenneuraldynamics.org/dynamic_foraging)| |
| VR Foraging | [Dashboard](https://data.allenneuraldynamics.org/vr_foraging) | |

## I want to...

[Quality control my processed data assets](quality_control.md) before starting analysis.

[Find and query data](find_data.md) based on its stored metadata.

[Learn about different approaches to analyze data](analyze_data.md) in the cloud.

- [Learn about Code Ocean](co_best_practices.md) best practices.
- [Automate my analysis](analyze_data.md#analysis-framework) using the Analysis Framework.
- [Explore custom tools and apps](analyze_data.md#custom-tools) for annotation and data exploration.

[Add metadata to scientist-derived data](create_processing_metadata.md) so analysis outputs and imported data can become data assets.

[Find outreach events](outreach.md).

```{toctree}
:hidden:

quality_control
find_data
analyze_data
co_best_practices
create_processing_metadata
outreach
```
