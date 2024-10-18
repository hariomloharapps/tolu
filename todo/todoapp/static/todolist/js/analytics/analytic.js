document.addEventListener('DOMContentLoaded', function() {
    const data = [
        { month: 'Jan', value: 10 },
        { month: 'Feb', value: 20 },
        { month: 'Mar', value: 15 },
        { month: 'Apr', value: 25 },
        { month: 'May', value: 22 },
        { month: 'Jun', value: 30 },
        { month: 'Jul', value: 28 },
        { month: 'Aug', value: 35 },
        { month: 'Sep', value: 32 },
        { month: 'Oct', value: 40 },
        { month: 'Nov', value: 38 },
        { month: 'Dec', value: 45 }
    ];

    const svg = d3.select("#analytics-graph");
    const width = 1000;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 20, left: 40 };

    // Scales
    const x = d3.scalePoint()
        .range([margin.left, width - margin.right])
        .domain(data.map(d => d.month));

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([0, d3.max(data, d => d.value)]);

    // Color scale
    const colorScale = d3.scaleLinear()
        .domain([0, 1])
        .range(["#0000FF", "#00FF00"]);

    // Update gradient
    const gradient = svg.select("#line-gradient");
    gradient.selectAll("stop")
        .data(data)
        .enter().append("stop")
        .attr("offset", (d, i) => `${(i / (data.length - 1)) * 100}%`)
        .attr("stop-color", d => colorScale(d.value / d3.max(data, d => d.value)));

    // Create a smooth curve
    const line = d3.line()
        .x(d => x(d.month))
        .y(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5));

    // Add the smooth curve to the SVG
    const path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("stroke", "url(#line-gradient)")
        .attr("d", line);

    // Animate the line drawing
    const pathLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(2000)
        .attr("stroke-dashoffset", 0);

    // Add a transparent rectangle for click events
    svg.append("rect")
        .attr("class", "click-area")
        .attr("width", width)
        .attr("height", height);

    // Create a group for the click point and details box
    const clickGroup = svg.append("g")
        .attr("class", "click-group")
        .style("opacity", 0);

    clickGroup.append("circle")
        .attr("class", "click-point")
        .attr("r", 5);

    clickGroup.append("rect")
        .attr("class", "details-box")
        .attr("width", 120)
        .attr("height", 50)
        .attr("rx", 5)
        .attr("ry", 5);

    clickGroup.append("text")
        .attr("class", "details-text");

    // Function to handle click events
    function handleClick(event) {
        const [xPos, yPos] = d3.pointer(event);
        
        // Find the nearest data point
        const index = d3.least(data, d => Math.abs(x(d.month) - xPos));
        const nearestPoint = data[data.indexOf(index)];

        clickGroup.transition()
            .duration(300)
            .style("opacity", 1)
            .attr("transform", `translate(${x(nearestPoint.month)},${y(nearestPoint.value)})`);

        clickGroup.select(".details-box")
            .attr("x", 10)
            .attr("y", -60);

        clickGroup.select(".details-text")
            .attr("x", 15)
            .attr("y", -40)
            .text(`${nearestPoint.month}: ${nearestPoint.value} todos`)
            .append("tspan")
            .attr("x", 15)
            .attr("dy", "1.2em")
            .text(`${((nearestPoint.value / d3.max(data, d => d.value)) * 100).toFixed(2)}% of max`);
    }

    // Add click event listener
    svg.select(".click-area")
        .on("click", handleClick);

    // Add y-axis
    svg.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y));

    // Add x-axis
    svg.append("g")
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x));
});