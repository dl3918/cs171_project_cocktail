/* * * * * * * * * * * * * *
*        NetworkVis_old        *
* * * * * * * * * * * * * */

class NetworkVis {

    // constructor method to initialize the NetworkVis_old object
    constructor(parentElement, ingNodes, ingEdges){
        this.parentElement = parentElement;
        this.ingNodes = ingNodes;
        this.ingEdges = ingEdges

        this.initVis()
    }

    initVis() {
        // let vis = this;
        //
        // vis.margin = {top: 50, right: 50, bottom: 50, left: 50};
        // vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        // vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        //
        // // init drawing area
        // vis.svg = d3.select("#" + vis.parentElement).append("svg")
        //     .attr("width", vis.width)
        //     .attr("height", vis.height)
        //     .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        var nodes = null;
        var edges = null;
        var network = null;

        nodes = this.ingNodes
        edges = this.ingEdges
        console.log(nodes)
        console.log(edges)

        // Instantiate our network object.
        var container = document.getElementById(this.parentElement);
        var data = {
            nodes: nodes,
            edges: edges,
        };
        var options = {
            nodes: {
                shape: "dot",
                scaling: {
                    label: {
                        min: 8,
                        max: 20,
                    },
                },
            },
            interaction: {
                zoomView: false
            }
        };
        network = new vis.Network(container, data, options);

        // vis.wrangleData();
    }

    wrangleData() {
        let vis = this

        vis.updateVis()
    }

    updateVis() {
    }

}