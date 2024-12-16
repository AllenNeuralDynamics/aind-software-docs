# Procedures

The `procedures.json` file provides a record of the procedures performed on the subject or tissue. 

The data transfer service generates a `procedures.json` file by referencing information from the internal Neurosurgery and Behavior and Lab Animal Services databases via the [metadata service](http://aind-metadata-service/). Any additional procedure information needs to be documented manually. 

## Subject vs Specimen 

Subject refers to the animal while specimen refers to extracted tissue. 

`subject procedures` surgical or behavioral procedures performed to a live subject  
`specimen procedures` procedures performed on extracted tissue after perfusion  

`subject_id` ID of the animal  
`specimen_id` tissue ID (if brain tissue is sectioned, each section will have a unique ID)

## IACUC Protocol vs Protocol ID 

`iacuc_protocol` all experimental work with animals must follow an IACUC (Institute Animal Care Use Committee) protocol 

`protocol_id` doi to a published protocol, found in either the [AIND protocols.io workspace](https://www.protocols.io/workspaces/allen-institute-for-neural-dynamics) or this list of [AIND published protocols](https://app.smartsheet.com/sheets/3XQgWWrXW3mh46xmXCw5Q9GfqQmmP4xwF9Cjfqg1?view=grid) 
