class BubbleChart {
    constructor(parentElement, data, allDrink= false) {
        this.parentElement = parentElement;
        this.originalData = data;
        this.allDrink = allDrink;
        this.initVis()
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
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        // document.getElementById(vis.parentElement).getBoundingClientRect().width
        vis.width = viewportWidth - vis.margin.left - vis.margin.right;
        vis.height = viewportHeight - vis.margin.top - vis.margin.bottom;

        // Create the SVG container
        vis.svg = d3.select("#" + vis.parentElement).append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height);

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

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
        // Aggregate data by the first element of Alc_type
        // const counts = {};

        // if (!vis.allDrink){
        //     vis.data.forEach(d => {
        //         const alcType = d.Alc_type[0];
        //         counts[alcType] = (counts[alcType] || 0) + 1;
        //     });
        //
        //     vis.data =  Object.entries(counts).map(([alcType, count]) => ({
        //         strDrink: alcType,
        //         rank: count // Use count for sizing the bubbles
        //     }));
        // }
        //console.log(vis.displayData)
    }

    mouseoverEvent(event, d) {
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

        const radiusMultiplier = vis.allDrink ? 1 : 10; // Smaller multiplier for all drinks, larger for categories
        vis.alcTypeColorMap = {};
        vis.svg.selectAll('*').remove();

        // Draw circles for each node
        vis.bubbles = vis.svg.selectAll('circle')
            .data(vis.displayData)
            .enter().append('circle')
            .attr('r', d => d.rank * radiusMultiplier)
            .style('fill', d => {
                let color = vis.color(d.strDrink);
                vis.alcTypeColorMap[d.strDrink] = color;  // Store the color
                return color;
            })
            .style('opacity', 0.7);

        // Adjust the radius for collision detection
        const maxRadius = d3.max(vis.displayData, d => d.rank * radiusMultiplier);

        // Add labels
        vis.labels = vis.svg.selectAll('text')
            .data(vis.displayData)
            .enter().append('text')
            .text(d => d.strDrink)
            .attr('dy', '0.3em')
            .style('font-size', '14px')
            .style('text-anchor', 'middle')
            .on('mouseover', vis.mouseoverEvent)



        // Create force simulation
        vis.simulation = d3.forceSimulation(vis.displayData)
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
        console.log(vis.displayData)

        // Add hover interaction
        vis.bubbles.on('mouseover', function(event, d) {
            // Enlarge the hovered bubble
            d3.select(this).transition()
                .attr('r', d.rank * radiusMultiplier * 2)
                .duration(200)
                .style('fill', d3.rgb(vis.color(d.strDrink)).darker(0.7)); // Darken the fill color


            // Update the collision force to account for the enlarged bubble
            vis.simulation.force('collision', d3.forceCollide().radius(node => {
                return node === d ? d.rank * radiusMultiplier * 2 : d.rank * radiusMultiplier;
            })).alpha(1).restart(); // Restart the simulation with updated collision radius
        })
            .on('mouseout', function(event, d) {
                // Reset the radius of the bubble
                d3.select(this).transition()
                    .duration(200)
                    .style('fill', vis.color(d.strDrink)) // Revert fill color
                    .attr('r', d.rank * radiusMultiplier);
                // Reset the collision force
                vis.simulation.force('collision', d3.forceCollide().radius(maxRadius)).alpha(0.1).restart();
            })

        vis.bubbles.on('click', function(event, clickedBubbleData) {
            // Hide all bubbles except the clicked one
            vis.bubbles.transition()
                .duration(400)
                .style('opacity', d => d === clickedBubbleData ? 1 : 0);

            // Move the clicked bubble to the center
            d3.select(this)
                .transition()
                .duration(400)
                .attr('cx', vis.width / 2)
                .attr('cy', vis.height / 2);

            let selectedDrinks = vis.originalData.filter(drink => drink.Alc_type.includes(clickedBubbleData.strDrink));
            console.log(selectedDrinks)
            // Unique identifier for the smaller bubbles (e.g., using strDrink)
            let smallBubbleClass = 'small-bubble-' + clickedBubbleData.strDrink.replace(/[^a-zA-Z0-9]/g, ""); // Sanitize for class name

            // Calculate positions for smaller bubbles around the center
            let smallBubblePositions = getCirclePositions(vis.width / 2, vis.height / 2, selectedDrinks.length, 50); // 50 is the spread radius

            // let smallBubblePositions = getCirclePositions(clickedBubbleData.x, clickedBubbleData.y, selectedDrinks.length, 50); // 50 is the spread radius

            // Create smaller bubbles for the clicked big bubble
            vis.svg.selectAll('.' + smallBubbleClass)
                .data(selectedDrinks)
                .enter().append('circle')
                .attr('class', smallBubbleClass)
                .attr('cx', (d, i) => smallBubblePositions[i].x)
                .attr('cy', (d, i) => smallBubblePositions[i].y)
                .attr('r', 30) // Smaller bubble radius
                .style('fill', vis.alcTypeColorMap[clickedBubbleData.strDrink])
                .style('opacity', 0.7)
                .on('mouseover', vis.mouseoverEvent)
                .on('mouseout', function() {
                    vis.tooltip.transition()
                        .duration(400)
                        .style('opacity', 0)
                        .html(``)
                });
        });

    }


    resetView() {
        this.allDrink = false;
        this.wrangleData();

        this.bubbles.transition()
            .duration(800)
            .style('opacity', 0.7);

        // Restore the original positions and opacity of the bubbles
        this.bubbles.transition()
            .duration(800)
            .style('opacity', 1)
            .attr('cx', d => d.originalX) // Assuming original positions are stored
            .attr('cy', d => d.originalY);


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

