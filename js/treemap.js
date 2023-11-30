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
            .sum(d => d.value);

        // Then d3.treemap computes the position of each element of the hierarchy
        d3.treemap()
            .size([vis.width, vis.height])
            .padding(1)
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
            .on('mouseover', function() {
                d3.select(this)
                    .style("fill", hoverColor); // color when mouse is over
            })
            .on('mouseout', function() {
                d3.select(this)
                    .style("fill", d => colorScale(d.data.value)); // original color
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
                        d.rectWidth = d.x1 - d.x0;
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

    // show_detail(d) {
    //     let vis = this;
    //
    //     // Clear previous details
    //     vis.svg2.selectAll(".detail").remove();
    //
    //     // Starting positions for the detail elements
    //     let detailGroupX = vis.width * 0.6; // Starting X position of the detail group
    //     let detailGroupY = 20; // Starting Y position of the detail group
    //     let lineHeight = 20; // Line height for text elements
    //
    //     // Create a group for all detail elements
    //     let detailGroup = vis.svg2.append("g")
    //         .attr("class", "detail")
    //         .attr("transform", `translate(${detailGroupX},${detailGroupY})`);
    //
    //     // Add image
    //     detailGroup.append("image")
    //         .attr("xlink:href", 'img/' + d.data.id + '.jpg')
    //         .attr("width", vis.width * 0.3) // Adjust width as needed
    //         .attr("height", vis.height * 0.3) // Adjust height as needed
    //         .attr("x", 0)
    //         .attr("y", 0);
    //
    //     // Update Y position for text elements
    //     let textY = vis.height * 0.32; // Adjust starting Y position based on the image height
    //
    //     // Add title (glass type)
    //     let titleText = detailGroup.append("text")
    //         .text(`${d.data.id}:  ${d.data.value} drinks`)
    //         .attr("font-size", "20px")
    //         .attr("font-weight", "bold");
    //
    //     let titleWidth = titleText.node().getBBox().width;
    //     let titleX = (vis.width * 0.3 - titleWidth) / 2; // Centering the title
    //
    //     titleText
    //         .attr("x", titleX)
    //         .attr("y", textY);
    //
    //     textY += lineHeight + 20; // Adjust gap between title and next section
    //
    //     // Add "Pair it with" text
    //     detailGroup.append("text")
    //         .text("- Pair it with:")
    //         .attr("x", 0)
    //         .attr("y", textY)
    //         .attr("font-weight", "bold")
    //         .attr("font-size", "16px");
    //
    //
    //     textY += lineHeight;
    //
    //     // List ingredients (garish)
    //     d.data.garish.forEach(item => {
    //         let ingredient = Object.keys(item).join(', ');
    //         detailGroup.append("text")
    //             .text(ingredient)
    //             .attr("x", 10) // Indent for list items
    //             .attr("y", textY)
    //             .attr("font-size", "14px");
    //         textY += lineHeight;
    //     });
    //
    //     textY += 20; // Extra gap before the next section
    //
    //     // Add "Recommended drink" text
    //     detailGroup.append("text")
    //         .text("- Recommended 3 drinks:")
    //         .attr("x", 0)
    //         .attr("y", textY)
    //         .attr("font-weight", "bold")
    //         .attr("font-size", "16px");
    //
    //     textY += lineHeight;
    //
    //     // List recommended drinks
    //     let recommendations = d.data.recommended.slice(0, 3); // Taking first 3 recommendations
    //     recommendations.forEach(drink => {
    //         detailGroup.append("text")
    //             .text(drink)
    //             .attr("x", 10) // Indent for list items
    //             .attr("y", textY)
    //             .attr("font-size", "14px");
    //         textY += lineHeight;
    //     });
    // }

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
        let currentY = 0;

        // Add image
        let imageHeight = vis.height * 0.3;
        detailGroup.append("image")
            .attr("xlink:href", 'img/' + d.data.id + '.jpg')
            .attr("width", cardWidth) // Adjust width as needed
            .attr("height", imageHeight) // Adjust height as needed
            .attr("x", 0)
            .attr("y", currentY+1);

        currentY += imageHeight + 20; // Increment Y position after the image

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







