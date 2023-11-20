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
    d3.csv('data/network/ingredient_relationships.csv')
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


function initMainPage(dataArray) {
    myNetworkVis = new NetworkVis('networkDiv', dataArray[0], dataArray[1]);
}