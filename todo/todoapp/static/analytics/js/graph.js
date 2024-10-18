

let graphData = null;

let retryCount = 0;
const MAX_RETRIES = 3;
const INITIAL_DELAY = 1000; // 1 second
const RETRY_DELAY = 3000; // 3 seconds

function setupAnalyticsGraphs() {
    setTimeout(() => {
        fetchAnalyticsData();
    }, INITIAL_DELAY);
}

function fetchAnalyticsData() {
    fetch('/t/')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(responseData => {
            graphData = {
                last30Days: responseData.last_30_days.map(entry => ({
                    date: new Date(entry.date),
                    value: entry.total_todos > 0 ? (entry.completed_todos / entry.total_todos) * 100 : 0,
                    completed: entry.completed_todos,
                    total: entry.total_todos
                })),
                last7Days: responseData.last_30_days.slice(-7).map(entry => ({
                    date: new Date(entry.date),
                    value: entry.total_todos > 0 ? (entry.completed_todos / entry.total_todos) * 100 : 0,
                    completed: entry.completed_todos,
                    total: entry.total_todos
                }))
            };

            // If we're already on the Analytics page, create the graphs immediately
            if ($('#analytics-content').hasClass('active')) {
                createGraphs();
            }

            // Reset retry count on successful fetch
            retryCount = 0;
        })
        .catch(error => {
            console.error('Error fetching or processing data:', error);
            
            if (retryCount < MAX_RETRIES) {
                retryCount++;
                console.log(`Retrying in ${RETRY_DELAY / 1000} seconds... (Attempt ${retryCount} of ${MAX_RETRIES})`);
                setTimeout(fetchAnalyticsData, RETRY_DELAY);
            } else {
                const graphContainers = document.querySelectorAll('.graph-container');
                graphContainers.forEach(container => {
                    container.innerHTML = `<p>Error loading graph data. Please try again later. (Error: ${error.message})</p>`;
                });
            }
        });
}


function createGraphs() {
    if (!graphData) return;

    createGraph(graphData.last30Days, '#graph-30days', '#line-gradient-30days', 'Last 30 days');
    createGraph(graphData.last7Days, '#graph-7days', '#line-gradient-7days', 'Last 7 days');
}

function createGraph(data, svgSelector, gradientId, title) {
    const svg = d3.select(svgSelector);
    svg.selectAll("*").remove(); // Clear existing content

    const width = 1000;
    const height = 500;
    const margin = { top: 120, right: 60, bottom: 40, left: 40 };

    // Scales
    const x = d3.scaleTime()
        .range([margin.left, width - margin.right])
        .domain(d3.extent(data, d => d.date));

    const y = d3.scaleLinear()
        .range([height - margin.bottom, margin.top])
        .domain([0, 100]);  // Percentage scale

    // Color scale
    const colorScale = d3.scaleLinear()
        .domain([0, 35, 70, 100])
        .range(["#FF0000", "#0000FF", "#0000FF", "#00FF00"]);

    // Create gradient
    const gradient = svg.append("defs")
        .append("linearGradient")
        .attr("id", gradientId.slice(1))
        .attr("gradientUnits", "userSpaceOnUse")
        .attr("x1", 0)
        .attr("y1", 0)
        .attr("x2", width)
        .attr("y2", 0);

    gradient.selectAll("stop")
        .data(data)
        .enter().append("stop")
        .attr("offset", (d, i) => `${(i / (data.length - 1)) * 100}%`)
        .attr("stop-color", d => colorScale(d.value));

    // Create a smooth curve using natural cubic spline interpolation
    const line = d3.line()
        .x(d => x(d.date))
        .y(d => y(d.value))
        .curve(d3.curveCatmullRom.alpha(0.5));

    // Add the smooth curve to the SVG
    const path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("stroke", `url(${gradientId})`)
        .attr("d", line)
        .attr("filter", "url(#glow)");

    // Animate the line drawing
    const pathLength = path.node().getTotalLength();
    path
        .attr("stroke-dasharray", pathLength + " " + pathLength)
        .attr("stroke-dashoffset", pathLength)
        .transition()
        .duration(2000)
        .ease(d3.easeQuadOut)
        .attr("stroke-dashoffset", 0);

    // Add reference lines
    const averageValue = d3.mean(data, d => d.value);
    const referenceLines = [
        { value: 50, label: "50%" },
        { value: 75, label: "75%" }
    ];

    svg.selectAll(".reference-line")
        .data(referenceLines)
        .enter().append("line")
        .attr("class", "reference-line")
        .attr("x1", margin.left)
        .attr("x2", width - margin.right)
        .attr("y1", d => y(d.value))
        .attr("y2", d => y(d.value))
        .attr("stroke", "#999")
        .attr("opacity", d => 1 - Math.abs(averageValue - d.value) / 100);

    svg.selectAll(".reference-text")
        .data(referenceLines)
        .enter().append("text")
        .attr("class", "reference-text")
        .attr("x", width - margin.right + 5)
        .attr("y", d => y(d.value))
        .attr("dy", "0.35em")
        .text(d => d.label)
        .attr("opacity", d => 1 - Math.abs(averageValue - d.value) / 100);

    // Add title
    svg.append("text")
        .attr("class", "title")
        .attr("x", margin.left)
        .attr("y", margin.top / 2)
        .text(title);

    // Add average percentage text
    svg.append("text")
        .attr("class", "avg-percentage")
        .attr("x", width - margin.right)
        .attr("y", margin.top / 2)
        .attr("fill", colorScale(averageValue))
        .text(`${averageValue.toFixed(2)}%`);



    // Function to resize the graph
    function resizeGraph() {
        const containerWidth = svg.node().parentNode.offsetWidth;
        const containerHeight = Math.min(containerWidth * 0.5, 400);
        svg.attr("width", containerWidth).attr("height", containerHeight);
    }

    // Add event listener for window resize
    window.addEventListener('resize', resizeGraph);
    
    // Initial call to set the correct size
    resizeGraph();
}

// Call the setup function when the DOM is loaded
document.addEventListener('DOMContentLoaded', setupAnalyticsGraphs);

// Add this to your existing navigation code
function switchPage(page) {
    // ... existing code ...

    if (page === 'analytics') {
        if (graphData) {
            createGraphs();
        } else {
            setupAnalyticsGraphs();
        }
    }

    // ... rest of existing code ...
}