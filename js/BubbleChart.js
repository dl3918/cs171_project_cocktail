class BubbleChart {
    constructor(parentElement, data, allDrink= false) {
        this.parentElement = parentElement;
        this.data = data;
        this.allDrink = allDrink;
        this.initVis()
    }

    initVis() {
        let vis = this;
        console.log(vis.data)
        // dimensions and margins for the graph
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Create the SVG container
        vis.svg = d3.select("#" + vis.parentElement).append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height);

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        // Call function to draw bubbles
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        // Aggregate data by the first element of Alc_type
        const counts = {};

        if (!vis.allDrink){
            vis.data.forEach(d => {
                const alcType = d.Alc_type[0];
                counts[alcType] = (counts[alcType] || 0) + 1;
            });

            vis.data =  Object.entries(counts).map(([alcType, count]) => ({
                strDrink: alcType,
                rank: count // Use count for sizing the bubbles
            }));
        }
        console.log(vis.data)
        vis.updateVis()
    }


    updateVis() {
        let vis = this;

        const radiusMultiplier = vis.allDrink ? 1 : 25; // Smaller multiplier for all drinks, larger for categories

        // Draw circles for each node
        vis.bubbles = vis.svg.selectAll('circle')
            .data(vis.data)
            .enter().append('circle')
            .attr('r', d => d.rank * radiusMultiplier)
            .style('fill', d => vis.color(d.strDrink))
            .style('opacity', 0.7);

        // Adjust the radius for collision detection
        const maxRadius = d3.max(vis.data, d => d.rank * radiusMultiplier);

        // Add labels
        vis.labels = vis.svg.selectAll('text')
            .data(vis.data)
            .enter().append('text')
            .text(d => d.strDrink)
            .attr('dy', '0.3em')
            .style('font-size', '14px')
            .style('text-anchor', 'middle');

        // Create force simulation
        vis.simulation = d3.forceSimulation(vis.data)
            .force('charge', d3.forceManyBody().strength(5))
            .force('center', d3.forceCenter(vis.width / 2, vis.height / 2))
            .force('collision', d3.forceCollide().radius(maxRadius)) // Add a bit of padding
            .on('tick', () => {
                // Update positions
                vis.bubbles.attr('cx', d => d.x)
                    .attr('cy', d => d.y);
                vis.labels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y);
            });
        console.log(vis.data)

        // Add hover interaction
        vis.bubbles.on('mouseover', function(event, d) {
            // Enlarge the hovered bubble
            d3.select(this).transition().attr('r', d.rank * radiusMultiplier * 2);

            // Update the collision force to account for the enlarged bubble
            vis.simulation.force('collision', d3.forceCollide().radius(node => {
                return node === d ? d.rank * radiusMultiplier * 2 : d.rank * radiusMultiplier;
            })).alpha(1).restart(); // Restart the simulation with updated collision radius
        })
            .on('mouseout', function(event, d) {
                // Reset the radius of the bubble
                d3.select(this).transition().attr('r', d.rank * radiusMultiplier);

                // Reset the collision force
                vis.simulation.force('collision', d3.forceCollide().radius(maxRadius)).alpha(1).restart();
            });


    }

}