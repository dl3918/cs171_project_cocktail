/* * * * * * * * * * * * * *
*        MixologyVis       *
* * * * * * * * * * * * * */

class MixologyVis {

    // constructor method to initialize the MixologyVis object
    constructor(parentElement, ingredients, cocktails){
        this.parentElement = parentElement;
        this.ingredientData = ingredients;
        this.cocktailData = cocktails;
        this.selectedIngredients = [];
        this.selectableIngredients = new Set();
        this.svgFilePath = "img/cocktail-shaker.svg";

        let step0 = "M37,90 Q50,92 62,90 L62,90 Q50, 92 37,90 Z"
        let step1 = "M37,90 Q50,92 62,90 L64,81 Q50, 79 35,81 Z";
        let step2 = "M37,90 Q50,92 62,90 L66,72 Q50, 70 33,72 Z"
        let step3 = "M37,90 Q50,92 62,90 L66,63 Q50, 61 33,63 Z"
        let step4 = "M37,90 Q50,92 62,90 L67,54 Q50, 52 32,54 Z"
        let step5 = "M37,90 Q50,92 62,90 L68,45 Q50, 43 31,45 Z"
        let step6 = "M37,90 Q50,92 62,90 L69,36 Q50, 42 30,36 Z"
        this.cocktailStepPaths = [step0, step1, step2, step3, step4, step5, step6]
        this.cocktailStep = 0;

        this.initVis()
    }

    initVis() {
        let vis = this;

        d3.xml(vis.svgFilePath).then(data => {
            d3.select("#cocktail-shaker").node().appendChild(data.documentElement);
            vis.shakerSVG = d3.select("svg");
            vis.liquid = d3.select("#liquid");
        });
        vis.ingredientData.forEach(ingredient => vis.selectableIngredients.add(ingredient.label));
        vis.drawIngredients();

    }

    updateShaker(isSelected) {
        let vis = this;
        if (isSelected){
            this.cocktailStep++;
        }
        else{
            this.cocktailStep--;
        }
        if (vis.cocktailStep <= 6){
            vis.liquid
                .transition()
                .duration(1000)
                .attr("d", vis.cocktailStepPaths[vis.cocktailStep])
                .ease(d3.easeCubicInOut);
        }
    }

    drawIngredients(){
        let vis = this;

        vis.margin = { top: 0, right: 0, bottom: 0, left: 10 };

        const width = document.getElementById("ingredients-container").getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        const height = document.getElementById("ingredients-container").getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Create an SVG element
        const svg = d3.select('#ingredients-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create a color scale
        vis.color = d3.scaleOrdinal()
            .domain(['mixer', 'spirit', 'garnish'])
            .range(['rgba(78,121,167,0.7)','rgba(237,201,73,0.7)', 'rgba(255,157,167,0.7)']);

        const maxRadius = 55;
        vis.radiusScale = d3.scaleLinear()
            .domain([1, 31])
            .range([20, maxRadius]);

        const groupCenters = {
            mixer: { x: width / 2, y: height / 3 },
            spirit: { x: width / 2, y: height / 2 },
            garnish: { x: width / 2, y: height / 3 * 2 }
        };

        const groupForce = function(alpha) {
            for (const node of vis.ingredientData) {
                const center = groupCenters[node.group];
                node.vx -= (node.x - center.x) * alpha;
                node.vy -= (node.y - center.y) * alpha;
            }
        };

        const simulation = d3.forceSimulation(vis.ingredientData)
            .force('charge', d3.forceManyBody().strength(-500)) // Repulsive force, might need tuning
            .force('center', d3.forceCenter(width / 2, height / 2))
            .force('collision', d3.forceCollide().radius(d => vis.radiusScale(d.value) + 1)) // Add padding
            .force('group', groupForce) // Our custom force to cluster by group
            .on('tick', ticked);

        function ticked() {
            bubbles.attr('cx', d => d.x).attr('cy', d => d.y);
            labels.attr('x', d => d.x).attr('y', d => d.y);
        }

        // Add circles for each data point
        const bubbles = svg.selectAll('.bubble')
            .data(vis.ingredientData)
            .enter().append('circle')
            .attr('class', 'bubble')
            .attr('r', d => vis.radiusScale(d.value))
            .attr('fill', d => vis.color(d.group))
            .on('click', function(event, d) {
                if (vis.selectableIngredients.has(d.label)) {
                    const isSelected = !vis.selectedIngredients.includes(d.label);
                    if (isSelected) {
                        // Select
                        vis.selectedIngredients.push(d.label);
                        d3.select(this)
                            .transition(1000)
                            .attr('fill', d => d3.rgb(vis.color(d.group)).darker())
                            // .attr('stroke', d3.rgb(color(d.group)).darker())
                            // .attr('stroke-width', 2); // Add darker stroke
                    }
                    else {
                        // Deselect
                        vis.selectedIngredients = vis.selectedIngredients.filter(i => i !== d.label);
                        d3.select(this)
                            .transition(1000)
                            .attr('fill', d => vis.color(d.group))
                    }
                    vis.updateShaker(isSelected);

                    // Update selectable ingredients after each selection change
                    vis.updateSelectableIngredients();

                    // Check if a cocktail can be made with the selected ingredients
                    vis.checkCocktail();
                }
            });
        vis.bubbles = svg.selectAll('.bubble');

        // Add labels to each bubble
        const labels = svg.selectAll('.label')
            .data(vis.ingredientData)
            .enter().append('text')
            .attr('class', 'label')
            .text(d => d.label)
            .attr('text-anchor', 'middle')
            .attr('dy', '.3em');
        vis.labels = svg.selectAll('.label')

        vis.drawLegend(svg, width, height);

    }
    drawLegend(svg, width, height) {
        let vis = this;

        const legendData = [
            { label: 'Mixers', color: 'rgba(78,121,167,0.7)' },
            { label: 'Spirits', color: 'rgba(237,201,73,0.7)' },
            { label: 'Garnishes', color: 'rgba(255,157,167,0.7)' }
        ];

        // Adjust this value to move the legend down
        const yOffset = 30; // You can increase this value to move the legend further down

        // Create the legend items within the existing SVG
        const legend = svg.selectAll('.legend')
            .data(legendData)
            .enter()
            .append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(10,${yOffset + i * 20})`);

        legend.append('rect')
            .attr('x', 0)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', d => d.color);

        legend.append('text')
            .attr('x', 25)
            .attr('y', 9)
            .attr('dy', '.35em')
            .text(d => d.label)
            .attr('font-family', "'Amatic SC', sans-serif")
    }
    updateSelectableIngredients() {
        let vis = this;
        // console.log(vis.selectedIngredients);
        // Reset selectable ingredients
        vis.selectableIngredients.clear();
        // Go through each cocktail and add ingredients to the set if they can make a cocktail
        vis.cocktailData.forEach(cocktail => {
            let canMakeCocktail = vis.selectedIngredients.every(ingredient => cocktail["strIngredients"].includes(ingredient));

            if (canMakeCocktail) {
                // console.log(cocktail);
                cocktail['strIngredients'].forEach(ingredient => vis.selectableIngredients.add(ingredient));
            }
        });
        // console.log(vis.selectableIngredients);

        // Update the style of the bubbles based on whether they are selectable
        vis.bubbles.classed('non-selectable', d => !vis.selectableIngredients.has(d.label))
            .classed('selectable', d => vis.selectableIngredients.has(d.label));


    }

// Function to check if selected ingredients make a cocktail
    checkCocktail() {
        let vis = this;
        const foundCocktail = vis.cocktailData.find(cocktail =>
            cocktail['strIngredients'].every(ingredient => vis.selectedIngredients.includes(ingredient))
        );
        // function findCocktailByName(cocktailName, cocktailsData) {
        //     return cocktailsData.find(cocktail => cocktail.strDrink === cocktailName);
        // }

        // Function to show cocktail information
        function showCocktailInfo(foundCocktail) {
            d3.select('#cocktail-message').html(`
        <p>You made a <b>${foundCocktail.strDrink}</b>!</p>
        <img class="centered-image" src="img/mix_drink/${foundCocktail.strDrink}.png" style="width: 70%">
        <p><b>Detailed Instructions:</b> ${foundCocktail.strInstructions}</p>
    `);
            d3.select("#cocktail-shaker").classed("hidden", true);
            d3.select("#cocktail-message").classed("hidden", false);
        }

        // Function to show shaker (and hide cocktail info)
        function showShaker() {
            d3.select('#cocktail-message').text('');
            d3.select("#cocktail-shaker").classed("hidden", false);
            d3.select("#cocktail-message").classed("hidden", true);
        }

        // Display a message if a cocktail is found
        // Assuming you have some event listener or logic to determine selection/deselection
        if (foundCocktail) {
            showCocktailInfo(foundCocktail);
        } else {
            showShaker();
        }
    }

    resetView() {
        let vis = this;
        vis.liquid
            .transition()
            .duration(1000)
            .attr("d", vis.cocktailStepPaths[0])
            .ease(d3.easeCubicInOut);
        vis.cocktailStep = 0;
        vis.selectedIngredients = [];
        vis.bubbles
            .transition(1000)
            .attr('stroke', null)
            .attr('fill', d => vis.color(d.group));
        vis.updateSelectableIngredients();
        vis.checkCocktail();
        // Remove any additional SVG elements (like the cocktail image) inside the cocktail shaker div
        d3.select("#cocktail-shaker").selectAll("svg:not(#originalShakerSVG)").remove();

        // Load and display the original cocktail shaker SVG
        if (d3.select("#cocktail-shaker").select("#originalShakerSVG").empty()) {
            d3.xml(vis.svgFilePath).then(data => {
                d3.select("#cocktail-shaker").node().appendChild(data.documentElement);
                vis.shakerSVG = d3.select("#originalShakerSVG");
                vis.liquid = d3.select("#liquid");
            });
        }

    }
}