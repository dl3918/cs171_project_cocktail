class allBubbleChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;

        // Preprocess data: if the property is an array, reduce it to the first item
        this.data = data.map(d => ({
            ...d,
            Alc_type: d.Alc_type[0],
            Basic_taste: d.Basic_taste[0] // Ensure these keys exist in your data
        }));

        this.displayData = [...this.data]; // Clone the preprocessed data
        this.currentCategory = 'strGlass'; // Default filter
        this.initVis(); // Call to initialize the visualization
    }

    initVis() {
        const vis = this;

        // Set dimensions and margins for the graph
        vis.margin = { top: 10, right: 10, bottom: 10, left: 10 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Create SVG and append it to the element
        vis.svg = d3.select("#" + vis.parentElement)
            .append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Define a scale for bubble size
        vis.z = d3.scaleSqrt()
            .domain([0, d3.max(vis.data, d => d.Alc_type.length)])
            .range([2, 20]);

        // Define a scale for colors
        vis.color = d3.scaleOrdinal(d3.schemeCategory10);


        // Initialize the tooltip
        vis.initTooltip();

        // Initialize the force simulation
        vis.initSimulation();

        // Create a legend
        vis.createLegend();

        // Process the data
        vis.wrangleData();
    }

    initTooltip() {
        const vis = this;

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0)
            .style("position", "absolute")
            .style("text-align", "center")
            .style("padding", "8px")
            .style("font", "12px sans-serif")
            .style("background", "white")
            .style("border", "0px")
            .style("border-radius", "8px")
            .style("pointer-events", "none");
    }

    initSimulation() {
        const vis = this;

        vis.simulation = d3.forceSimulation()
            .force("center", d3.forceCenter(vis.width / 2, vis.height / 2))
            .force("charge", d3.forceManyBody().strength(15))
            .force("collide", d3.forceCollide().radius(d => vis.z(d.Alc_type.length) + 1))
            .on("tick", () => vis.ticked()); // Reference the ticked method of the class
    }

    createLegend() {
        const vis = this;

        // Define legend group with positioning
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width - 150},${vis.margin.top})`);

        // Add legend circles
        vis.legend.selectAll(".legend-circle")
            .data(vis.color.domain())
            .enter().append("circle")
            .attr("class", "legend-circle")
            .attr("r", 10)
            .attr("cy", (d, i) => i * 25)
            .attr("fill", vis.color)
            .style("opacity", 0.7)

        // Add legend text
        vis.legend.selectAll(".legend-label")
            .data(vis.color.domain())
            .enter().append("text")
            .attr("class", "legend-label")
            .attr("x", 25)
            .attr("y", (d, i) => i * 25 + 5)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .text(d => d);
    }

    wrangleData() {
        const vis = this;

        // Filter data based on the current category selected
        vis.displayData = vis.data;

        // Update the domain of the color scale to match the new category
        vis.color.domain(vis.displayData.map(d => d[vis.currentCategory]));

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        const vis = this;

        // Bind data to bubbles and handle enter, update, and exit selections
        vis.bubbles = vis.svg.selectAll(".bubble")
            .data(vis.data, d => d.strDrink)
            .join(
                // Enter selection
                enter => enter.append("circle")
                    .attr("class", "bubble")
                    .attr("r", d => vis.z(d.Alc_type.length)) // Set the initial radius
                    .style("fill", d => vis.color(d.Alc_type[0])) // Set the color
                    .style("opacity", 0.7)
                    .on("mouseover", function(event, d) {
                        // Enlarge the bubble on mouseover
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", vis.z(d.Alc_type.length) * 1.5);

                        // Show the tooltip with the drink's name
                        vis.tooltip
                            .html(d.strDrink)
                            .style("left", `${event.pageX}px`)
                            .style("top", `${event.pageY}px`)
                            .transition()
                            .duration(200)
                            .style("opacity", 1);
                    })
                    .on("mouseout", function(event, d) {
                        // Return the bubble to its original size on mouseout
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", vis.z(d.Alc_type.length));

                        // Hide the tooltip
                        vis.tooltip
                            .transition()
                            .duration(200)
                            .style("opacity", 0);
                    }),
                // Update selection
                update => update
                    .transition()
                    .duration(200)
                    .attr("fill", d => vis.color(d[vis.currentCategory])), // Update the fill color
                // Exit selection
                exit => exit.remove()
            );

        // Apply the simulation to the bubbles and specify what happens on each 'tick'
        vis.simulation.nodes(vis.displayData).alpha(1).restart();

        // Rebuild the legend to reflect the new color mapping
        vis.buildLegend();
    }

    buildLegend() {
        const vis = this;

        // Remove the current legend
        vis.legend.remove();

        // Re-create the legend group
        vis.createLegend();
    }

    categoryChange(newCategory) {
        const vis = this;
        vis.currentCategory = newCategory;
        vis.wrangleData();
    }

    ticked() {
        const vis = this;
        vis.bubbles
            .attr("cx", d => d.x)
            .attr("cy", d => d.y);
    }

}





