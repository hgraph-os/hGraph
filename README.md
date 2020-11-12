hGraph: Your health in one picture.
========

An open source javascript-based web application for visualizing health data.

![hGraph](https://github.com/goinvo/hGraph/blob/master/docs/hgraph.png)

Website: [hgraph.org](http://hgraph.org/)

hGraph Demo: http://demo.hgraph.org/

hGraph React Component: https://github.com/goinvo/hgraph-react

hGraph on FHIR: https://github.com/symptomatic/hgraph-on-fhir

hGraph + Spider chart library demo: https://goinvo.github.io/VisualizationComponents/

with the Github repo: https://github.com/goinvo/VisualizationComponents

hMixer Repo: https://github.com/goinvo/hMixer

### About the REPO ###

The hGraph is an open source project that is being developed and designed to provide an industry standard of presenting health care information to professionals and average citizens alike.


### Dependencies ###

The `HGraph` class relies on [d3.js](http://d3js.org/), which is a popular javascript library for manipulating SVG, specficically for graphs and data plotting.

Once you have downloaded the latest version, you will need to include it in your html above the `HealthGraph` source code:

        <script src="/path/to/your/d3.js" type="text/javascript"></script>
        <script src="/path/to/your/HealthGraph.js" type="text/javascript"></script>

### Setup ###

During a `window.onload` or similar entry point, the health graph is constructed and intialized by:

        var graph;
        window.onload = function(){

                graph = new HGraph({
                        container : document.getElementById("graph_container"),
                        userdata  : {
                                                        overallScore : 90,
                                                        factors      :
                                                        [
                                                                {
                                                                        label : 'Family History',
                                                                        score : 80,
                                                                },
                                                                {
                                                                        label : 'Caloric Intake',
                                                                        score : 100
                                                                }
                                                        ]
                        };
                });

                graph.initialize();

        }


### Want to Contribute? Here is how you can help ###
For designers and engineers:
* What's version 2 of hGraph?
* Repo evolves from a demo into a production-ready component others can integrate with minimal effort
* CSS refinement of hGraph (making it beautiful)
* JS help to make hGraph an easy to use, plug n’ play JS library for visualizing data
* Scales beautifully for both desktop and mobile
* [hGraph uses Standard Health Record as the data model for patient health data](http://standardhealthrecord.org/) 
* Provide multi-level view and connection of health data
  - [Determinants of Health](http://www.goinvo.com/features/determinants-of-health/) (ex. Holistic view of all data, missing data)
  - hGraph main, high-level view
  - hGraph secondary detailed view
  - Design the population hGraph for your neighborhood, city, clinic, nation.

For clinicians and researchers:
* [Make a hScore. Evolve the scoring algorithm](https://github.com/goinvo/hMixer)
* What are the top metrics to show (at the "global" hGraph level)? What are the correct groupings and sub metric groupings?
* What are the chronic disease patterns (the outlines on hGraph) and how do we arrange the metrics to better see those conditions?
* What are we missing from the everyday diagnostic tool clinicians use? How do we improve hGraph to rock your in-patient encounter experience? Population diagnostic experience?

### Roadmap ###
[Roadmap](https://docs.google.com/document/d/1IiRXmd64ZKRt3mrrDPn4E2GWY5KBm_4VFHAtwOndPZA/)

### Core Contributors ###
Founders/Designers: [GoInvo](http://www.goinvo.com/) is a digital design studio in Boston, crafting the future of healthcare through strategy, creativity, and vision.

### Contact Us ###
[hgraph@goinvo.com](mailto:hgraph@goinvo.com)

### License ###
hGraph is [Apache 2.0](https://github.com/goinvo/hGraph/blob/master/LICENSE) licensed.

### For guidance integrating hGraph into your product or service, contact us at hello@goinvo.com. ###
