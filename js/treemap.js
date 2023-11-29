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
            .style("fill", "lightblue")
            .attr("class", "treemap_rect")
            .on('mouseover', function() {
                d3.select(this)
                    .style("fill", "#a4c2f4"); // color when mouse is over
            })
            .on('mouseout', function() {
                d3.select(this)
                    .style("fill", "lightblue"); // original color
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
                    .style("fill", "lightblue")
                    .attr("class", "treemap_rect")
                    .on('mouseover', function() {
                        d3.select(this)
                            .style("fill", "#a4c2f4"); // color when mouse is over
                    })
                    .on('mouseout', function() {
                        d3.select(this)
                            .style("fill", "lightblue"); // original color
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

    show_detail(d) {
        let vis = this;

        // Clear previous details
        vis.svg2.selectAll(".detail").remove();

        // Starting positions for the detail elements
        let detailGroupX = vis.width * 0.6; // Starting X position of the detail group
        let detailGroupY = 20; // Starting Y position of the detail group
        let lineHeight = 20; // Line height for text elements

        // Create a group for all detail elements
        let detailGroup = vis.svg2.append("g")
            .attr("class", "detail")
            .attr("transform", `translate(${detailGroupX},${detailGroupY})`);

        // Add image
        detailGroup.append("image")
            .attr("xlink:href", 'img/' + d.data.id + '.jpg')
            .attr("width", vis.width * 0.3) // Adjust width as needed
            .attr("height", vis.height * 0.3) // Adjust height as needed
            .attr("x", 0)
            .attr("y", 0);

        // Update Y position for text elements
        let textY = vis.height * 0.3; // Adjust starting Y position based on the image height

        // Add title (glass type)
        let titleText = detailGroup.append("text")
            .text(d.data.id)
            .attr("font-size", "20px")
            .attr("font-weight", "bold");

        let titleWidth = titleText.node().getBBox().width;
        let titleX = (vis.width * 0.3 - titleWidth) / 2; // Centering the title

        titleText
            .attr("x", titleX)
            .attr("y", textY);

        textY += lineHeight + 20; // Adjust gap between title and next section

        // Add "Pair it with" text
        detailGroup.append("text")
            .text("- Pair it with:")
            .attr("x", 0)
            .attr("y", textY)
            .attr("font-weight", "bold")
            .attr("font-size", "16px");


        textY += lineHeight;

        // List ingredients (garish)
        d.data.garish.forEach(item => {
            let ingredient = Object.keys(item).join(', ');
            detailGroup.append("text")
                .text(ingredient)
                .attr("x", 10) // Indent for list items
                .attr("y", textY)
                .attr("font-size", "14px");
            textY += lineHeight;
        });

        textY += 20; // Extra gap before the next section

        // Add "Recommended drink" text
        detailGroup.append("text")
            .text("- Recommended 3 drinks:")
            .attr("x", 0)
            .attr("y", textY)
            .attr("font-weight", "bold")
            .attr("font-size", "16px");

        textY += lineHeight;

        // List recommended drinks
        let recommendations = d.data.recommended.slice(0, 3); // Taking first 3 recommendations
        recommendations.forEach(drink => {
            detailGroup.append("text")
                .text(drink)
                .attr("x", 10) // Indent for list items
                .attr("y", textY)
                .attr("font-size", "14px");
            textY += lineHeight;
        });
    }

}




    // show_detail(d) {
    //     d3.select("#treemap_right").append("img")
    //         .attr("src", 'img/'+ d.data.id + '.jpg')
    //         .attr("class", "card")
    //         .attr("width", document.getElementById('treemap_right').getBoundingClientRect().width * 0.6)
    //         .style("margin", "auto");
    //
    //     d3.select("#treemap_right").append("h2").text(d.data.id).style("text-align", "center");
    //
    //     d3.select("#treemap_right").append("br")
    //
    //     d3.select("#treemap_right").append("h4").text("Pair if with:")
    //
    //     d3.select("#treemap_right").append("p").text(d.data.garish.map(obj => Object.keys(obj)).join(', ')).style("text-align", "center");
    //     console.log(d.data.garish)
    //
    //     d3.select("#treemap_right").append("h4").text("Recommended drink:")
    //
    //     // recommended random 3 drinks in the data.recommended list
    //     let recommendations = [...d.data.recommended];
    //
    //     // Shuffle the array using the Fisher-Yates (Durstenfeld) shuffle algorithm
    //     for (let i = recommendations.length - 1; i > 0; i--) {
    //         const j = Math.floor(Math.random() * (i + 1));
    //         [recommendations[i], recommendations[j]] = [recommendations[j], recommendations[i]];
    //     }
    //
    //     // Now that the array is shuffled, take the first 3 items for recommendations
    //     let randomRecommendations = recommendations.slice(0, 3);
    //
    //     // Append the recommendations
    //     d3.select("#treemap_right").append("p")
    //         .text(`${randomRecommendations[0]}, ${randomRecommendations[1]}, ${randomRecommendations[2]}`)
    //         .style("text-align", "center");
    // }



