<!-- TITLE: Public datasets -->
<!-- SUBTITLE: -->

# Public datasets

Recently, there has been an explosion of publicly available datasets, as organizations and governments realize that
having the data in the open is the key to and unlocking new markets and ideas.

Grok is a perfect platform for consuming that data, making sense out of it, and sharing the insights. Out-of-the-box, it
comes with thousands of pre-built connections to public datasets with data on economics, climate, energy, finance, and
hundreds of other topics.

## OpenAPI

[OpenAPI](https://swagger.io/docs/specification/about/), also known as swagger, is a popular format that describes the
structure of the server APIs so that machines can read the document and use the service.

Datagrok platform integrates with OpenAPI really well. Once a swagger file is imported
(you can simply drag-and-drop yaml file into the app), its content gets translated to Datagrok connections, queries, and
functions. All of them can be combined and used in data jobs, calculations, info panels, etc.

There is a lot that can be done in Datagrok with OpenAPI except simply retrieving the data, and we encourage you
to [learn more about it](open-api.md).

The following data providers were integrated into Datagrok by simply importing their swagger file:

* AirNow
* OpenWeatherMap
* Alpha Vantage
* Quandl
* Commerce.gov

## Socrata

From [wikipedia](https://en.wikipedia.org/wiki/Socrata):
[Socrata](https://socrata.com/) develops and operates a government domain-specific, cloud-based data as a service
platform that breaks down government data silos. This platform has the ability to ingest, store and serve all variety of
public sector data workloads

* from small, static data to dynamic big data including real-time, sensor-based data emitted from internet of Things and
  smart city sensors and devices. The Socrata platform can store structured or unstructured operational, geospatial,
  financial and performance data and digital content like video footage.

Grok provides an easy way to discover, retrieve, and analyze any open dataset hosted on the Socrata platform. Look for
available datasets under the
[Socrata](https://public.datagrok.ai/connections?q=dataSource%3D%22socrata%22) connection in the 'Connect to Data'
window.

## Public databases hosted on grok

In addition to accessing external datasets, there are a number of publicly available databases that we mirror and host
on our platform. Some example of these databases are:

* [manually curated chemical database of bioactive molecules with drug-like properties](https://www.ebi.ac.uk/chembl/)
* `#{x.Demo:Aact."aact"}`
  * [publicly available relational database that contains all information (protocol and result data elements) about every study registered in ClinicalTrials.gov](https://aact.ctti-clinicaltrials.org/)
* `#{x.system:MoleculeNetDatasets:Toxcast."toxcast"}`
  * [extended data collection from the same initiative as Tox21, providing toxicology data for a large library of compounds based on in vitro high-throughput screening. The processed collection includes qualitative results of over 600 experiments on 8k compounds](https://www.epa.gov/chemical-research/exploring-toxcast-data-downloadable-data/)
* `#{x.system:MoleculeNetDatasets:Tox21."tox21"}`
  * [initiative created a public database measuring toxicity of compounds, which has been used in the 2014 Tox21 Data Challenge](https://tripod.nih.gov/tox21/challenge/data.jsp)
* `#{x.system:MoleculeNetDatasets:Sider."sider"}`
  * [is a database of marketed drugs and adverse drug reactions (ADR). The version of the SIDER dataset in DeepChem has grouped drug side effects into 27 system organ classes following MedDRA classifications measured for 1427 approved drugs](http://sideeffects.embl.de/se/?page=98/)
* `#{x.system:MoleculeNetDatasets:Pcba."pcba"}`
  * [is a subset selected from PubChem BioAssay (PCBA) containing biological activities of small molecules generated by high-throughput screening. The selection consists of 128 assays measured over 400,000 compounds](https://pubchem.ncbi.nlm.nih.gov/search/#collection=bioassays.)
* `#{x.system:MoleculeNetDatasets:Muv."muv"}`
  * is a benchmark dataset selected from PubChem BioAssay by applying a refined nearest neighbor analysis. The MUV
      dataset contains 17 challenging tasks for around 90,000 compounds and is specifically designed for validation of
      virtual screening techniques
* `#{x.system:MoleculeNetDatasets:Lipophilicity."lipophilicity"}`
  * [is a dataset curated from ChEMBL database containing experimental results on octanol/water distribution coefficient (logD at pH=7.4). Due to the importance of lipophilicity in membrane permeability and solubility, the task is of high importance to drug development](https://www.ebi.ac.uk/chembl/document_report_card/CHEMBL3301361/)
* `#{x.system:MoleculeNetDatasets:Hiv."hiv"}`
  * [was introduced by the Drug Therapeutics Program (DTP) AIDS Antiviral Screen, which tested the ability to inhibit HIV replication for over 40,000 compounds](https://wiki.nci.nih.gov/display/NCIDTPdata/AIDS+Antiviral+Screen+Data/)
