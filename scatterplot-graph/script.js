const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/cyclist-data.json";
const xhr = new XMLHttpRequest();
xhr.open("GET", url, true);

const scale = 1;
const w = 920*scale;
const h = 630*scale;
const margin = {
    top: 70, bottom: 20, left: 40, right: 20
};

const keys = ["No doping allegations", "Riders with doping allegations"];
const colors = ["green", "red"];

xhr.onload = function() {
    const json = JSON.parse(xhr.responseText);
    console.log(json);

    // dont use d3.timeParse(). It's epoch is set to Jan 1 1900,
    // which is causing the y-axis time scale to shift to values that
    // are not a multiple of 5 seconds: 
    // const parseTime = d3.timeParse("%M:%S");
    // as a result, I've also decided to opt-out of timeParse() for parseYear:
    // const parseYear = d3.timeParse("%Y");
    
    // instead use built-in Date() constructor in JS
    const parseTime = seconds => new Date(seconds*1000);
    const parseYear = year => year
    
    const years = json.map(obj => parseYear(obj.Year));
    const times = json.map(obj => parseTime(obj.Seconds));

    const xScale = d3.scaleLinear()
        .domain([d3.min(years) - 1, d3.max(years) + 1])
        .range([margin.left, w - margin.right]);

    const yScale = d3.scaleTime()
        .domain([d3.min(times), d3.max(times)])
        .range([margin.top, h - margin.bottom])
        .nice();

    // tooltip
    const tooltip = d3.select("#root")
        .append("div")
        .attr("id", "tooltip")
        .style("opacity", "0");
    

    const svg = d3.select("#root")
        .append("svg")
        .attr("height", h)
        .attr("width", w);

    // title
    svg.append("text")
        .attr("x", (w / 2))             
        .attr("y", (margin.top / 2))
        .attr("id", "title")
        .attr("text-anchor", "middle")  
        .style("font-size", "20px")   
        .html("Doping in Professional Bicycle Racing: 35 Fastest times up Alpe d'Huez");
    
    // x-axis
    const xAxis = d3.axisBottom(xScale).tickFormat(d => d);
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + (h - margin.bottom) + ")")
        .call(xAxis);


    // y-axis
    const yAxis = d3.axisLeft(yScale).tickFormat(d => d3.timeFormat("%M:%S")(d));
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(" + margin.left + ", 0)")
        .call(yAxis);

    // plot
    svg.selectAll("circle")
        .data(json)
        .enter()
        .append("circle")
        .attr("cx", (d,i) => xScale(years[i]))
        .attr("cy", (d,i) => yScale(times[i]))
        .attr("r", 5)
        .attr("fill", d => d.Doping == "" ? colors[0] : colors[1])
        .attr("class", "dot")
        .attr("data-xvalue", (d,i) => years[i])
        .attr("data-yvalue", (d,i) => times[i])
        .attr("stroke", "black")
        .attr("opacity", "0.7")
        .on("mouseover", (e,d) => {
            let html = d.Name + " (" + d.Nationality + ")<br/>"
            + "Year: " + d.Year + " Time: " + d.Time + "<br/>";
            if (d.Doping != "") {
               html += ("<br/>" + d.Doping)
            }
            tooltip.html(html)
                .attr("data-year", parseYear(d.Year))
                .style("left", (e.pageX+10) + "px")		
                .style("top", (e.pageY-10) + "px");

            tooltip.transition()
                .duration(100)
                .style("opacity", 1);
        })
        .on("mouseout", (e,d) => {
            tooltip.transition()
                .duration(100)
                .style("opacity", 0);
        });

    const size = 15;
    const legend = svg
        .append("g")
        .attr("id", "legend");

    // legend
    legend.selectAll("legendSquares")
        .data(keys)
        .enter()
        .append("rect")
        .attr("x", w - margin.right - 200)
        .attr("y", (d,i) => 100 + i*(size+5))
        .attr("height", size)
        .attr("width", size)
        .attr("fill", (d,i) => colors[i])
        .attr("stroke", "black")
        .attr("opacity", "0.7");
    legend.selectAll("legendLabels")
        .data(keys)
        .enter()
        .append("text")
          .attr("x", w - margin.right - 200 + size*1.2)
          .attr("y", (d,i) => 100 + i*(size+5) + (size*0.9)) // 100 is where the first dot appears. 25 is the distance between dots
          .style("fill", (d, i) => colors[i])
          .text(d => d) 
          .attr("text-anchor", "left")
          .style("alignment-baseline", "middle")
          .style("font-size", "14px");
    
};
xhr.send();
