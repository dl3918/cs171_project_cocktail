class BubbleChart {
    constructor(parentElement, data, allDrink= false) {
        this.parentElement = parentElement;
        this.originalData = data;
        this.allDrink = allDrink;
        this.initVis()
        this.enlargeBubble = this.enlargeBubble.bind(this);
    }

    initVis() {
        let vis = this;
        //console.log(vis.originalData)
        // Get viewport dimensions
        let viewportHeight = window.innerHeight;
        let viewportWidth = window.innerWidth;

        // Set the size for each Fullpage section
        document.querySelectorAll('.section').forEach(section => {
            section.style.height = viewportHeight + 'px';
            section.style.width = viewportWidth + 'px';
        });

        // dimensions and margins for the graph
        vis.margin = {top: 20, right: 20, bottom: 30, left: 30};

        vis.width = viewportWidth - vis.margin.left - vis.margin.right;
        vis.height = viewportHeight - vis.margin.top - vis.margin.bottom;

        // Create the SVG container
        vis.svg = d3.select("#" + vis.parentElement).append('svg')
            .attr('width', viewportWidth)
            .attr('height', viewportHeight);

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        //vis.radiusScale = d3.scaleLinear().range([5, 20])

        vis.cocktailsByAlcType = vis.groupByAlcType(vis.originalData);

        // Create a tooltip div and initially hide it
        vis.tooltip = d3.select('body').append('div')
            .attr('class', 'tooltip')
            .style('opacity', 0);


        // Call function to draw bubbles
        vis.wrangleData();
    }

    groupByAlcType(data) {
        let groupedData = {};

        data.forEach(drink => {
            drink.Alc_type.forEach(type => {
                if (!groupedData[type]) {
                    groupedData[type] = {
                        strDrink: type, // actually the base liquor
                        drinks: [],
                        rank: 0,
                        //count: 0
                    };
                }
                groupedData[type].drinks.push(drink.strDrink);
                //groupedData[type].rank += drink.rank;
                groupedData[type].rank += 1;
            });
        });

        // Convert the grouped data to an array
        return Object.values(groupedData);
    }

    wrangleData() {
        let vis = this;

        if (!vis.allDrink) {
            // Group data by Alc_type
            vis.displayData = vis.cocktailsByAlcType;
        } else {
            // Use the original data
            vis.displayData = vis.originalData;
        }

        vis.updateVis();
    }

    mouseoverTooltip(event, d) {
        let vis = this;
        console.log(d)
        let tooltip = d3.select('.tooltip')
        tooltip.transition()
            .duration(200)
            .style('opacity', .9);
        tooltip.html(d.strDrink)  // Set the tooltip content
            .style('left', (event.pageX) + 'px')
            .style('top', (event.pageY - 28) + 'px')
            .html(`
                         <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                             <h3> ${d.strDrink}</h3>      
                             <h4> Ingredients: ${d.strIngredients.join(', ')}<h4>          
                           
                         </div>`); // put function,
    }

    updateVis() {
        let vis = this;

        vis.radiusMultiplier = vis.allDrink ? 1 : 10; // Smaller multiplier for all drinks, larger for categories
        vis.alcTypeColorMap = {};
        vis.svg.selectAll('*').remove();

        //vis.radiusScale().domain([d3.min(vis.displayData, d=>d.rank), d3.max(vis.displayData, d=>d.rank)])

        // Draw circles for each node
        vis.bubbles = vis.svg.selectAll('circle')
            .data(vis.displayData)
            .enter().append('circle')
            .attr('r', d => d.rank * vis.radiusMultiplier)
            .style('fill', d => {
                let color = vis.color(d.strDrink);
                vis.alcTypeColorMap[d.strDrink] = color;  // Store the color
                return color;
            })
            .style('opacity', 0.7);

        // Adjust the radius for collision detection
        const maxRadius = d3.max(vis.displayData, d => d.rank * vis.radiusMultiplier);

        // Add labels
        vis.labels = vis.svg.selectAll('text')
            .data(vis.displayData)
            .enter().append('text')
            .text(d => d.strDrink)
            .attr('dy', '0.3em')
            .style('font-size', '14px')
            .style('text-anchor', 'middle')
            .attr('fill', d => d3.rgb(vis.color(d.strDrink)).darker(1))
            .on('mouseover', vis.enlargeBubble)

        // Create force simulation
        vis.simulation = d3.forceSimulation(vis.displayData)
            .force('charge', d3.forceManyBody().strength(5))
            .force('center', d3.forceCenter(vis.width / 2, vis.height / 2))
            .force('collision', d3.forceCollide().radius(70)) // Add a bit of padding
            .on('tick', () => {
                // Update positions
                vis.bubbles.attr('cx', d => {
                    return d.x = Math.max(d.rank * vis.radiusMultiplier, Math.min(vis.width - d.rank * vis.radiusMultiplier, d.x));
                })
                    .attr('cy', d => {
                        return d.y = Math.max(d.rank * vis.radiusMultiplier, Math.min(vis.height - d.rank * vis.radiusMultiplier, d.y));
                    });
                vis.labels.attr('x', d => {
                    return d.x = Math.max(d.rank * vis.radiusMultiplier, Math.min(vis.width - d.rank * vis.radiusMultiplier, d.x));
                })
                    .attr('y', d => {
                        return d.y = Math.max(d.rank * vis.radiusMultiplier, Math.min(vis.height - d.rank * vis.radiusMultiplier, d.y));
                    });
        //console.log(vis.displayData)

        // Add hover interaction
        vis.bubbles
            .on('mouseover', function(event, d) {
                vis.enlargeBubble(this, d)
            })
            .on('mouseout', function(event, d) {
                // Reset the radius of the bubble
                //console.log(this)
                d3.select(this).transition()
                    .duration(200)
                    .style('fill', vis.color(d.strDrink)) // Revert fill color
                    .attr('r', d.rank * vis.radiusMultiplier);
                // Reset the collision force
                vis.simulation.force('collision', d3.forceCollide().radius(maxRadius)).alpha(0.1).restart();
            })
            .on('click', function(event, clickedBubbleData) {
                event.stopPropagation();
                event.preventDefault();

                // // Hide all bubbles
                // vis.bubbles.transition()
                //     .duration(400)
                //     .style('opacity', 0);
                //
                // vis.labels.transition()
                //     .duration(400)
                //     .style('opacity', 0);

                vis.svg.selectAll('*').remove();

                // Create a shaded background bubble
                vis.svg.append('circle')
                    .attr('class', 'background-bubble')
                    .attr('cx', vis.width / 2)
                    .attr('cy', vis.height / 2)
                    .attr('r', 200)
                    .style('fill', vis.alcTypeColorMap[clickedBubbleData.strDrink])
                    .style('opacity', 0.2)

                // Add a label to the shaded background bubble
                vis.svg.append('text')
                    .attr('class', 'background-bubble-label')
                    .attr('x', vis.width / 2)
                    .attr('y', vis.height / 2)
                    .text(clickedBubbleData.strDrink)
                    .style('text-anchor', 'middle')
                    .style('fill', vis.alcTypeColorMap[clickedBubbleData.strDrink]);

                let selectedDrinks = vis.originalData.filter(drink => drink.Alc_type.includes(clickedBubbleData.strDrink));
                console.log(selectedDrinks)
                // Unique identifier for the smaller bubbles (e.g., using strDrink)
                let smallBubbleClass = 'small-bubble-' + clickedBubbleData.strDrink.replace(/[^a-zA-Z0-9]/g, ""); // Sanitize for class name

                // Calculate positions for smaller bubbles around the center
                let smallBubblePositions = getCirclePositions(vis.width / 2, vis.height / 2, selectedDrinks.length, 75); // 50 is the spread radius

                // let smallBubblePositions = getCirclePositions(clickedBubbleData.x, clickedBubbleData.y, selectedDrinks.length, 50); // 50 is the spread radius

                // Create smaller bubbles for the clicked big bubble
                vis.svg.selectAll('.' + smallBubbleClass)
                    .data(selectedDrinks)
                    .enter().append('circle')
                    .attr('class', smallBubbleClass)
                    .attr('cx', (d, i) => smallBubblePositions[i].x)
                    .attr('cy', (d, i) => smallBubblePositions[i].y)
                    .attr('r', 40) // Smaller bubble radius
                    .style('fill', vis.alcTypeColorMap[clickedBubbleData.strDrink])
                    .style('opacity', 0.8)
                    .on('mouseover', vis.mouseoverTooltip)
                    .on('mouseout', function () {
                        vis.tooltip.transition()
                            .duration(400)
                            .style('opacity', 0)
                            //.html(``);
                    });

                vis.svg.selectAll('.text-small-bubble')
                    .data(selectedDrinks)
                    .enter().append('text')
                    .attr('class', 'text-small-bubble')
                    .text(d => d.strDrink)
                    .attr('x', (d, i) => smallBubblePositions[i].x)
                    .attr('y', (d, i) => smallBubblePositions[i].y)
                    .attr('dy', '0.3em')
                    .style('font-size', '14px')
                    .style('text-anchor', 'middle')



                    //.attr('fill', vis.alcTypeColorMap[clickedBubbleData.strDrink])
                //.on('mouseover', vis.enlargeBubble)

            })
        });

        vis.svg.on('click', function(event) {
            vis.resetView();
            // Check if the click happened on white space, not on a bubble
            // if (event.target.tagName !== 'circle') {
            //
            // }
        });
    }


    enlargeBubble(element, d) {

        // Enlarge the hovered bubble
        d3.select(element).transition()
            .attr('r', d.rank * this.radiusMultiplier * 2)
            .duration(200)
            .style('fill', d3.rgb(this.color(d.strDrink)).darker(0.9)); // Darken the fill color

        // Update the collision force to account for the enlarged bubble
        this.simulation.force('collision', d3.forceCollide().radius(node => {
            return node === d ? d.rank * this.radiusMultiplier * 2 : d.rank * this.radiusMultiplier;
        })).alpha(0.1).restart(); // Restart the simulation with updated collision radius
    }

    resetView() {
        this.allDrink = false;
        this.wrangleData();

        // Restore the original positions and opacity of the bubbles
        this.bubbles.transition()
            .duration(800)
            .style('opacity', 0.7);

        // Remove smaller bubbles
        this.svg.selectAll('.small-bubble').remove();
    }


}

function getCirclePositions(centerX, centerY, numberOfItems, radius) {
    let positions = [];
    for (let i = 0; i < numberOfItems; i++) {
        let angle = (i / numberOfItems) * (2 * Math.PI); // Distribute around the circle
        let x = centerX + radius*2 * Math.cos(angle);
        let y = centerY + radius*2 * Math.sin(angle);
        positions.push({ x: x, y: y });
    }
    return positions;
}


