const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/GDP-data.json";
const xhr = new XMLHttpRequest();

const scale = 0.5;
const w = 1920 * scale;
const h = 1080 * scale;
const paddingTop = 90;
const paddingBottom = 50;
const paddingLeft = 80;
const paddingRight = 30;

const arrayColumn = (arr, n) => arr.map(x => x[n]);


xhr.open("GET", url, true);
xhr.onload = function() {
    const json = JSON.parse(this.responseText);
    console.log(json);

    const dates = arrayColumn(json.data, 0);
    const gdp = arrayColumn(json.data, 1);
    const xScale = d3.scaleTime()
        // assuming dates are already sorted in the json file
        .domain([new Date(dates[0]), new Date(dates[dates.length - 1])])
        .range([paddingLeft, w - paddingRight]);

    const yScale = d3.scaleLinear()
        .domain([0, d3.max(gdp)])
        .range([h - paddingBottom, paddingTop]);

    const tooltip = d3.select("#root")
        .append("div")
        .attr("id", "tooltip");

    const svg = d3.select("#root")
        .append("svg")
        .attr("width", w)
        .attr("height", h);

    // title
    svg.append("text")
        .attr("x", (w / 2))             
        .attr("y", (paddingTop / 2))
        .attr("id", "title")
        .attr("text-anchor", "middle")  
        .style("font-size", "32px")   
        .text("US GDP");    
        
    // x-axis
    const xAxis = d3.axisBottom(xScale);
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + (h - paddingBottom) + ")")
        .call(xAxis);
    
    // x-axis label
    svg.append("text")
        .attr("x", (w/2))
        .attr("y", h - 10)
        .attr("text-anchor", "middle")
        .text("Year");

    // y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(d => d);
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + (paddingLeft) + ", 0)")
        .call(yAxis);

    // y-axis label
    svg.append("text")
        .attr("x", 0-(h/2))
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .style("transform", "rotate(-90deg)")
        .text("Gross Domestic Product (billion USD)");

    // plot data
    svg.selectAll("rect")
        .data(json.data)
        .enter()
        .append("rect")
        .attr("x", d => xScale(new Date(d[0])))
        .attr("y", d => yScale(d[1]))
        .attr("width", (w/json.data.length) - 0.3)
        .attr("height", d => h - yScale(d[1]) - paddingBottom)
        .attr("class", "bar")
        .attr("data-date", d => d[0])
        .attr("data-gdp", d => d[1])
        .on("mouseover", (e,d) => tooltip
            .html(d[0] + "<br/> $" + d[1] + " billion")
            .attr("data-date", d[0])
            .style("visibility", "visible")
        )
        .on("mousemove", (e) => tooltip.style("left", (e.pageX + 30) + "px")
            .style("top", (e.pageY - 30) + "px"))
        .on("mouseout", () => tooltip.style("visibility", "hidden"));           
        
};
xhr.send();
