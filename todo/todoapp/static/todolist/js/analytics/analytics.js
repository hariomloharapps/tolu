// analytics.js

document.addEventListener('DOMContentLoaded', function() {
    fetchAnalyticsData();
});

function fetchAnalyticsData() {
    $.ajax({
        url: '/get_analytics/',  // Update this URL to match your Django URL configuration
        method: 'GET',
        success: function(response) {
            createGraph(response.last_30_days, '#graph-30-days', 'Last 30 Days');
            createGraph(response.last_7_days, '#graph-7-days', 'Last 7 Days');
        },
        error: function(error) {
            console.error('Error fetching analytics data:', error);
        }
    });
}

function createGraph(data, selector, title) {
    const svg = d3.select(selector);
    const width = 1000;
    const height = 400;
    const margin = { top: 60, right: 60, bottom: 40, left: 40 };

    // Clear existing content
    svg.selectAll("*").remove();

    // Scales
    const x = d3.scalePoint()
        .range([margin.left, width - margin.right])
        .domain(data.map(d => d.date));

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([0, d3.max(data, d => Math.max(d.created, d.completed))]);

    // Color scale
    const colorScale = d3.scaleOrdinal()
        .domain(['created', 'completed'])
        .range(["#0000FF", "#00FF00"]);

    // Create lines
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5));

    const createdLine = svg.append("path")
        .datum(data.map(d => ({date: d.date, value: d.created})))
        .attr("class", "line")
        .attr("stroke", colorScale('created'))
        .attr("d", line);

    const completedLine = svg.append("path")
        .datum(data.map(d => ({date: d.date, value: d.completed})))
        .attr("class", "line")
        .attr("stroke", colorScale('completed'))
        .attr("d", line);

    // Animate lines
    animateLine(createdLine);
    animateLine(completedLine);

    // Add title
    svg.append("text")
        .attr("class", "title")
        .attr("x", margin.left)
        .attr("y", margin.top / 2)
        .text(title);

    // Add legend
    const legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", `translate(${width - margin.right}, ${margin.top})`);

    legend.append("circle").attr("cx", 0).attr("cy", 0).attr("r", 6).style("fill", colorScale('created'));
    legend.append("text").attr("x", 10).attr("y", 0).text("Created").style("font-size", "15px").attr("alignment-baseline", "middle");
    legend.append("circle").attr("cx", 0).attr("cy", 20).attr("r", 6).style("fill", colorScale('completed'));
    legend.append("text").attr("x", 10).attr("y", 20).text("Completed").style("font-size", "15px").attr("alignment-baseline", "middle");

    // Add axes
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%m/%d")));

    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Add interactivity
    const focus = svg.append("g")
        .attr("class", "focus")
        .style("display", "none");

    focus.append("circle")
        .attr("r", 5);

    focus.append("rect")
        .attr("class", "tooltip")
        .attr("width", 100)
        .attr("height", 50)
        .attr("x", 10)
        .attr("y", -22)
        .attr("rx", 4)
        .attr("ry", 4);

    focus.append("text")
        .attr("class", "tooltip-date")
        .attr("x", 18)
        .attr("y", -2);

    focus.append("text")
        .attr("x", 18)
        .attr("y", 18)
        .text("Created:");

    focus.append("text")
        .attr("class", "tooltip-created")
        .attr("x", 75)
        .attr("y", 18);

    focus.append("text")
        .attr("x", 18)
        .attr("y", 38)
        .text("Completed:");

    focus.append("text")
        .attr("class", "tooltip-completed")
        .attr("x", 95)
        .attr("y", 38);

    svg.append("rect")
        .attr("class", "overlay")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", () => focus.style("display", null))
        .on("mouseout", () => focus.style("display", "none"))
        .on("mousemove", mousemove);

    function mousemove(event) {
        const bisect = d3.bisector(d => d.date).left;
        const x0 = x.invert(d3.pointer(event)[0]);
        const i = bisect(data, x0, 1);
        const d0 = data[i - 1];
        const d1 = data[i];
        const d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        focus.attr("transform", `translate(${x(d.date)},${y(Math.max(d.created, d.completed))})`);
        focus.select(".tooltip-date").text(d.date);
        focus.select(".tooltip-created").text(d.created);
        focus.select(".tooltip-completed").text(d.completed);
    }
}

function animateLine(path) {
    const length = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", length + " " + length)
        .attr("stroke-dashoffset", length)
        .transition()
        .duration(2000)
        .ease(d3.easeLinear)
        .attr("stroke-dashoffset", 0);
}