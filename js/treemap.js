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
        vis.svg
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
                d3.select("#treemap_right").selectAll("*").remove();
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
    }

    show_detail(d) {
        d3.select("#treemap_right").append("img")
            .attr("src", 'img/'+ d.data.id + '.jpg')
            .attr("class", "card")
            .attr("width", 300)
            .style("margin", "auto");

        d3.select("#treemap_right").append("h2").text(d.data.id).style("text-align", "center");

        d3.select("#treemap_right").append("br")

        d3.select("#treemap_right").append("h4").text("Pair if with:")

        d3.select("#treemap_right").append("p").text(d.data.garish.join(', ' )).style("text-align", "center");

        d3.select("#treemap_right").append("h4").text("Recommended drink:")

        // recommended random 3 drinks in the data.recommended list
        let recommendations = [...d.data.recommended];

        // Shuffle the array using the Fisher-Yates (Durstenfeld) shuffle algorithm
        for (let i = recommendations.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [recommendations[i], recommendations[j]] = [recommendations[j], recommendations[i]];
        }

        // Now that the array is shuffled, take the first 3 items for recommendations
        let randomRecommendations = recommendations.slice(0, 3);

        // Append the recommendations
        d3.select("#treemap_right").append("p")
            .text(`${randomRecommendations[0]}, ${randomRecommendations[1]}, ${randomRecommendations[2]}`)
            .style("text-align", "center");
    }

}



