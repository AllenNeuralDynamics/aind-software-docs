# Documentation guidelines

## What 

As a developer you are responsible for providing four kinds of documentation: **tutorials** for beginners learning how to use a tool, **how-to guides** for achieving specific goals, technical **reference** for understanding software, and **explanation** for understanding why tools were built the way they are. Our documentation is organized according to the [diataxis](https://diataxis.fr/) framework.

At a minimum, you must provide a technical **reference** in the `README.md` file in every GitHub repository that you maintain and update the standard headers in the [aind-library-template](https://github.com/AllenNeuralDynamics/aind-library-template): Usage, Level of Support, Installation.

All packages should include:

1. A **tutorial** aimed at total beginners using your package that walks them through a basic example.
2. **How-to guides** for specific use-cases of your package. Note that AIND-specific use cases should be documented in [aind-software-docs](https://github.com/AllenNeuralDynamics/aind-software-docs).

For packages that are fully released you should also add:

3. **Technical reference**, generally auto-generated library or API docs.
4. **Explanation** of technical or philosophical decisions made during development. Links to a preprint or paper can often take the place of an explanation section.

As an example, on the [aind-data-schema documentation](https://aind-data-schema.readthedocs.io/en/latest/example_workflow/example_workflow.html) the [Generating metadata](https://aind-data-schema.readthedocs.io/en/latest/example_workflow/example_workflow.html) section is a tutorial, the [Core and Component Schemas](https://aind-data-schema.readthedocs.io/en/latest/data_description.html) pages are reference, and the [Philosophy](https://aind-data-schema.readthedocs.io/en/latest/general.html) sections provide some explanation of *why* certain decisions were made.

## How

Libraries built using the `aind-library-template` automatically have a read-the-docs documentation built-in. You can write `.rst` files or add the `myst-parser` package and write `.md` files. You can deploy your documentation directly on the [read-the-docs](https://readthedocs.org).

You can contribute updates and how-to guides for your tools directly to this repository with a pull request and review.

## Why

Data and software at AIND has grown to a scale where a central entry-point for users should make it far easier to find and learn about our tools. Across packages we are also taking a variety of approaches to documentation; iteratively moving toward a more standardized "feel" in our documentation will reduce the overhead for users who are only rarely interacting with documentation during their scientific work.
