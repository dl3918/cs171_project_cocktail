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
        let step1 = "M37,90 Q50,92 62,90 L64,80 Q50, 78 35,80 Z";
        let step2 = "M37,90 Q50,92 62,90 L66,70 Q50, 68 33,70 Z"
        let step3 = "M37,90 Q50,92 62,90 L66,60 Q50, 58 33,60 Z"
        let step4 = "M37,90 Q50,92 62,90 L68,50 Q50,48 31,50 Z"
        let step5 = "M37,90 Q50,92 62,90 L69,36 Q50, 39 30,36 Z"
        this.cocktailStepPaths = [step0, step1, step2, step3, step4, step5]
        this.cocktailStep = 0;

        this.initVis()

    }

    initVis() {
        let vis = this;
        d3.xml(vis.svgFilePath).then(data => {
            d3.select("#cocktail-shaker").node().append(data.documentElement);
            vis.shakerSVG = d3.select("svg");
            vis.liquid = d3.select("#liquid");
            d3.select("#fillButton").on("click", () => vis.fillShaker());
        });
        vis.ingredientData.forEach(ingredient => vis.selectableIngredients.add(ingredient.label));
        vis.drawIngredients();
    }

    updateShaker(isSelected) {
        let vis = this;
        if(isSelected){
            this.cocktailStep++;
        }
        else{
            this.cocktailStep--;
        }
        if (vis.cocktailStep < 6){
            vis.liquid
                .transition()
                .duration(1000)
                .attr("d", vis.cocktailStepPaths[vis.cocktailStep])
                .ease(d3.easeCubicInOut);
        }
    }

    drawIngredients(){
        let vis = this;
        // Assuming your JSON data is loaded as `ingredientsData`
        // Set dimensions for your visualization
        const width = 800;
        const height = 600;

        // Create an SVG element
        const svg = d3.select('#ingredients-container')
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        // Create a color scale
        const color = d3.scaleOrdinal()
            .domain(['mixer', 'spirit', 'garnish'])
            .range(['#1f77b4', '#ff7f0e', '#2ca02c']);

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
            .force('collision', d3.forceCollide().radius(d => d.value*2 + 1)) // Add padding
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
            .attr('r', d => d.value*2)
            .attr('fill', d => color(d.group))
            .on('click', function(event, d) {
                if (vis.selectableIngredients.has(d.label)) {
                    const isSelected = !vis.selectedIngredients.includes(d.label);
                    if (isSelected) {
                        // Select
                        vis.selectedIngredients.push(d.label);
                        d3.select(this)
                            .attr('stroke', d3.rgb(color(d.group)).darker())
                            .attr('stroke-width', 3); // Add darker stroke
                    }
                    else {
                        // Deselect
                        vis.selectedIngredients = vis.selectedIngredients.filter(i => i !== d.label);
                        d3.select(this).attr('stroke', null); // Remove stroke
                    }
                    vis.updateShaker(isSelected);

                    // Update selectable ingredients after each selection change
                    vis.updateSelectableIngredients();

                    // Check if a cocktail can be made with the selected ingredients
                    vis.checkCocktail();
                }
                // selectIngredient.call(this, d);
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


        // // Event listener for bubbles
        // function selectIngredient(d) {
        //     // Since we're using D3 v6 or above, we need to use d3.select(this) to get the current element
        //     const bubble = d3.select(this);
        //     // Toggle the selected class
        //     const isSelected = !bubble.classed('selected');
        //
        //     // Toggle the selected class
        //     bubble.classed('selected', isSelected);
        //
        //     // Change color based on the selected state
        //     bubble.attr('fill', isSelected ? '#d3d3d3':color(d.group));  // Swap the color logic if needed
        //
        //     console.log('Ingredient selected:', d.label, 'Selected state:', isSelected);
        //     if (isSelected) {
        //         vis.selectedIngredients.push(d.label);
        //     }
        //     else{
        //         let idx = vis.selectedIngredients.indexOf(d.label);
        //         vis.selectedIngredients.splice(idx, 1);
        //     }
        //     vis.updateShaker(isSelected);
        //     console.log(vis.selectedIngredients);
        // }

    }

    updateSelectableIngredients() {
        let vis = this;
        // Reset selectable ingredients
        vis.selectableIngredients.clear();
        // Go through each cocktail and add ingredients to the set if they can make a cocktail
        vis.cocktailData.forEach(cocktail => {
            let canMakeCocktail = cocktail['strIngredients'].every(ingredient =>
                this.selectedIngredients.includes(ingredient) || !this.selectedIngredients.includes(ingredient) && vis.ingredientData.some(d => d.label === ingredient)
            );

            if (canMakeCocktail) {
                cocktail['strIngredients'].forEach(ingredient => vis.selectableIngredients.add(ingredient));
            }
        });
        console.log(vis.selectedIngredients);

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

        // Display a message if a cocktail is found
        if (foundCocktail) {
            d3.select('#cocktail-message').text(`You can make a ${foundCocktail.strDrink}!`);
        } else {
            d3.select('#cocktail-message').text('');
        }
    }

}