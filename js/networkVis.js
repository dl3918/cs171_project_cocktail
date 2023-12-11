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

        // Instantiate our network object.
        var container = document.getElementById(this.parentElement);
        var data = {
            nodes: nodes,
            edges: edges,
        };

        // legend
        var x = -container.clientWidth / 2 + 50;
        var y = -container.clientHeight / 2 + 50;
        var step = 70;
        nodes.push({
            id: 1000,
            x: x,
            y: y,
            label: "Mixer",
            group: "mixer",
            description: "Mixer is what you add to the alcohol to enhance its flavor, like juice or soda.",
            value: 6,
            fixed: true,
            physics: false,
        });
        nodes.push({
            id: 1001,
            x: x,
            y: y + step,
            label: "Spirit",
            group: "spirit",
            description: "Spirit is the core alcoholic ingredient of any cocktail, such as whiskey or gin, that sets the stage for the drink.",
            value: 6,
            fixed: true,
            physics: false,
        });
        nodes.push({
            id: 1002,
            x: x,
            y: y + 2 * step,
            label: "Garnish",
            group: "garnish",
            description: "Garnish is the decorative touch, like a slice of lemon or olive that adds a bit of zest and eye appeal to your cocktail.",
            value: 6,
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
                borderWidthSelected: 3,
                font: {
                    face: 'Amatic SC',
                    size: 20,
                },
            },
            edges:{

            },
            layout: {
                randomSeed:"0.30393262567808477:1702276630643"
                // randomSeed: "0.20431354987244443:1702265528605"
                // randomSeed: "0.8287605638294304:1702263942549"
            },
            interaction: {
                zoomView: false,
                dragView: false,
                hover:true,
                tooltipDelay: 0,
                selectConnectedEdges: false
            },
        };

        network = new vis.Network(container, data, options);
        console.log(network.getSeed());

        network.on("selectNode", function (params) {
            let selectedIngredient = nodes.find(({id}) => id === params.nodes[0]);
            if (params.nodes[0] === 1000 || params.nodes[0] === 1001 || params.nodes[0] === 1002) {
                document.getElementById("network-info-title").innerText = selectedIngredient.description;
                document.getElementById("network-info-content").innerText = "";
            }
            else {
                document.getElementById("network-info-title").innerText = selectedIngredient.label + " is usually paired with:";
                let connectedIngredients = this.getConnectedNodes(params.nodes[0]).map(node => nodes.find(({id}) => id === node).label);
                document.getElementById("network-info-content").innerText = connectedIngredients.join("\n");
            }
        });

        network.on("selectEdge", function (params) {
            let connectedIngredients =  this.getConnectedNodes(params.edges[0]).map(node => nodes.find(({id}) => id === node).label);
            document.getElementById("network-info-title").innerText
                = connectedIngredients.join(" + ") + "\nare used in:";
            console.log(edges.find(({id}) => id === params.edges[0]));
            let usedInCocktails = edges.find(({id}) => id === params.edges[0]).cocktails;
            document.getElementById("network-info-content").innerText = usedInCocktails.join("\n");
        });

        // Change cursor
        var networkCanvas = document
            .getElementById("networkDiv")
            .getElementsByTagName("canvas")[0];
        function changeCursor(newCursorStyle) {
            networkCanvas.style.cursor = newCursorStyle;
        }

        network.on("hoverNode", function () {
            changeCursor("pointer");
        });
        network.on("blurNode", function () {
            changeCursor("default");
        });

        network.on("hoverEdge", function () {
            changeCursor("pointer");
        });
        network.on("blurEdge", function () {
            changeCursor("default");
        });
    }
}