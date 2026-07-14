"""Configuration file for the Sphinx documentation builder."""

#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

from datetime import date

# -- Path Setup --------------------------------------------------------------
from os.path import abspath, dirname
from pathlib import Path

from aind_software_docs import __version__ as package_version

INSTITUTE_NAME = "Allen Institute for Neural Dynamics"

current_year = date.today().year

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = Path(dirname(dirname(dirname(abspath(__file__))))).name
copyright = f"{current_year}, {INSTITUTE_NAME}"
author = INSTITUTE_NAME
release = package_version

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

extensions = [
    "sphinx.ext.duration",
    "sphinx.ext.doctest",
    "sphinx.ext.autodoc",
    "sphinx.ext.napoleon",
    "sphinx_tippy",
    "sphinx_copybutton",
    "myst_parser",
]
templates_path = ["_templates"]
exclude_patterns = []
jupyter_execute_notebooks = "off"

# tippy
tippy_enable_wikitips = False
# Skip all except those starting with "#id" (footnote) or "../glossary"
tippy_skip_urls = [
    "^(?!#id|../glossary|glossary).*$",
]

# -- MyST configuration ------------------------------------------------------
myst_enable_extensions = [
    "colon_fence",
    "deflist",
    "fieldlist",
    "tasklist",
    "attrs_block",
]
myst_heading_anchors = 3

# -- Options for HTML output -------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#options-for-html-output

html_theme = "furo"
html_static_path = ["_static"]
html_favicon = "_static/favicon.ico"
html_theme_options = {
    "light_logo": "light-logo.svg",
    "dark_logo": "dark-logo.svg",
    "top_of_page_buttons": ["view", "edit"],
    "source_edit_link": "https://github.com/AllenNeuralDynamics/aind-software-docs/edit/main/docs/source/{filename}",
    "source_repository": "https://github.com/AllenNeuralDynamics/aind-software-docs",
    "source_branch": "main",
    "source_directory": "docs/source/",
}

html_title = "Data and Software"

# If true, "Created using Sphinx" is shown in the HTML footer. Default is True.
html_show_sphinx = False

# If true, "(C) Copyright ..." is shown in the HTML footer. Default is True.
html_show_copyright = False

# make the raw markdown file available in the output directory so it can be linked to
html_extra_path = ["policies_practices/standards_checklist.md"]


# -- Interactive diagrams ----------------------------------------------------
# Copy the canonical diagram JSON (source of truth in docs/source/diagrams/)
# into the built site's _static/diagrams/ so the React Flow viewer bundle
# (_static/diagrams-app/diagrams.js) can fetch them at runtime.
def _copy_diagram_json(app, exception):
    if exception is not None:
        return
    import shutil
    from pathlib import Path

    src = Path(app.srcdir) / "diagrams"
    dst = Path(app.outdir) / "_static" / "diagrams"
    if not src.is_dir():
        return
    for json_file in src.rglob("*.json"):
        target = dst / json_file.relative_to(src)
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(json_file, target)


def setup(app):
    app.connect("build-finished", _copy_diagram_json)