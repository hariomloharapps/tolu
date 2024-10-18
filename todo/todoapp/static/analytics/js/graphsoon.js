// Sample data for the graph
const sampleData = [
    { date: new Date('2023-01-01'), value: 30 },
    { date: new Date('2023-01-02'), value: 50 },
    { date: new Date('2023-01-03'), value: 20 },
    { date: new Date('2023-01-04'), value: 80 },
    { date: new Date('2023-01-05'), value: 40 },
];

function createNewGraph() {
    const svg = d3.select('#new-graph-svg');
    svg.selectAll("*").remove(); // Clear existing content

    const width = 1000;
    const height = 500;
    const margin = { top: 60, right: 60, bottom: 40, left: 60 };

    // Scales
    const x = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(d3.extent(sampleData, d => d.date));

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([0, 100]);

    // Create a line generator
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value));

    // Set SVG properties
    svg.attr('width', width)
       .attr('height', height)
       .style('background', 'rgba(0, 0, 255, 0.1)')  // Light blue, semi-transparent background
       .style('backdrop-filter', 'blur(5px)')  // Glass effect
       .style('border-radius', '15px');  // Rounded corners

    // Add the line path
    svg.append('path')
        .datum(sampleData)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add title
    svg.append('text')
        .attr('class', 'title')
        .attr('x', width / 2)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'middle')
        .text('New Graph Title');

    // Add percentage
    const averageValue = d3.mean(sampleData, d => d.value);
    svg.append('text')
        .attr('class', 'avg-percentage')
        .attr('x', width - margin.right)
        .attr('y', margin.top / 2)
        .attr('text-anchor', 'end')
        .style('fill', 'green')
        .text(`${averageValue.toFixed(2)}%`);

    // Add "Coming Soon" button
    const button = svg.append('g')
        .attr('transform', `translate(${width/2}, ${height/2})`);

    button.append('rect')
        .attr('width', 150)
        .attr('height', 50)
        .attr('x', -75)
        .attr('y', -25)
        .attr('rx', 25)  // Rounded corners
        .attr('ry', 25)
        .style('fill', 'blue');

    button.append('text')
        .attr('text-anchor', 'middle')
        .attr('dy', '0.35em')
        .style('fill', 'white')
        .text('Coming Soon');

    button.on('click', () => {
        window.location.href = '/new-page';  // Redirect to new page
    });

    // Function to resize the new graph
    function resizeNewGraph() {
        const container = svg.node().parentNode;
        const containerWidth = container.offsetWidth;
        const containerHeight = Math.min(containerWidth * 0.5, 400);
        
        svg.attr('width', containerWidth)
           .attr('height', containerHeight);
        
        // Update scales
        x.range([margin.left, containerWidth - margin.right]);
        y.range([containerHeight - margin.bottom, margin.top]);
        
        // Update line
        svg.select('path').attr('d', line);
        
        // Update title position
        svg.select('.title')
           .attr('x', containerWidth / 2)
           .attr('y', margin.top / 2);
        
        // Update percentage position
        svg.select('.avg-percentage')
           .attr('x', containerWidth - margin.right)
           .attr('y', margin.top / 2);
        
        // Update button position
        button.attr('transform', `translate(${containerWidth/2}, ${containerHeight/2})`);
    }

    // Add event listener for window resize
    window.addEventListener('resize', resizeNewGraph);

    // Initial call to set the correct size
    resizeNewGraph();
}

// Call the function when the DOM is loaded
document.addEventListener('DOMContentLoaded', createNewGraph);