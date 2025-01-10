# aind-software-docs

## Contributing

Please read: https://docs.allenneuraldynamics.org/en/latest/docs.html 

## Development

To generate the rst files source files for the documentation locally, run

```bash
sphinx-apidoc -o docs/source/ src
```

Then to create the documentation HTML files, run

```bash
sphinx-build -b html docs/source/ docs/build/html
```

More info on sphinx installation can be found [here](https://www.sphinx-doc.org/en/master/usage/installation.html).
