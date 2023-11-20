class BubbleChart {
    constructor(parentElement, data, allDrink= false) {
        this.parentElement = parentElement;
        this.allDrink = allDrink;
        if (!this.allDrink){
            this.data = this.processData(data); // new. if we want all drinks sized by popularity rank. do not process data
        } else {
            this.data = data;
        }
        this.initVis();
    }

    processData(data) {
        // Aggregate data by the first element of Alc_type
        const counts = {};
        data.forEach(d => {
            const alcType = d.Alc_type[0];
            counts[alcType] = (counts[alcType] || 0) + 1;
        });

        return Object.entries(counts).map(([alcType, count]) => ({
            strDrink: alcType,
            rank: count // Use count for sizing the bubbles
        }));
    }

    initVis() {
        console.log(this.data)
        let vis = this;
        // dimensions and margins for the graph
        vis.margin = {top: 10, right: 10, bottom: 10, left: 10};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // create pack layout
        vis.pack = d3.pack()
            .size([vis.width, vis.height])
            .padding(5);

        // Create root node
        vis.root = d3.hierarchy({ children: vis.data })
            .sum(d => d.rank * 10);

        // Assign packed values to root
        vis.pack(vis.root);

        // Create the SVG container
        vis.svg = d3.select("#" + vis.parentElement).append('svg')
            .attr('width', vis.width)
            .attr('height', vis.height)
            .attr('text-anchor', 'middle');

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        // Call function to draw bubbles
        vis.drawBubbles();
    }

    drawBubbles() {
        let vis = this;

        const bubbles = vis.svg.selectAll('g')
            .data(vis.root.children)
            .enter().append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Draw circles for each node
        bubbles.append('circle')
            .attr('r', d => d.r)
            .style('fill', d => vis.color(d.data.strDrink))
            // .style('fill', 'lightblue')
            .style('opacity', 0.7);

        // Add labels
        bubbles.append('text')
            .text(d => d.data.strDrink)
            .attr('dy', '0.3em')
            .style('font-size', '14px')
            .style('text-anchor', 'middle');
    }
}