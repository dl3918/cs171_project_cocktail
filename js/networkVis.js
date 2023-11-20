/* * * * * * * * * * * * * *
*        NetworkVis        *
* * * * * * * * * * * * * */

let icon = "M 50, 10 m 75, 0 a 75,75 0 1,0 -150,0 a 75,75 0 1,0  150,0"

let connections;

class NetworkVis {

    // constructor method to initialize the NetworkVis object
    constructor(parentElement, ingNodes, ingEdges){
        this.parentElement = parentElement;
        this.ingNodes = ingNodes;
        this.ingEdges = ingEdges

        this.ingEdges = ingEdges.map(function(d) {
            return {name1: d.name1,
                name2: d.name2,
                score: +d.score,
                source: +d.source,
                target: +d.target}
        })

        this.networkData = {
            "nodes": this.ingNodes,
            "edges": this.ingEdges
        }

        this.initVis()
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 50, right: 50, bottom: 50, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // init tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'networkTooltip')

        vis.edgeGroup = vis.svg.append('g')
        vis.nodeGroup = vis.svg.append('g')

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this

        vis.updateVis()
    }

    updateVis() {
        let vis = this;
        //setting up forces
        let networkPrincess = "Belle";

        vis.dragDrop = d3.drag()
            .on('start', (event, d) => {
                if (!event.active) vis.simulation.alphaTarget(0.3).restart();
                d.fx = d.x;
                d.fy = d.y;
            })
            .on('drag', (event, d) => {
                d.fx = event.x;
                d.fy = event.y;
            })
            .on('end', (event, d) => {
                if (!event.active) vis.simulation.alphaTarget(0);
                d.fx = null;
                d.fy = null;
            });

        //create the visualization - line
        vis.edges = vis.edgeGroup.selectAll('line')
            .data(vis.networkData.edges, d => d.name1)

        vis.edges.exit().remove()

        let finalString = ''

        vis.edgeEnter = vis.edges.enter()
            .append('line')
            .style('stroke', 'grey')
            .style('stroke-width', d => 10**(d.score/10))
            .attr('class', function(d){
                return d.name1 + ' ' + d.name2 + ' ' + 'line'
            })
            .on('mouseover', function(event, d){
                d3.select(this)
                    .style('stroke', 'red')
                let lineName = this.className.baseVal
                let nodeName = document.getElementById('node-name').innerText
                let actalName = nodeName.replace(/\s/g, '')
                if(lineName.includes(actalName)){
                    let diff = (diffMe, diffBy) => diffMe.split(diffBy).join('');
                    let string1 = diff(lineName, actalName);
                    let string2 = diff(string1, 'line');
                    finalString = string2.trim()+'text';
                    d3.selectAll('.'+finalString).style('color', 'red');
                    d3.selectAll('#connect-img').style('border', '5px solid red');
                }

            })
            .on('mouseout', function(event, d){
                d3.select(this)
                    .style('stroke', 'grey')
                d3.selectAll('.'+finalString).style('color', 'black')
            })
            .merge(vis.edges)

        vis.nodes = vis.nodeGroup.selectAll('path')
            .data(vis.networkData.nodes, d => d.name)

        vis.nodes.exit().remove()

        vis.nodeEnter = vis.nodes.enter()
            .append('path')
            .attr('d', icon)
            .attr('stroke', 'black')
            .attr('stroke-width', "8px")
            .attr('class', function(d){
                return d.name + ' node'
            })
            .style('fill', '#ADD8E6')
            .call(vis.dragDrop)
            .on('mouseover', function(event, d){
                d3.selectAll('line')
                    .transition()
                    .style('opacity', '0.2')
                d3.selectAll('path')
                    .transition()
                    .style('opacity', '0.2')
                d3.select(this)
                    .transition()
                    .style('opacity', '1')
                let name = d.name
                connections = "";
                nameDisplay = "";
                source = "";
                vis.networkData.edges.forEach(function(d, i) {
                    if (d.name1 === name) {
                        source = d.name2
                        nameDisplay = vis.networkData.nodes.find(findConnection).nameDisplay
                        connections += "<div class="+d.name2+"text"+">"+ nameDisplay + ": " + d.score + "</div>";
                    } else if (d.name2 === name) {
                        source = d.name1
                        nameDisplay = vis.networkData.nodes.find(findConnection).nameDisplay
                        connections += "<div class="+d.name1+"text"+">"+ nameDisplay + ": " + d.score + "</div>";
                    }
                });
                document.getElementById("node-name").innerText = d.nameDisplay;
                document.getElementById("node-connections").innerHTML = connections;
                d3.selectAll('.' + name)
                    .transition()
                    .style('opacity', '1')
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div style="border: thin solid grey; border-radius: 3px; background: white; padding: 5px; padding-top: 10px; padding-left: 10px; padding-right: 10px">
                             <h4>${d.nameDisplay}</h4>
                         </div>`);
            })
            .on('mouseout', function(event, d){
                d3.selectAll('path')
                    .transition()
                    .style('opacity', '1')
                d3.selectAll('line')
                    .transition()
                    .style('opacity', '1')
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .attr('x', vis.width / 2)
            .attr('y', vis.height / 2)
            .merge(vis.nodes)

        vis.simulation = d3.forceSimulation(vis.networkData.nodes)
            .force('charge', d3.forceManyBody().strength(-500))
            .force('link', d3.forceLink(vis.networkData.edges).distance(100))
            //.force('center', d3.forceCenter().x(vis.width/2).y(vis.height/2))
            .force('center', d3.forceCenter(vis.width / 2, vis.height / 2))
            .force('collide', d3.forceCollide(vis.networkData.nodes.count).iterations(20))
            .force('x', d3.forceX(vis.width / 2).strength(0.05))
            .force('y', d3.forceY(vis.height / 2).strength(0.05))
            .on('tick', function(){
                vis.edgeEnter.attr("x1", function (d) {return d.source.x})
                    .attr("y1", function (d) {return d.source.y})
                    .attr("x2", function (d) {return d.target.x})
                    .attr("y2", function (d) {return d.target.y});
                vis.nodeEnter.attr('x', function(d) {return d.x})
                    .attr('y', function(d){return d.y})
                    .attr('transform', function(d) { return `translate (${d.x - (320 * +d.count/800)}, ${d.y - (300 * +d.count/800)}), scale(${+d.count/50*2})` });
                vis.fixBounds();
            })

        let connections = "";
        let nameDisplay = "";
        let source = "";
        function findConnection(target) {
            return target.name === source;
        }
        vis.networkData.edges.forEach(function(d, i) {
            if (d.name1 === networkPrincess) {
                source = d.name2
                nameDisplay = vis.networkData.nodes.find(findConnection).nameDisplay
                connections += "<div class="+d.name2+"text"+">"+nameDisplay + ": " + d.score + "</div>";
            } else if (d.name2 === networkPrincess) {
                source = d.name1
                nameDisplay = vis.networkData.nodes.find(findConnection).nameDisplay
                connections += "<div class="+d.name1+"text"+">"+nameDisplay + ": " + d.score + "</div>";
            }
        });

        document.getElementById("node-name").innerText = networkPrincess;
        document.getElementById("node-connections").innerHTML = connections;
        document.getElementById("node-img").src = "img/node-img/" + networkPrincess + '.jpeg';

        vis.simulation.force('link').links(vis.networkData.edges);
        vis.simulation.nodes(vis.networkData.nodes);
        vis.simulation.alpha(1).restart();
    }


    fixBounds() {
        let vis = this;
        vis.simulation.nodes().forEach((node) => {
            if (node.x - (320 * +node.count/800) < 0) {
                node.x = 320 * +node.count/800 + 5;
                node.vx = 0;
            }
            if (node.y - (300 * +node.count/800) < 0) {
                node.y = 300 * +node.count/800 + 5;
                node.vy = 0;
            }
            if (vis.width && node.x + (320 * +node.count/800) > vis.width) {
                node.x = this.width - (320 * +node.count/800);
                node.vx = 0;
            }
            if (vis.height && node.y + (300 * +node.count/800) > vis.height) {
                node.y = vis.height - (300 * +node.count/800);
                node.yx = 0;
            }
        })
    }
}