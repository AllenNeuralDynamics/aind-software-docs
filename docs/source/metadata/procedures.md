# Procedures

[Documentation for `procedures.json`](https://aind-data-schema.readthedocs.io/en/latest/procedures.html)

The `procedures.json` file provides a record of the procedures performed on the subject or tissue. 

The data transfer service generates a `procedures.json` file by referencing information from the internal Neurosurgery and Behavior and Lab Animal Services databases via the [metadata service](http://aind-metadata-service/). Any additional procedure information needs to be documented manually. 

You can find your `protocol_id` DOI for a published protocol either in the 
[AIND protocols.io workspace](https://www.protocols.io/workspaces/allen-institute-for-neural-dynamics) or this list of [AIND published protocols](https://app.smartsheet.com/sheets/3XQgWWrXW3mh46xmXCw5Q9GfqQmmP4xwF9Cjfqg1?view=grid).

## How do I create a procedure file?

You can create a procedure file using our [metadata entry web application](https://metadata-entry.allenneuraldynamics.org). You can also use 
the Allen-internal [metadata service](http://aind-metadata-service/), which automatically pulls subject procedure information from our Neurosurgery and Behavior database and Lab Animal Services database, capturing most surgeries, injections and perfusions.

As our SLIMS system continues to develop, this service will be able to pull more procedure information from SLIMS, but presently any additional surgeries must be documented manually. Note that this service is automatically used to pull procedure metadata any time data is uploaded with the [data transfer service](http://aind-data-transfer-service).
