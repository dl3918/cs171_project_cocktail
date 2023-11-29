class tasteBubbleChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis()
    }

    initVis() {
        let vis = this;
        //console.log(vis.originalData)
        // dimensions and margins for the graph
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Create the SVG container
        vis.svg = d3.select("#" + vis.parentElement).append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height);

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        // Create a tooltip div and initially hide it
        vis.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        let aggregatedData = {};

        vis.data.forEach(row => {
            let taste = row.Basic_taste;
            let ingredient = row.strIngredients;

            // Initialize the data structure for each taste
            if (!aggregatedData[taste]) {
                aggregatedData[taste] = {
                    totalIngredients: 0,
                    ingredientsFreq: {}
                };
            }

            if (!aggregatedData[taste].ingredientsFreq[ingredient]) {
                aggregatedData[taste].ingredientsFreq[ingredient] = 1;
                aggregatedData[taste].totalIngredients++;
            } else {
                aggregatedData[taste].ingredientsFreq[ingredient]++;
            }
        });

        // Rename the first taste to 'other'
        let firstTasteKey = Object.keys(aggregatedData)[0];
        if (firstTasteKey) {
            aggregatedData['other'] = aggregatedData[firstTasteKey];
            delete aggregatedData[firstTasteKey];
        }

        // Convert aggregatedData from an object to an array of objects
        vis.data = Object.entries(aggregatedData).map(([taste, data]) => {
            return {
                Basic_taste: taste,
                totalIngredients: data.totalIngredients,
                ingredientsFreq: data.ingredientsFreq
            };
        });

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        vis.tasteColorMap = {};
        vis.svg.selectAll('*').remove();

        vis.bubbles = vis.svg.selectAll('circle')
            .data(vis.data)
            .enter().append('circle')
            .attr('r', d => d.totalIngredients*5) // Size based on totalIngredients
            .style('fill', d => {
                let color = vis.color(d.Basic_taste);
                vis.tasteColorMap[d.Basic_taste] = color;
                return color;
            })
            .style('opacity', 0.7)
            .on('mouseover', function(event, d) {
                vis.showSmallBubbles(d, this);
            })
            .on('mouseout', function() {
                vis.hideSmallBubbles();
            });

        // Add labels
        vis.labels = vis.svg.selectAll('text')
            .data(vis.data)
            .enter().append('text')
            .text(d => d.Basic_taste)
            .attr('dy', '0.3em')
            .style('font-size', '20px')
            .style('text-anchor', 'middle');

        // Create force simulation
        vis.simulation = d3.forceSimulation(vis.data)
            .force('charge', d3.forceManyBody().strength(5))
            .force('center', d3.forceCenter(vis.width / 2, vis.height / 2))
            .force('collision', d3.forceCollide().radius(100)) // Add a bit of padding
            .on('tick', () => {
                // Update positions
                vis.bubbles.attr('cx', d => d.x)
                    .attr('cy', d => d.y);
                vis.labels
                    .attr('x', d => d.x)
                    .attr('y', d => d.y);
            });
    }

    resetView() {
        this.allDrink = false;
        this.wrangleData();

        this.bubbles.transition()
            .duration(800)
            .style('opacity', 0.7);

        // Remove smaller bubbles
        this.svg.selectAll('.small-bubble').remove();
    }

    showSmallBubbles(tasteData, tasteBubble) {
        let vis = this;
        // Calculate positions for smaller bubbles
        let smallBubblePositions = getCirclePositions(
            d3.select(tasteBubble).attr("cx"),
            d3.select(tasteBubble).attr("cy"),
            Object.keys(tasteData.ingredientsFreq).length,
            50 // Adjust radius as needed
        );

        // Create smaller bubbles
        vis.svg.selectAll('.small-bubble')
            .data(Object.entries(tasteData.ingredientsFreq))
            .enter().append('circle')
            .attr('class', 'small-bubble')
            .attr('cx', (d, i) => smallBubblePositions[i].x)
            .attr('cy', (d, i) => smallBubblePositions[i].y)
            .attr('r', d => Math.sqrt(d[1])) // Size based on frequency
            .style('fill', vis.tasteColorMap[tasteData.Basic_taste])
            .style('opacity', 0.7);
        // Add tooltip interactions if needed
    }

    hideSmallBubbles() {
        let vis = this;
        vis.svg.selectAll('.small-bubble').remove();
    }

}
