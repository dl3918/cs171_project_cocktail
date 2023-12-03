class iconVis {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.displayCount = 10; // Number of images to display at a time

        // Set dimensions of the parent element
        this.width = document.getElementById(this.parentElement).getBoundingClientRect().width;
        this.height = document.getElementById(this.parentElement).getBoundingClientRect().height;
        this.iconWidth = 70; // Width of each icon

        // Prepare data by setting initial positions
        this.prepareData();

        // Initialize the visualization
        this.initVis();
    }

    prepareData() {
        let vis = this;
        vis.data.forEach((d, i) => {
            // 增加间距，比如使用图标宽度的两倍
            d.xPosition = i * (vis.iconWidth * 2);
            // console.log(`Data item ${i}, rank: ${d.rank}, xPosition: ${d.xPosition}`); // 调试信息
        });
    }

    initVis() {
        let vis = this;

        // Get dimensions of the parent element
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height;
        vis.iconWidth = 70; // Width of each icon

        // Create SVG element
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height);

        // Start the continuous scroll
        vis.startContinuousScroll();
    }

    startContinuousScroll() {
        let vis = this;

        // 修改这里，设置一个固定的图标间距
        let iconSpacing = vis.iconWidth * 2;  // 两倍图标宽度的间距

        // 添加变量来跟踪最右侧图标的位置
        let rightMostX = vis.data[vis.data.length - 1].xPosition;

        // Bind data to icons
        vis.icons = vis.svg.selectAll(".icon").data(vis.data, d => d.rank)
            .enter().append("svg:image")
            .attr("class", "icon")
            .attr("x", d => d.xPosition)
            .attr("y", vis.height / 2 - vis.iconWidth / 2)
            .attr("width", vis.iconWidth)
            .attr("height", vis.iconWidth)
            .attr("xlink:href", d => `img/${d.rank}.png`);

        // Function to update positions
        function scroll() {
            vis.icons.attr("x", function(d) {
                d.xPosition -= 2; // 调整滚动速度

                // 当图标移动到屏幕左侧时
                if (d.xPosition < -vis.iconWidth) {
                    // 计算新位置，确保固定间距
                    d.xPosition = d.xPosition + vis.data.length * iconSpacing;
                }

                return d.xPosition;
            });

            requestAnimationFrame(scroll);
        }

        scroll(); // Start scrolling
    }
}

