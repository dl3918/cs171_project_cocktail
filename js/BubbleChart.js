class BubbleChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.initVis();
    }

    initVis() {
        console.log(this.data)
        // Set dimensions and margins for the graph
        this.width = 2000;
        this.height = 1000;

        // Create pack layout
        this.pack = d3.pack()
            .size([this.width, this.height])
            .padding(5);

        // Create root node
        this.root = d3.hierarchy({ children: this.data })
            .sum(d => d.rank * 10);

        // Assign packed values to root
        this.pack(this.root);

        // Create the SVG container
        this.svg = d3.select(this.parentElement).append('svg')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('text-anchor', 'middle');

        // Call function to draw bubbles
        this.drawBubbles();
    }

    drawBubbles() {
        // Draw the bubbles
        const bubbles = this.svg.selectAll('g')
            .data(this.root.children)
            .enter().append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Draw circles for each node
        bubbles.append('circle')
            .attr('r', d => d.r)
            .style('fill', 'lightblue')
            .style('opacity', 0.7);

        // Add labels
        bubbles.append('text')
            .text(d => d.data.strDrink)
            .attr('dy', '0.3em')
            .style('font-size', '14px')
            .style('text-anchor', 'middle');
    }
}