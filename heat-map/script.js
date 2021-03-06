const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json";
const xhr = new XMLHttpRequest();
xhr.open("GET", url, true);

const scale = 1;
const w = 1200*scale;
const h = 500*scale;
const margin = {
    top: 20, bottom: 100, left: 60, right: 20
};
const monthMap = {
    1: "January", 2: "February", 3: "March", 4: "April",
    5: "May", 6: "June", 7: "July", 8: "August",
    9: "September", 10: "October", 11: "November", 12: "December"
};

// generate equally spaced colors between Red-Yellow-Blue gradient
const numColors = 11;
let colorMap = Array(numColors);
for (let i=0; i<=numColors-1; i++) {
    colorMap[numColors-1-i] = d3.interpolateRdYlBu(i * (1.0/(numColors-1)));
}

// title
d3.select("#root")
    .append("h2")
    .attr("id", "title")
    .text("Monthly Global Land-Surface Temperature")
    .style("top", margin.top/2)
    .style("left", w/2);


xhr.onload = function() {
    const json = JSON.parse(xhr.responseText);
    const data = json.monthlyVariance;
    const baseTemp = json.baseTemperature;
    console.log(json);

    // define x-scale
    const years = data.map(d => d.year);
    const minYear = d3.min(years);
    const maxYear = d3.max(years);
    const xDomain = [minYear-0.5, maxYear+0.5];
    const xScale = d3.scaleLinear()
        .domain(xDomain)
        .range([margin.left, w-margin.right]);
    
    // define y-scale
    const yScale = d3.scaleLinear()
        .domain([0.5, 12.5])
        .range([margin.top, h-margin.bottom])
        ;

    // description
    d3.select("#root")
        .append("h2")
        .attr("id", "description")
        .style("top", margin.top/2)
        .style("left", w/2)
        .text("Years: " + minYear + " - " + maxYear + ", Base Temperature: " + baseTemp + "\u00B0C");

    // define colorScale
    const variances = data.map(d => d.variance)
    const colorDomain = [baseTemp+d3.min(variances), baseTemp+d3.max(variances)];
    const colorScale = d3.scaleQuantize()
        .domain(colorDomain)
        .range(colorMap);
    
    // define tooltip
    const tooltip = d3.select("#root")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", 0);

    // append main svg
    const svg = d3.select("#root")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // add x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d);
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + (h - margin.bottom) + ")")
        .call(xAxis);
        // .append("text")
        // .attr("x", (w/2))
        // .attr("y", h - 10)
        // .attr("text-anchor", "middle")
        // .text("Year");

    // add y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(d => monthMap[d]);
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + (margin.left) + ", 0)")
        .call(yAxis);

    // define legend
    const legend = svg
        .append("g")
        .attr("id", "legend");
    
    // add legend color squares
    const size = 30;
    legend.append("g")
        .selectAll("rect")
        .data(colorMap)
        .enter()
        .append("rect")
        .attr("height", size)
        .attr("width", size)
        .attr("x", (d,i) => 25 + margin.left + i*size)
        .attr("y", h-margin.bottom/2)
        .attr("fill", d => d)
        .attr("stroke", "black");

    // add legend x-axis
    // a little complex, but it allows adding changing color scale or even adding more resolution
    const legendXScale = d3.scaleLinear()
        .domain(colorDomain)
        .range([25 + margin.left - 1, 25 + margin.left + numColors*size]);
    const tickVals = Array(numColors+1);
    for (let i=0; i<numColors; i++) {
        tickVals[i] = colorScale.invertExtent(colorMap[i])[0];
    }
    tickVals[numColors] = colorScale.invertExtent(colorMap[numColors-1])[1];
    console.log(tickVals);
    const legendXAxis = d3.axisBottom(legendXScale).tickValues(tickVals).tickFormat(d => d.toFixed(1));
    legend.append("g")
        .attr("transform", "translate(0," + (h+size-margin.bottom/2) + ")")
        .call(legendXAxis);


    // add main data cells
    const rectWidth = (w - margin.left - margin.right)/(xDomain[1]-xDomain[0]);
    const rectHeight = (h - margin.top - margin.bottom)/12;
    console.log(rectWidth);
    svg.append("g")
        .attr("id", "map")
        .selectAll("rect")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("x", d => xScale(d.year)+1 -(rectWidth/2))
        .attr("y", d => yScale(d.month) - (rectHeight/2))
        .attr("width", rectWidth)
        .attr("height", rectHeight)
        .attr("fill", d => colorScale(baseTemp + d.variance))
        .attr("data-month", d => d.month-1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => baseTemp+d.variance)
        .on("mouseover", (e,d) => {
            const html = d.year + " - " + monthMap[d.month] + "<br/>"
                + (baseTemp + d.variance).toFixed(2) + "\u00B0C (" + d.variance.toFixed(2) + "\u00B0C)";
            tooltip.html(html)
                .attr("data-year", d.year)
                .attr("data-temp", baseTemp + d.variance)
                .attr("data-month", monthMap[d.month])
                .style("top", (e.pageY - 10) + "px")
                .style("left", (e.pageX + 10) + "px")
            tooltip.transition()
                .duration(100)
                .style("opacity", 1);
              
        })
        .on("mousemove", (e) => {
            tooltip
                .style("top", (e.pageY - 10) + "px")
                .style("left", (e.pageX + 10) + "px")
        })
        .on("mouseout", () => {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        });
    
};
xhr.send();
