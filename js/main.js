new fullpage('#fullpage', {
    //options here
    autoScrolling:true,
    //scrollHorizontally: true,
    fitToSection: true,
    //parallax: true,
    navigation: true,
    navigationPosition: 'right',

    licenseKey: "gplv3-license",
    anchors: ['page1', 'page2','page3','page4','page5','page6','page7','page8','page9','page10']
});


let promises = [
    d3.json('data/network/nodes.json'), //0
    d3.json('data/network/edges.json'), //1
    d3.json('data/grouped_cocktails.json'), //2
    d3.json('data/all_drink_clean.json'), //3
    d3.json('data/treemap_data.json'), //4
    d3.csv('data/data_cocktails_cleaned.csv'), //5
    d3.json('data/mixology/mix_ingredients.json'), //6
    d3.json('data/mixology/mix_drinks.json') //7
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
let myTreeMap;
// let myTasteVis;
let myMixologyVis;

function initMainPage(dataArray) {
    const groupedByAlcType = groupByAlcType(dataArray[2]);
    console.log(groupedByAlcType);

    myIconVis = new iconVis('icon-bottom-bar', dataArray[2])
    myBubbleChart = new BubbleChart('bubbles', dataArray[2]);
    //myAllBubbleChart = new BubbleChart('allDrink', dataArray[2],true);
    myallBubbleChart_enoch = new allBubbleChart('all_drinks_enoch', dataArray[3]);
    myTreeMap = new TreeMap('treemapDiv', dataArray[4]);
    // myTasteVis = new tasteBubbleChart('taste', dataArray[5]);
    myNetworkVis = new NetworkVis('networkDiv', dataArray[0], dataArray[1]);
    myMixologyVis = new MixologyVis('mixologyDiv', dataArray[6], dataArray[7]);

    // document.getElementById('resetViewButton').addEventListener('click', () => {
    //     myBubbleChart.resetView();
    // });

}

let selectedCategory =  document.getElementById('categorySelector').value;
let colorCategory = document.getElementById('colorSelector').value;

function categoryChange() {
    selectedCategory = document.getElementById('categorySelector').value;
    myallBubbleChart_enoch.categoryChange(selectedCategory);
    myallBubbleChart_enoch.colorChange(selectedCategory);
}

function colorChange() {
    colorCategory = document.getElementById('colorSelector').value;
    myallBubbleChart_enoch.colorChange(colorCategory);
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


