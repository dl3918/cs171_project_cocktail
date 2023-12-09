class TreeMap {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set the dimensions and margins of the diagram
        vis.margin = { top: 40, right: 40, bottom: 40, left: 40 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;  // Adjust as needed

        // Append the svg object to the body of the page
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.svg2 = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left},${vis.margin.top})`);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Process the data to have the format required by d3.hierarchy
        // Create a single root node and individual nodes for each data point
        vis.rootData = { id: "root", parent: "", value: 0 };
        vis.processedData = vis.data.map(item => ({
            id: item.strGlass,
            parent: "root",
            value: item.number_glass,
            garish: item.strIngredients,
            recommended: item.strDrink
        }));
        vis.processedData.push(vis.rootData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Determine the range of 'number_glass' values
        let minValue = d3.min(vis.processedData, d => d.value);
        let maxValue = d3.max(vis.processedData, d => d.value);

        let minimumArea = 200; // This should be your determined minimum area for the smallest rectangles
        let maximumArea = 2000; // This should be your determined maximum area for the largest rectangles
        let scaleValue = d3.scalePow()
            .exponent(0.1)
            .domain([minValue, maxValue])
            // .range([minimumArea, maximumArea]);


        // Define a color scale
        let colorScale = d3.scaleLinear()
            .domain([minValue, maxValue])
            .range(["#7ee3db", "#319ba8"]);

        let hoverColor = "#fae97b"

        // Create the root variable
        let root = d3.stratify()
            .id(d => d.id)
            .parentId(d => d.parent)
            (vis.processedData)
            .sum(d => scaleValue(d.value));

        // Then d3.treemap computes the position of each element of the hierarchy
        d3.treemap()
            .size([vis.width, vis.height])
            (root);

        // Use this information to add rectangles:
        vis.tree = vis.svg
            .selectAll("rect")
            .data(root.leaves())
            .enter()
            .append("rect")
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .style("stroke", "black")
            .style("fill", d => colorScale(d.data.value))
            .attr("class", "treemap_rect")
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .style("fill", hoverColor); // color when mouse is over

                // Calculate rectangle dimensions
                let rectWidth = d.x1 - d.x0;
                let rectHeight = d.y1 - d.y0;

                // Determine the size of the image (minimum of rect's width and height)
                let imageSize = Math.min(rectWidth, rectHeight) * 0.8;

                // Calculate the center of the rectangle
                let centerX = d.x0 + rectWidth / 2;
                let centerY = d.y0 + rectHeight / 2;

                vis.svg.append("image")
                    .attr("xlink:href", 'img/' + d.data.id + '.png')
                    .attr("x", centerX - imageSize / 2) // Center the image
                    .attr("y", centerY - imageSize / 2) // Center the image
                    .attr("width", imageSize)
                    .attr("height", imageSize)
                    .attr("class", "hover-image")

                // Class for easy removal
            })
            .on('mouseout', function() {
                d3.select(this)
                    .style("fill", d => colorScale(d.data.value)); // original color

                // Remove the image when not hovering
                vis.svg.selectAll(".hover-image").remove();
            })
            .on('click', function(event, d) {
                // d3.select("#treemap_right").selectAll("*").remove();
                // vis.show_detail(d);
                // vis.svg.selectAll('*').remove();
                vis.svg.transition().duration(400).style("opacity", 0).on("end", () => vis.svg.style("display", "none"));
                vis.svg2.style("display", "block").transition().duration(400).style("opacity", 1);


                vis.toggleSVG2Interaction(true);

                vis.svg2
                    .selectAll("rect")
                    .data(root.leaves())
                    .enter()
                    .append("rect")
                    .attr('x', d => d.x0/2)
                    .attr('y', d => d.y0)
                    .attr('width', d => (d.x1 - d.x0)/2)
                    .attr('height', d => d.y1 - d.y0)
                    .style("stroke", "black")
                    .style("fill", d => colorScale(d.data.value))
                    .attr("class", "treemap_rect")
                    .on('mouseover', function() {
                        d3.select(this)
                            .style("fill", hoverColor); // color when mouse is over
                    })
                    .on('mouseout', function() {
                        d3.select(this)
                            .style("fill", d => colorScale(d.data.value)); // original color
                    })
                    .on('click', function(event, d) {
                        vis.show_detail(d);
                    });

                let labels2 = vis.svg2
                    .selectAll("text")
                    .data(root.leaves())
                    .enter()
                    .append("text")
                    .text(d => d.data.id)
                    .attr("font-size", "12px")
                    .attr("fill", "white")
                    .attr("x", d => d.x0/2 + 5)
                    .attr("y", d => d.y0 + 20)
                    .attr("visibility", function(d) {
                        // Calculate the width of the text and compare with the width of the rectangle
                        d.textWidth = this.getComputedTextLength();
                        d.rectWidth = (d.x1 - d.x0)/2;
                        return d.textWidth < d.rectWidth ? "visible" : "hidden";
                    });

                // Clean up
                labels2.exit().remove();

                vis.show_detail(d);

            });

        // Add labels
        let labels = vis.svg
            .selectAll("text")
            .data(root.leaves())
            .enter()
            .append("text")
            .text(d => d.data.id)
            .attr("font-size", "12px")
            .attr("fill", "white")
            .attr("x", d => d.x0 + 5)
            .attr("y", d => d.y0 + 20)
            .attr("visibility", function(d) {
                // Calculate the width of the text and compare with the width of the rectangle
                d.textWidth = this.getComputedTextLength();
                d.rectWidth = d.x1 - d.x0;
                return d.textWidth < d.rectWidth ? "visible" : "hidden";
            });

        // Clean up
        labels.exit().remove();

        document.addEventListener('click', function(event) {
            if (!vis.svg.node().contains(event.target) && !vis.svg2.node().contains(event.target)) {
                // If the click is outside the SVG, make it visible again
                vis.svg.style("display", "block").transition().duration(400).style("opacity", 1);
                vis.svg2.transition().duration(400).style("opacity", 0).on("end", () => vis.svg2.style("display", "none"));;
                vis.toggleSVG2Interaction(false);
            }
        }, true);
    }

    toggleSVG2Interaction(enable) {
        this.svg2.style("pointer-events", enable ? "auto" : "none");
    }


    show_detail(d) {
        let vis = this;

        // Clear previous details
        vis.svg2.selectAll(".detail-group").remove();

        // Function to handle mouseover event on text
        function handleMouseOver() {
            d3.select(this)
                .style("cursor", "pointer")
                .style("fill", "red"); // Change text color on hover
        }

        // Function to handle mouseout event on text
        function handleMouseOut() {
            d3.select(this)
                .style("fill", "black"); // Revert text color
        }

        // Define the starting positions for the detail card
        let detailGroupX = vis.width * 0.6;
        let detailGroupY = 20;
        let cardWidth = vis.width * 0.3;

        // Create a group for the detail card
        let detailGroup = vis.svg2.append("g")
            .attr("class", "detail-group")
            .attr("transform", `translate(${detailGroupX},${detailGroupY})`);

        // Initial vertical position for the content
        let currentY = 10;

        // Add image
        let imageHeight = vis.height * 0.3;
        detailGroup.append("image")
            .attr("xlink:href", 'img/' + d.data.id + '.png')
            .attr("width", cardWidth) // Adjust width as needed
            .attr("height", imageHeight) // Adjust height as needed
            .attr("x", 0)
            .attr("y", currentY+1);

        currentY += imageHeight + 30; // Increment Y position after the image

        // Add title (glass type)
        detailGroup.append("text")
            .text(`${d.data.id}: ${d.data.value} drinks`)
            .attr("x", 10)
            .attr("y", currentY)
            .attr("font-size", "20px")
            .attr("font-weight", "bold");

        currentY += 40; // Increment Y position for subsequent elements

        // Add "Pair it with" text
        detailGroup.append("text")
            .text("- Pair it with:")
            .attr("x", 10)
            .attr("y", currentY)
            .attr("font-weight", "bold")
            .attr("font-size", "16px");

        currentY += 30; // Increment Y position

        // List ingredients (garish)
        d.data.garish.forEach(item => {
            let ingredient = Object.keys(item).join(', ');
            detailGroup.append("text")
                .text(ingredient)
                .attr("x", 20) // Indent for list items
                .attr("y", currentY)
                .attr("font-size", "14px")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
                .on("click", function(event, d) {
                    // Bubble specific logic...
                    event.stopPropagation(); // Prevent this click from propagating to the SVG
                    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(ingredient)} in cocktail`;
                    window.open(googleSearchUrl, '_blank');
                })
            currentY += 20; // Increment for next item
        });

        currentY += 20; // Increment Y position for "Recommended drink" section

        // Add "Recommended drink" text
        detailGroup.append("text")
            .text("- Recommended 3 drinks:")
            .attr("x", 10)
            .attr("y", currentY)
            .attr("font-weight", "bold")
            .attr("font-size", "16px");

        currentY += 30; // Increment Y position

        // List recommended drinks (taking first 3 recommendations)
        let recommendations = d.data.recommended.slice(0, 3);
        recommendations.forEach(drink => {
            detailGroup.append("text")
                .text(drink)
                .attr("x", 20) // Indent for list items
                .attr("y", currentY)
                .attr("font-size", "14px")
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
                .on("click", function(event, d) {
                    // Bubble specific logic...
                    event.stopPropagation(); // Prevent this click from propagating to the SVG
                    const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(drink)} drink`;
                    window.open(googleSearchUrl, '_blank');
                })
            currentY += 20; // Increment for next item
        });

        currentY += 20; // Additional space at the bottom

        // Add a background rectangle for the card, now that we know the total height
        detailGroup.insert("rect", ":first-child")
            .attr("width", cardWidth)
            .attr("height", currentY)
            .attr("rx", 15) // Rounded corners
            .attr("ry", 15)
            .style("fill", "#fff") // Card background color
            .style("stroke", "#ccc") // Card border
            .style("stroke-width", "2px");
    }
    
}







