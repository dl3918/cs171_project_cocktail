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
        // dimensions and margins for the graph
        this.width = 2000;
        this.height = 1000;

        // create pack layout
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

        this.color = d3.scaleOrdinal(d3.schemeTableau10);

        // Call function to draw bubbles
        this.drawBubbles();
    }

    drawBubbles() {

        const bubbles = this.svg.selectAll('g')
            .data(this.root.children)
            .enter().append('g')
            .attr('transform', d => `translate(${d.x},${d.y})`);

        // Draw circles for each node
        bubbles.append('circle')
            .attr('r', d => d.r)
            .style('fill', d => this.color(d.data.strDrink))
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