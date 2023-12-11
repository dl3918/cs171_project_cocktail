class TreeMap {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        // Set the dimensions and margins of the diagram
        vis.margin = { top: 20, right: 40, bottom: 20, left: 40 };
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

        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

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
            .range(["#f3b28f", "#f1926e"]);

        let hoverColor = "#e1a071"

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
            .style("stroke", "white")
            .style("stroke-width", "2px")
            .style("fill", d => colorScale(d.data.value))
            .attr("class", "treemap_rect")
            .on('mouseover', function(event, d) {
                d3.select(this)
                    .style("cursor", "pointer")
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
                    .attr("xlink:href", 'img/treemap_glass/' + d.data.id + '.png')
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
                    .style("stroke", "white")
                    .style("stroke-width", "2px")
                    .style("fill", d => colorScale(d.data.value))
                    .attr("class", "treemap_rect")
                    .on('mouseover', function() {
                        d3.select(this)
                            .style("fill", hoverColor) // color when mouse is over
                            .style("cursor", "pointer");

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
                    .attr("font-family", "Young Serif")
                    .attr("fill", "white")
                    .attr("x", d => d.x0/2 + 5)
                    .attr("y", d => d.y0 + 25)
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
            .attr("font-size", "16px")
            .attr("fill", "white")
            .attr("font-family", "Young Serif")
            .attr("x", d => d.x0 + 5)
            .attr("y", d => d.y0 + 25)
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
            .attr("xlink:href", 'img/treemap_glass/' + d.data.id + '.png')
            .attr("width", cardWidth) // Adjust width as needed
            .attr("height", imageHeight) // Adjust height as needed
            .attr("x", 0)
            .attr("y", currentY+1);

        currentY += imageHeight + 30; // Increment Y position after the image

        // Add title (glass type)
        detailGroup.append("text")
            .html(`${d.data.id}: &nbsp; ${d.data.value} drinks`)
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

        currentY += 20; // Increment Y position

        // Variables to manage image placement in rows
        let imgX = 10, imgY = currentY;
        const imgSize = 50; // Adjust size of the image as needed
        const maxImagesPerRow = 5;
        let imageCount = 0;

        // Loop through ingredients (garish) to display images
        d.data.garish.forEach(item => {
            // If the maximum number of images per row is reached, reset x position and move to next line
            if (imageCount >= maxImagesPerRow) {
                imgX = 10; // Reset X to start position
                imgY += imgSize + 10; // Move to next line
                imageCount = 0; // Reset image count for new line
            }

            // Assume images are named as the ingredient and stored in 'img/ingredients/' directory
            let ingredientImage = 'img/ingredient/' + Object.keys(item).join('') + '.png';

            detailGroup.append("image")
                .attr("xlink:href", ingredientImage)
                .attr("x", imgX)
                .attr("y", imgY)
                .attr("width", imgSize)
                .attr("height", imgSize)
                .on("mouseover", function(event) {
                    vis.tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    vis.tooltip.html(Object.keys(item))
                        .style("left", (event.pageX) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", function() {
                    vis.tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });

                    // Increment X position for next image
            imgX += imgSize + 10;
            imageCount++;
        });

        // Adjust currentY for subsequent elements
        currentY = imgY + imgSize + 30;

        // Add "Recommended drink" text
        detailGroup.append("text")
            .text("- Recommended 3 drinks:")
            .attr("x", 10)
            .attr("y", currentY)
            .attr("font-weight", "bold")
            .attr("font-size", "16px");

        currentY += 30; // Increment Y position

        // Shuffle and take the first 3 recommendations
        let shuffledRecommendations = shuffle([...d.data.recommended]);
        let recommendations = shuffledRecommendations.slice(0, 3);
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



        // Adjust frame size based on content plus padding
        let frameWidth = document.getElementById(vis.parentElement).getBoundingClientRect().width * 0.37;
        let frameHeight = document.getElementById(vis.parentElement).getBoundingClientRect().height * 2 ;

        // Adjust frame position to center it around the content
        let frameX = -document.getElementById(vis.parentElement).getBoundingClientRect().width * 0.05;
        let frameY = -document.getElementById(vis.parentElement).getBoundingClientRect().height * 0.58;

        // Add the frame image as the first child of detailGroup
        detailGroup.insert("image", ":first-child")
            .attr("xlink:href", 'img/frame7.png')
            .attr("width", frameWidth)
            .attr("height", frameHeight)
            .attr("x", frameX)
            .attr("y", frameY);

    }


}

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}







