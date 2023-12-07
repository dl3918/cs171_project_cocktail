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
        this.currentCategory = 'strCategory'; // Default filter
        this.colorCategory = 'strCategory';
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
            .on("click", function(event) {
                // Check if the clicked element is the SVG itself
                if (event.target === this) {
                    // Reset all bubbles to full opacity
                    vis.svg.selectAll(".bubble").style("opacity", 1);

                    // Reset the legend items
                    vis.legend.selectAll(".legend-item").classed("selected", false);
                }
            })
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        // Define a scale for bubble size
        vis.z = d3.scaleSqrt()
            .domain([0, d3.max(vis.data, d => d.Alc_type.length)* 1.2])
            .range([2, 20]);

        // // Define a scale for colors
        const myColors = [
            "#e6194b", "#3cb44b", "#ffe119", "#4363d8", "#f58231", "#911eb4", "#46f0f0", "#f032e6",
            "#bcf60c", "#fabebe", "#008080", "#e6beff", "#9a6324", "#fffac8", "#800000", "#aaffc3",
            "#808000", "#ffd8b1", "#000075", "#808080", "#000000", "#fabed4", "#ffd700", "#aa6e28"
        ];
        vis.color = d3.scaleOrdinal(myColors);


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

        // Calculate category centers
        vis.calculateCategoryCenters();

        vis.simulation = d3.forceSimulation()
            .force("charge", d3.forceManyBody().strength(-50)) // Adjust strength as needed
            .force("collide", d3.forceCollide().radius(d => vis.z(d.Alc_type.length) + 1))
            .force("x", d3.forceX(d => vis.categoryCenters[d[vis.currentCategory]].x).strength(0.5))
            .force("y", d3.forceY(d => vis.categoryCenters[d[vis.currentCategory]].y).strength(0.5))
            .on("tick", () => vis.ticked());
    }

    createLegend() {
        const vis = this;

        // Clear existing legend
        if (vis.legend) {
            vis.legend.remove();
        }

        // Define legend
        vis.legend = vis.svg.append("g")
            .attr("class", "legend")
            .attr("transform", `translate(${vis.width - 150},${vis.margin.top})`);

        // Create legend items
        const legendItems = vis.legend.selectAll(".legend-item")
            .data(vis.color.domain())
            .enter().append("g")
            .attr("class", "legend-item")
            .attr("transform", (d, i) => `translate(0, ${i * 25})`);

        // Add circles to legend items
        const legendCircles = legendItems.append("circle")
            .attr("class", "legend-circle")
            .attr("r", 10)  // Initial radius
            .attr("fill", vis.color)
            .style("opacity", 0.7);

        // Add labels to legend items
        legendItems.append("text")
            .attr("class", "legend-label")
            .attr("x", 25)
            .attr("y", 5)
            .attr("dy", "0.35em")
            .style("font-size", "12px")
            .text(d => d);

        // Add mouseover and mouseout event handlers for legend circles
        legendCircles
            .on("mouseover", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 15);  // Enlarged radius
            })
            .on("mouseout", function() {
                d3.select(this)
                    .transition()
                    .duration(200)
                    .attr("r", 10);  // Original radius
            });

        // Add click event listener
        legendItems.on("click", function(event, clickedCategory) {
            event.stopPropagation();
            const isSelected = d3.select(this).classed("selected");

            // Reset all bubbles to full opacity if the same legend is clicked again
            if (isSelected) {
                vis.svg.selectAll(".bubble").style("opacity", 1);
                vis.legend.selectAll(".legend-item").classed("selected", false);
            } else {
                // Highlight corresponding bubbles and dim others
                vis.svg.selectAll(".bubble")
                    .style("opacity", d => d[vis.colorCategory] === clickedCategory ? 1 : 0.1);

                // Update the selected state
                vis.legend.selectAll(".legend-item").classed("selected", false);
                d3.select(this).classed("selected", true);
            }
        });
    }


    wrangleData() {
        const vis = this;

        // Filter data based on the current category selected
        vis.displayData = vis.data.filter(d => d[vis.currentCategory]);

        // Update the domain of the color scale to match the new category
        vis.color.domain([...new Set(vis.displayData.map(d => d[vis.colorCategory]))]);


        // Dynamically adjust bubble size based on the number of items in each category
        const maxItemsInCategory = d3.max(vis.color.domain().map(category => {
            return vis.displayData.filter(d => d[vis.colorCategory] === category).length;
        }));

        vis.z.range([2, Math.max(15, 20 / Math.sqrt(maxItemsInCategory))]); // Adjust the max size of bubbles based on the number of items

        // Update the visualization
        vis.updateVis();
    }


    updateVis() {
        const vis = this;

        // Bind data to bubbles and handle enter, update, and exit selections
        vis.bubbles = vis.svg.selectAll(".bubble")
            .data(vis.data, d => d.currentCategory)
            .join(
                // Enter selection
                enter => enter.append("circle")
                    .attr("class", "bubble")
                    .attr("r", d => vis.z(d.Alc_type.length)) // Set the initial radius
                    .style("fill", d => vis.color(d[vis.colorCategory])) // Set the color
                    .style("opacity", 0.7)
                    .on("mouseover", function(event, d) {
                        // Enlarge the bubble on mouseover
                        d3.select(this)
                            .transition()
                            .duration(200)
                            .attr("r", vis.z(d.Alc_type.length) * 1.5);

                        // Construct tooltip content with additional details
                        vis.tooltip
                            .html(`<strong>${d.strDrink}</strong> <br>
                            <div style="text-align: left;">
                                 <strong>Drink Category:</strong> ${d.strCategory}<br>
                                 <strong>Class Type:</strong> ${d.strGlass}<br>
                                 <strong>Alcohol Type:</strong> ${d.Alc_type}<br>
                                 <strong>Basic Taste:</strong> ${d.Basic_taste}
                            </div>`)
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
                    })
                    .on("click", function(event, d) {
                        // Bubble specific logic...
                        event.stopPropagation(); // Prevent this click from propagating to the SVG
                        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(d.strDrink)} drink`;
                        window.open(googleSearchUrl, '_blank');
                    }),
                // Update selection
                update => update
                    .transition()
                    .duration(200)
                    .attr("fill", d => vis.color(d[vis.colorCategory])), // Update the fill color
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

        // Recalculate the category centers based on the new category
        vis.calculateCategoryCenters();

        // Recalculate bubble sizes based on the new category
        vis.wrangleData();

        // Restart the simulation with new forces
        vis.simulation
            .force("x", d3.forceX(d => vis.categoryCenters[d[vis.currentCategory]].x).strength(0.5))
            .force("y", d3.forceY(d => vis.categoryCenters[d[vis.currentCategory]].y).strength(0.5))
            .alpha(1)
            .restart();
    }

    colorChange(newColorCategory) {
        const vis = this;
        vis.colorCategory = newColorCategory;

        vis.wrangleData();
        vis.createLegend();
    }


    ticked() {
        const vis = this;
        vis.bubbles
            .attr("cx", d => Math.max(vis.z(d.Alc_type.length), Math.min(vis.width -175 - vis.z(d.Alc_type.length), d.x))) // Keep within horizontal bounds
            .attr("cy", d => Math.max(vis.z(d.Alc_type.length), Math.min(vis.height - vis.z(d.Alc_type.length), d.y))); // Keep within vertical bounds
    }

    calculateCategoryCenters() {
        const vis = this;

        // Initialize an object to store the centers
        vis.categoryCenters = {};

        // Calculate distinct categories from the data
        const categories = [...new Set(vis.data.map(d => d[vis.currentCategory]))];

        // Assign a center for each category
        categories.forEach((category, index) => {
            vis.categoryCenters[category] = {
                x: vis.width * (index + 1) / categories.length + 50 , // Evenly distribute across the width
                y: vis.height / 2
            };
        });
    }
}
