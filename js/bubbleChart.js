// fetch('/data/liquorData.json')
//     .then(response => response.json())
//     .then(data => {
//         console.log(data['Gin'].Info);
//         // Handle your data here
//     })
//     .catch(error => {
//         console.error('Error fetching JSON:', error);
//     });

let liquorData = {
    "Whisky": {
        "Info": "Whisky, known for its rich and complex flavors, is a distilled alcoholic beverage made from fermented grain mash.",
        "Fun": "The aging process of whisky in barrels can contribute up to 60% of its final flavor."
    },
    "Sweet_Liqueur": {
        "Info": "Sweet Liquor, often enjoyed as a dessert drink, is a category of liqueurs that are notably sugary and flavored with various ingredients.",
        "Fun": "Sweet liqueurs were originally used medicinally, believed to aid digestion."
    },
    "Gin": {
        "Info": "Gin, a spirit distinguished by its predominant juniper flavor, is crafted through the distillation of grain and botanicals.",
        "Fun": "London Dry Gin doesn't have to be made in London; it's a style of gin that's dry and juniper-forward."
    },
    "Vodka": {
        "Info": "Vodka, characterized by its neutral taste and purity, is a versatile spirit traditionally made from fermented grains or potatoes.",
        "Fun": "The name 'vodka' is a diminutive form of the Slavic word 'voda' (water), meaning little water."
    },
    "Rum": {
        "Info": "Rum, a spirit synonymous with the Caribbean, is made from sugarcane byproducts like molasses or directly from sugarcane juice.",
        "Fun": "Rum was a popular medium of economic exchange in the early American colonies, often used to pay soldiers."
    },
    "Campari": {
        "Info": "Campari is an iconic Italian bitter liqueur, known for its deep red color and a bitter, herbal flavor profile.",
        "Fun": "The original Campari recipe remains a closely guarded secret, known only to a few people."
    },
    "Tequila": {
        "Info": "Tequila, a symbol of Mexican heritage, is a distilled spirit made from the blue agave plant, primarily in the area surrounding the city of Tequila.",
        "Fun": "Tequila must be produced in specific regions of Mexico, much like how Champagne is region-specific to France."
    },
    "Brandy": {
        "Info": "Brandy, a spirit made by distilling wine, is known for its rich, fruity essence and is often aged in wooden casks.",
        "Fun": "The term 'brandy' comes from the Dutch word 'brandewijn', meaning 'burnt wine'."
    },
    "Bitters": {
        "Info": "Bitters are a diverse group of potent flavoring agents, typically made from herbs, roots, and other plant materials.",
        "Fun": "Bitters were originally developed as patent medicines but are now primarily used as digestifs and as flavoring in cocktails."
    },
    "Triple_Sec": {
        "Info": "Triple Sec, a type of sweet orange-flavored liqueur, is widely used in cocktails for its bright citrus notes.",
        "Fun": "The 'triple' in Triple Sec refers to the triple distillation of the orange peel used to make this liqueur."
    },
    "Champagne": {
        "Info": "Champagne, a prestigious sparkling wine, comes exclusively from the Champagne region of France and is celebrated for its effervescence.",
        "Fun": "Only sparkling wine made in the Champagne region of France can legally be called Champagne."
    },
    "Cachaca": {
        "Info": "Cachaça, a Brazilian spirit similar to rum, is made from fresh sugarcane juice and is a key ingredient in the famous caipirinha cocktail.",
        "Fun": "Cachaça was one of the first spirits distilled in the Americas and predates Caribbean rum."
    },
    "Wine": {
        "Info": "Wine, an ancient and globally beloved beverage, is made by fermenting grapes or other fruits.",
        "Fun": "There are over 10,000 varieties of wine grapes worldwide."
    },
    "Vermouth": {
        "Info": "Vermouth, a fortified wine flavored with various botanicals, is a staple in many classic cocktails like the Martini and Manhattan.",
        "Fun": "Vermouth was originally used as a medicinal tonic, with wormwood being one of its primary ingredients."
    },
    "Creamy_Liqueur": {
        "Info": "Creamy Liqueur, often rich and sweet, combines liquor with cream and flavorings such as coffee, chocolate, or fruit.",
        "Fun": "Creamy liqueurs, like the famous Irish Cream, are a popular choice for festive drinks and are often enjoyed over ice or in coffee."
    }
}

class BubbleChart {
    constructor(parentElement, data, allDrink= false) {
        this.parentElement = parentElement;
        this.originalData = data;
        this.allDrink = allDrink;

        this.liquorText = '';
        this.drinkText = '';

        this.initVis()
        //this.enlargeBubble = this.enlargeBubble.bind(this);
    }

    initVis() {
        let vis = this;
        //console.log(vis.originalData)
        // // Get viewport dimensions
        // let viewportHeight = window.innerHeight;
        // let viewportWidth = window.innerWidth;
        //
        // // Set the size for each Fullpage section
        // document.querySelectorAll('.section').forEach(section => {
        //     section.style.height = viewportHeight + 'px';
        //     section.style.width = viewportWidth + 'px';
        // });
        //
        // // dimensions and margins for the graph
        // vis.margin = {top: 50, right: 20, bottom: 30, left: 30};
        //
        // vis.width = viewportWidth - vis.margin.left - vis.margin.right;
        // vis.height = viewportHeight - vis.margin.top - vis.margin.bottom;
        vis.margin = { top: 0, right: 0, bottom: 0, left: 0 };
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        console.log(vis.height)
        // Create the SVG container
        vis.svg = d3.select("#" + vis.parentElement).append('svg')
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)

        vis.color = d3.scaleOrdinal(d3.schemeTableau10);

        //vis.radiusScale = d3.scaleLinear().range([5, 20])

        vis.cocktailsByAlcType = vis.groupByAlcType(vis.originalData);

        // Create a tooltip div and initially hide it
        vis.tooltip = d3.select('body').append('div')
            // .attr('class', 'tooltip')
            .attr('id', 'liquor-tt')
            .style('opacity', 0);


        // Call function to draw bubbles
        vis.wrangleData();
    }

    groupByAlcType(data) {
        let groupedData = {};

        data.forEach(drink => {
            drink.Alc_type.forEach(type => {
                if (!groupedData[type]) {
                    groupedData[type] = {
                        strDrink: type, // actually the base liquor
                        drinks: [],
                        rank: 0,
                        //count: 0
                    };
                }
                groupedData[type].drinks.push(drink.strDrink);
                //groupedData[type].rank += drink.rank;
                groupedData[type].rank += 1;
            });
        });

        // Convert the grouped data to an array
        return Object.values(groupedData);
    }

    wrangleData() {
        let vis = this;

        if (!vis.allDrink) {
            // Group data by Alc_type
            vis.displayData = vis.cocktailsByAlcType;
        } else {
            // Use the original data
            vis.displayData = vis.originalData;
        }

        vis.updateVis();
    }


    updateVis() {
        let vis = this;

        // Calculate the min and max rank values in displayData
        let minRank = d3.min(vis.displayData, d => d.rank);
        let maxRank = d3.max(vis.displayData, d => d.rank);

// Define the range for the bubble radius (minimum and maximum radius)
        let minRadius = 30;  // Minimum bubble radius in pixels
        let maxRadiuss = 80; // Maximum bubble radius in pixels

// Create a linear scale for the bubble radius
         vis.radiusScale = d3.scaleLinear()
            .domain([minRank, maxRank])
            .range([minRadius, maxRadiuss]);


        vis.radiusMultiplier = vis.allDrink ? 1 : 10; // Smaller multiplier for all drinks, larger for categories
        vis.alcTypeColorMap = {};
        vis.svg.selectAll('*').remove();

        // Draw circles for each node
        vis.bubbles = vis.svg.selectAll('circle')
            .data(vis.displayData)
            .enter().append('circle')
            .attr('r', d => vis.radiusScale(d.rank)) // Apply the scale here
            .attr('class', 'large-bubbles')
            .style('fill', d => {
                let color = vis.color(d.strDrink);
                vis.alcTypeColorMap[d.strDrink] = color;  // Store the color
                return color;
            })
            .style('opacity', 0.7)
            .style('stroke', 'rgba(0,0,0,0.87)')
            .style('stroke-width', "1px")
            //.attr('r', d => d.rank * vis.radiusMultiplier)


        // Adjust the radius for collision detection
        const maxRadius = d3.max(vis.displayData, d => d.rank * vis.radiusMultiplier);

        // Add labels
        vis.labels = vis.svg.selectAll('text')
            .data(vis.displayData)
            .enter().append('text')
            .text(d => d.strDrink)
            .attr('font-weight', 'bold')
            .attr('dy', '0.3em')
            .style('font-size', '1.2em')
            .style('text-anchor', 'middle')
            .style('font-family', 'Amatic SC, sans-serif')
            .attr('fill', d => d3.rgb(vis.color(d.strDrink)).darker(1))
            .on('mouseover', vis.enlargeBubble)

        // Create force simulation
        vis.simulation = d3.forceSimulation(vis.displayData)
            .force('charge', d3.forceManyBody().strength(5))
            .force('center', d3.forceCenter(vis.width / 2, vis.height / 2))
            .force('collision', d3.forceCollide().radius(70)) // Add a bit of padding
            .on('tick', () => {
                // Update positions
                vis.bubbles.attr('cx', d => {
                    return d.x = Math.max(d.rank * vis.radiusMultiplier, Math.min(vis.width - d.rank * vis.radiusMultiplier, d.x));
                })
                    .attr('cy', d => {
                        return d.y = Math.max(d.rank * vis.radiusMultiplier, Math.min(vis.height - d.rank * vis.radiusMultiplier, d.y));
                    });
                vis.labels.attr('x', d => {
                    return d.x = Math.max(d.rank * vis.radiusMultiplier, Math.min(vis.width - d.rank * vis.radiusMultiplier, d.x));
                })
                    .attr('y', d => {
                        return d.y = Math.max(d.rank * vis.radiusMultiplier, Math.min(vis.height - d.rank * vis.radiusMultiplier, d.y));
                    });
        //console.log(vis.displayData)

        // Add hover interaction
        vis.bubbles
            .on('mouseover', function(event, d) {
                vis.enlargeBubble(this, d)
                console.log(event, d)
                d3.select("#info").selectAll("*").remove();

                let alcohol = d.strDrink.split(' ').join('_')

                vis.tooltip
                    .style('left', event.clientX + 10 + 'px')
                    .style('top', function() {

                        if (event.clientY >= 250){
                            return event.clientY - 260 + 'px'

                        } else if (event.clientY >= 500){
                            return event.clientY - 510 + 'px'

                        } else {
                            return event.clientY + 10 + 'px'

                        }
                    })
                    .style('opacity', 1)
                    .html(`
                        <div class="liquor-tt" style="padding: 4vh 5vh 2vh 6vh">
                            <h2 class="liquor-name">${d.strDrink}</h2>
                            <img src="img/DALLE_liquor/${alcohol}.png" style="width: 30%; margin-left: 35%">
                            <br>
                            <p class="liquor-info"> ${liquorData[alcohol].Info}</p>
                            <br>
                            <p class="liquor-fun"> <b>Fun Fact:</b> ${liquorData[alcohol].Fun}</p>
                        </div>
                    `)
            })
            .on('mouseout', function(event, d) {
                // Reset the radius of the bubble
                vis.tooltip
                    .style('left', 0 + 'px')
                    .style('top', 0 + 'px')
                    .style('opacity', 0)

                    .html('')

                d3.select(this).transition()
                    .duration(200)
                    .style('fill', vis.color(d.strDrink)) // Revert fill color
                    .attr('r', vis.radiusScale(d.rank));

                // Reset the collision force
                vis.simulation.force('collision', d3.forceCollide().radius(maxRadius)).alpha(0.1).restart();
            })
            .on('click', function(event, clickedBubbleData) {

                event.stopPropagation();
                event.preventDefault();


                let bubbleCol = d3.select('.bubble-col');
                let menuCol = d3.select('.menu-col');

                // Update the classes for bubbleCol and menuCol
                bubbleCol.classed('col-12', false).classed('col-8', true);
                menuCol.classed('col-4', true).style('display', 'block');


                // grab important info
                let alcohol = clickedBubbleData.strDrink.split(' ').join('_')

                // update menu-page to display liquor text
                vis.liquorText = ` 
                    <div class="row" style="height: 100%">
                        <div class="col-12">
                            <div class="row" style="height: 10vh; margin-top: 4vh; padding: 4vh 10vh 2vh 10vh">
                                <h2 class="cocktail-name">${clickedBubbleData.strDrink}</h2>
                                <img src="img/DALLE_liquor/${alcohol}.png" style="width: 50%; margin-left: 25%">
                                <br>
                                <p class="liquor-info"> ${liquorData[alcohol].Info}</p>
                                <br>
                                <p class="liquor-fun"> <b>Fun Fact:</b> ${liquorData[alcohol].Fun}</p>
                            </div>
                            
                        </div>
                    </div>`

                d3.select('.menu-page')
                    .html(vis.liquorText)


                // Reset tooltip
                vis.tooltip
                    .style('left', 0 + 'px')
                    .style('top', 0 + 'px')
                    .style('opacity', 0)

                    .html('')

                //
                // SMALL BUBBLE VIS
                //


                // // Hide all bubbles
                vis.svg.selectAll('*').remove();

                vis.smallBubbleGroup = vis.svg.append("g").attr('transform', `translate(${-vis.width/6},0)`)


                // Create a shaded background bubble
                vis.smallBubbleGroup.append('circle')
                    .attr('class', 'background-bubble')
                    .attr('cx', vis.width / 2)
                    .attr('cy', vis.height / 2)
                    .attr('r', 280)
                    .style('fill', vis.alcTypeColorMap[clickedBubbleData.strDrink])
                    .style('opacity', 0.3)
                    .style('stroke', 'rgba(0,0,0,0.87)')
                    .style('stroke-width', "1px")


                let selectedDrinks = vis.originalData.filter(drink => drink.Alc_type.includes(clickedBubbleData.strDrink));
                console.log(selectedDrinks)

                // Unique identifier for the smaller bubbles (e.g., using strDrink)
                let smallBubbleClass = 'small-bubble-' + clickedBubbleData.strDrink.replace(/[^a-zA-Z0-9]/g, ""); // Sanitize for class name

                // Calculate positions for smaller bubbles around the center
                let smallBubblePositions = getCirclePositions(vis.width / 2, vis.height / 2, selectedDrinks.length, 105); // 50 is the spread radius


                // TODO: SHOW IMAGES INSTEAD OF TEXT!

                // Create smaller bubbles for the clicked big bubble
                vis.smallBubbleGroup.selectAll('.' + smallBubbleClass)
                    .data(selectedDrinks)
                    .enter().append('circle')
                    .attr('class', smallBubbleClass)
                    .attr('cx', (d, i) => smallBubblePositions[i].x)
                    .attr('cy', (d, i) => smallBubblePositions[i].y)
                    .attr('r', 65) // Smaller bubble radius
                    .style('fill', vis.alcTypeColorMap[clickedBubbleData.strDrink])
                    .style('opacity', 0.8)
                    .on('mouseover', vis.showCocktailDetails

                        // const container = document.getElementById('imagesContainer');
                        //
                        // // Clear existing content
                        // container.innerHTML = '';
                        //
                        // // Loop through the data
                        // d.Alc_type.forEach(item => {
                        //     // Create an img element
                        //     const img = document.createElement('img');
                        //
                        //     // Set the src attribute (modify as needed based on your data structure)
                        //     img.src = `img/DALLE_liquor/${item}.png`;
                        //
                        //     // Append the img to the container
                        //     container.appendChild(img);
                        // });
                    )
                    .on('mouseout', function (event, d) {

                        d3.select('.menu-page')
                            .html(vis.liquorText)
                    });

                vis.smallBubbleGroup.selectAll('.text-small-bubble')
                    .data(selectedDrinks)
                    .enter().append('text')
                    .attr('class', 'text-small-bubble')
                    .text(d => d.strDrink)
                    .attr('x', (d, i) => smallBubblePositions[i].x)
                    .attr('y', (d, i) => smallBubblePositions[i].y)
                    .attr('dy', '0.3em')
                    .style('font-size', '22px')
                    .style('text-anchor', 'middle')
                    .on('mouseover', vis.showCocktailDetails)
                    .on('mouseout', function (event, d) {

                        d3.select('.menu-page')
                            .html(vis.liquorText)
                    });



                    //.attr('fill', vis.alcTypeColorMap[clickedBubbleData.strDrink])
                //.on('mouseover', vis.enlargeBubble)

            })
        });

        vis.svg.on('click', function(event) {
            vis.resetView();

            let bubbleCol = d3.select('.bubble-col');
            let menuCol = d3.select('.menu-col');

            // Update the classes for bubbleCol and menuCol
            bubbleCol.classed('col-8', false).classed('col-12', true);
            menuCol.classed('col-4', true).style('display', 'none');
            // Check if the click happened on white space, not on a bubble
            // if (event.target.tagName !== 'circle') {
            //
            // }
        });
    }


    enlargeBubble(element, d) {
        let vis = this;
        // Enlarge the hovered bubble

        d3.select(element).transition()
            .attr('r', vis.radiusScale(d.rank)*2)
            .duration(200)
            .style('fill', d3.rgb(vis.color(d.strDrink)).darker(0.9)); // Darken the fill color

        // Update the collision force to account for the enlarged bubble
        this.simulation.force('collision', d3.forceCollide().radius(node => {
            return node === d ? d.rank * vis.radiusMultiplier * 2 : d.rank * vis.radiusMultiplier;
        })).alpha(0.1).restart(); // Restart the simulation with updated collision radius
    }

    showCocktailDetails(element, d){
        let vis = this;
        console.log(d)

        // TODO: SHOW IMAGES INSTEAD OF TEXT!
        let alcohol = d.Alc_type[0].split(' ').join('_')
        let cocktailImgUrl = `img/popular_drink/${d.strDrink}.png`
        let liquorIconUrl = `img/DALLE_liquor/${alcohol}.png`

        vis.drinkText = ` 
                            <div class="row" style="height: 100%">
                                <div class="col-12">
                                    <div class="row" style="height: 10vh; padding-top: 6vh">
                                        <h2 class="cocktail-name">${d.strDrink}</h2>
                                    </div>
                                    <div class="row cocktail-image" style="height: 17vh; padding-top: 5vh">
                                        <img src="${cocktailImgUrl}" alt="Cocktail Image" style="width: auto; height: 100%">
                                    </div>
                                    
                                    <!-- Subheading for Liquor -->
                                    <div class="row justify-content-center" style="height: 14vh; margin-top: 2vh">
                                        <br>
                                        <br>
                                        <h3 class="subheading">Base Liquor: ${d.Alc_type[0]}</h3>
                                        <img src="${liquorIconUrl}" alt="Liquor Image" style="width: 20%; height: 60%">
                                    </div>
        
                                    <!-- Subheading for Ingredients -->
                                    <div class="row" style="margin-top: 2vh">
                                        <h3 class="subheading">Ingredients</h3>
                                        <div class="ingredients col-12">
                                            <div class="row" style="padding: 0 20% 0 20%">
                                                <p class="cocktail-ingredients"> ${d.strIngredients.join(' ')}</p>
                                                <!-- First Row of Ingredients -->
<!--                                                <div class="col-3 d-flex justify-content-center">-->
<!--                                                    <img src="img/rr_images/sugar.png" alt="Ingredient 1" class="ingredient-icon" title="Ingredient 1">-->
<!--                                                </div>-->
<!--                                                <div class="col-3 d-flex justify-content-center">-->
<!--                                                    <img src="img/rr_images/lime.png" alt="Ingredient 2" class="ingredient-icon" title="Ingredient 2">-->
<!--                                                </div>-->
<!--                                                <div class="col-3 d-flex justify-content-center">-->
<!--                                                    <img src="img/rr_images/mint.png" alt="Ingredient 3" class="ingredient-icon" title="Ingredient 3">-->
<!--                                                </div>-->
<!--                                                <div class="col-3 d-flex justify-content-center">-->
<!--                                                    <img src="img/rr_images/mint.png" alt="Ingredient 4" class="ingredient-icon" title="Ingredient 4">-->
<!--                                                </div>-->
                                            </div>
                                        </div>
                                        
                                        <div class="centered-text" style="height: 5vh; padding: 1vh 8vh 2vh 8vh">
                                            <!-- Liquor icon here -->
                                            <h3 class="subheading">Instruction</h3>
                                            <p class="cocktail-instructions"> ${d.strInstructions}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>`

        d3.select('.menu-page')
            .html(vis.drinkText)

    }

    resetView() {
        this.allDrink = false;
        this.wrangleData();

        // Restore the original positions and opacity of the bubbles
        this.bubbles.transition()
            .duration(800)
            .style('opacity', 0.7);

        // Remove smaller bubbles
        this.svg.selectAll('.small-bubble').remove();
    }


}

function getCirclePositions(centerX, centerY, numberOfItems, radius) {
    let positions = [];
    for (let i = 0; i < numberOfItems; i++) {
        let angle = (i / numberOfItems) * (2 * Math.PI); // Distribute around the circle
        let x = centerX + radius*2 * Math.cos(angle);
        let y = centerY + radius*2 * Math.sin(angle);
        positions.push({ x: x, y: y });
    }
    return positions;
}

function showInfo(event, data) {




}

