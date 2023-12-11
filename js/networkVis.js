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
        var nodes = null;
        var edges = null;
        var network = null;

        nodes = this.ingNodes
        edges = this.ingEdges

        // Function to randomly select 5 cocktails from an array
        function getRandomCocktails(cocktailsArray) {
            return cocktailsArray.sort(() => Math.random() - 0.5).slice(0, 5);
        }

        // Modify the JSON data to include the "title" attribute with 5 randomly selected cocktails
        edges.forEach(record => {
            const randomCocktails = getRandomCocktails(record.cocktails);
            record.title = "Used in cocktails:\n"+randomCocktails.join('\n');
        });

        // Instantiate our network object.
        var container = document.getElementById(this.parentElement);
        var data = {
            nodes: nodes,
            edges: edges,
        };

        // legend
        var x = -container.clientWidth / 2 +50;
        var y = -container.clientHeight / 2 + 50;
        var step = 70;
        nodes.push({
            id: 1000,
            x: x,
            y: y,
            label: "Spirit",
            group: "spirit",
            value: 1,
            fixed: true,
            physics: false,
        });
        nodes.push({
            id: 1001,
            x: x,
            y: y + step,
            label: "Mixer",
            group: "mixer",
            value: 1,
            fixed: true,
            physics: false,
        });
        nodes.push({
            id: 1002,
            x: x,
            y: y + 2 * step,
            label: "Garnish",
            group: "garnish",
            value: 1,
            fixed: true,
            physics: false,
        });


        var options = {
            nodes: {
                shape: "dot",
                scaling: {
                    label: {
                        min: 10,
                        max: 30,
                    },
                },
            },
            interaction: {
                zoomView: false,
                dragView: false,
                hover:true,
                tooltipDelay: 100
                // hoverConnectedEdges: true
            }
        };



        network = new vis.Network(container, data, options);

    }

    wrangleData() {
        let vis = this

        vis.updateVis()
    }

    updateVis() {
    }

}