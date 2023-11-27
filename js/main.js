new fullpage('#fullpage', {
    //options here
    autoScrolling:true,
    scrollHorizontally: true,
    fitToSection: true,
    parallax: true,
    navigation: true,
    navigationPosition: 'right',

    licenseKey: "gplv3-license",
    anchors: ['page1', 'page2','page3','page4','page5','page6','page7']
});


let promises = [
    d3.csv('data/network/network_ingredients.csv'),
    d3.csv('data/network/ingredient_relationships.csv'),
    d3.json('data/grouped_cocktails.json'),
    d3.json('data/all_drink_clean.json')
]
let dataArray = []
Promise.all(promises)
    .then(function (data) {
        dataArray = data
        initMainPage(dataArray)
    })
    .catch(function (err) {
        console.log(err)
    });

let myNetworkVis;
let myBubbleChart;
let myAllBubbleChart;
let myIconVis;
let myallBubbleChart_enoch;

function initMainPage(dataArray) {
    const groupedByAlcType = groupByAlcType(dataArray[2]);
    console.log(groupedByAlcType);

    myIconVis = new iconVis('icon-bottom-bar', dataArray[2])
    myBubbleChart = new BubbleChart('bubbles', dataArray[2]);
    myAllBubbleChart = new BubbleChart('allDrink', dataArray[2],true);
    myallBubbleChart_enoch = new allBubbleChart('all_drinks_enoch', dataArray[3]);
    myNetworkVis = new NetworkVis('networkDiv', dataArray[0], dataArray[1]);

    document.getElementById('resetViewButton').addEventListener('click', () => {
        myBubbleChart.resetView();
    });

}

// Use d3.interval for periodic tasks
let slideInterval = d3.interval(() => {
    myIconVis.slideIcons(); // Call the method to slide icons
}, 800);

let selectedCategory =  document.getElementById('categorySelector').value;

function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    myallBubbleChart_enoch.categoryChange(selectedCategory);
}

function groupByAlcType(data) {
    let groupedData = {};

    data.forEach(drink => {
        drink.Alc_type.forEach(type => {
            if (!groupedData[type]) {
                groupedData[type] = {
                    base: type,
                    drinks: [],
                    totalRank: 0,
                    count: 0
                };
            }
            groupedData[type].drinks.push(drink.strDrink);
            groupedData[type].totalRank += drink.rank;
            groupedData[type].count += 1;
        });
    });

    // Convert the grouped data to an array
    return Object.values(groupedData);
}


