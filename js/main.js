new fullpage('#fullpage', {
    //options here
    autoScrolling:true,
    //scrollHorizontally: true,
    fitToSection: true,
    //parallax: true,
    navigation: true,
    navigationPosition: 'right',

    licenseKey: "gplv3-license",
    anchors: ['page1', 'page2','page3','page4','page5','page6','page7','page8','page9','page10','page11','page12','page13'],

    // 当section加载完成后触发
    afterLoad: function(origin, destination, direction){
        // 检查是否是特定的section
        if(destination.item.id === 'section1-transpage'){
            const lines = document.querySelectorAll('#section1-transpage .line');
            startTypingEffect(lines);
        }

        if(destination.item.id === 'section-popular-transpage'){
            let lines = document.querySelectorAll('#popularText .line-popular');
            lines.forEach((line, index) => {
                setTimeout(() => {
                    line.classList.add('visible');
                }, index * 1000); // 每行间隔1秒
            });
        }

        if(destination.item.id === 'section-treemap-transpage'){
            let lines = document.querySelectorAll('#treemapText .line-treemap');
            lines.forEach((line, index) => {
                setTimeout(() => {
                    line.classList.add('visible');
                }, index * 600); // 每行间隔1秒
            });
        }

        // 针对section-mixology-transpage的动画（逐字打印效果）
        if(destination.item.id === 'section-mixology-transpage'){
            const lines = document.querySelectorAll('#section-mixology-transpage .line');
            startTypingEffect(lines);
        }

        if(destination.item.id === 'section-ourteam-transpage'){
            const lines = document.querySelectorAll('#section-ourteam-transpage .line');
            startTypingEffect(lines);
        }
    }
});

function startTypingEffect(lines) {
    lines.forEach((line, index) => {
        setTimeout(() => {
            line.style.visibility = 'visible';
            line.style.animation = `typing 2s steps(${line.textContent.length* 2}, end) forwards`;
        }, index * 1500); // Adjust the delay as needed
    });
}

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
