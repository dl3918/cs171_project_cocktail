/* * * * * * * * * * * * * *
*      Band Vis          *
* * * * * * * * * * * * * */

class iconVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayCount = 10; // Display 10 images at a time
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height;
        vis.iconWidth = vis.width / this.displayCount; // Calculate the width for each icon based on the display count
        vis.scrollSpeed = 1000; // Duration of the transition (2 seconds)

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr("transform", "translate(0,0)");

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update pattern to handle only the visible icons
        vis.displayData = vis.data.slice(0, this.displayCount);

        // Bind the data to the icons
        vis.icons = vis.svg.selectAll(".icon").data(vis.displayData, d => d.rank);

        // Exit selection: Remove old elements not present in new data
        vis.icons.exit().remove();

        // Enter selection: Create new elements as needed
        vis.icons.enter().append("svg:image")
            .attr("class", "icon")
            .attr("x", (d, i) => i * vis.iconWidth) // Set x based on index
            .attr("y", vis.height / 2 - 40) // Center vertically, adjust as needed
            .attr('width', '70') // Set your icon width
            .attr('height', '70') // Set your icon height
            .merge(vis.icons) // Enter + Update selection: Update attributes of existing elements
            .attr("xlink:href", d => `img/${d.rank}.png`)
            .transition()
            .duration(vis.scrollSpeed)
            .attr("x", (d, i) => i * vis.iconWidth - vis.iconWidth); // Move left by one icon's width

        // Handle wrapping of icons to create an infinite loop effect
        vis.data.push(vis.data.shift());
    }

    slideIcons() {
        this.updateVis();
    }
}

