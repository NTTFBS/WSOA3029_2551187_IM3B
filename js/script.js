/* this video (https://www.youtube.com/watch?v=FsDyelH58F0) helped a lot with understanding how to map choropleths and so did (https://plotly.com/javascript/choropleth-maps/#:~:text=How%20to%20make%20a%20D3.js-based%20choropleth%20map%20in%20JavaScript.%20A_) Where I struggled I asked ChatGPT for some help as well */

// script.js
// script.js
document.addEventListener('DOMContentLoaded', function() {
    const navbarHTML = `
        <div data-collapse="medium" data-animation="default" data-duration="400" data-doc-height="1" data-easing="ease" data-easing2="ease" role="banner" class="nav w-nav">
            <div class="nav-inner">
                <div class="nav-logo-wrap">
                    <a href="#" class="brand w-nav-brand"></a>
                </div>
                <div class="nav-menu-wrap">
                    <nav role="navigation" class="nav-menu-2 w-nav-menu">
                        <a href="index.html" class="nav-link w-nav-link" id="home-link">Home</a>
                        <a href="design.html" class="nav-link w-nav-link" id="design-link">Design</a>
                        <a href="theory.html" class="nav-link w-nav-link" id="theory-link">Theory</a>
                        <a href="about.html" class="nav-link w-nav-link" id="about-link">About</a>
                    </nav>
                    <div class="menu-button w-nav-button">
                        <div class="menu-icon w-icon-nav-menu"></div>
                    </div>
                </div>
            </div>
        </div>
    `;
    document.getElementById('navbar').innerHTML = navbarHTML;

 
    const currentPage = window.location.pathname.split('/').pop();

    
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
    });


    if (currentPage === 'index.html' || currentPage === '') {
        document.getElementById('home-link').classList.add('active');
    } else if (currentPage === 'design.html') {
        document.getElementById('design-link').classList.add('active');
    } else if (currentPage === 'theory.html') {
        document.getElementById('theory-link').classList.add('active');
    } else if (currentPage === 'about.html') {
        document.getElementById('about-link').classList.add('active');
    }
});




const mapWidth = 800;
const mapHeight = 500;
const mapTranslateX = -350; 
const mapTranslateY = 50; 

// pretty much everything here will be commented since it was my first time trying these data visualization techniques.

// SVG element that contains the map
const svg = d3.select("#map")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .style("transform", `translate(${mapTranslateX}px, ${mapTranslateY}px)`);

// Define a projection and path generator
const projection = d3.geoOrthographic()
    .scale(200)
    .translate([mapWidth / 2, mapHeight / 2])
    .clipAngle(90);

const path = d3.geoPath().projection(projection);

// color scale for temperature differences
const color = d3.scaleSequential(d3.interpolateCool)
    .domain([0, 40]); 


const tooltip = d3.select("#tooltip");


d3.json("https://d3js.org/world-110m.v1.json").then(world => {
    svg.append("path")
        .datum(topojson.feature(world, world.objects.countries))
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", "rgba(173, 216, 230, 0.6)"); 

    // Ffetching temperature data from OpenWeatherMap API
    const cities = [
        { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
        { name: "New York", lat: 40.7128, lon: -74.0060 },
        { name: "London", lat: 51.5074, lon: -0.1278 },
        { name: "Sydney", lat: -33.8688, lon: 151.2093 }
    ];

    const apiKey = "27d833b58f7ff7cbd9f4e405457fb950"; // need API key for this to work

    Promise.all(cities.map(city => 
        fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                city.temperature = data.main.temp;
                console.log(`City: ${city.name}, Temperature: ${city.temperature}`);
                return city;
            })
            .catch(error => console.error(`Error fetching data for ${city.name}:`, error))
    )).then(updatedCities => {
        // Adds circles for each city
        updatedCities.forEach(city => {
            svg.append("circle")
                .datum(city)
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])
                .attr("r", 5)
                .attr("fill", color(city.temperature))
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`${d.name}<br/>${d.temperature}°C`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");

                    // Updates city name and temperature text
                    d3.select(".city-name").text(d.name);
                    d3.select(".city-temp").text(`${d.temperature}°C`);
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        });

        // drag handler for when globe is rotated
        const drag = d3.drag()
            .on("drag", (event) => {
                const rotate = projection.rotate();
                const k = 0.5; 
                projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
                svg.selectAll("path").attr("d", path);
                svg.selectAll("circle")
                    .attr("cx", d => projection([d.lon, d.lat])[0])
                    .attr("cy", d => projection([d.lon, d.lat])[1]);
            });

        svg.call(drag);

        // actually rotating the globe
        function rotateGlobe() {
            const rotate = projection.rotate();
            projection.rotate([rotate[0] - 0.1, rotate[1]]);
            svg.selectAll("path").attr("d", path);
            svg.selectAll("circle")
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1]);
        }

     
        const rotationInterval = setInterval(rotateGlobe, 50);

     
        svg.on("mousedown", () => {
            clearInterval(rotationInterval);
        });

        // Creating the bar graph
        const barChartWidth = 800;
        const barChartHeight = 400;
        const barChartSvg = d3.select("#bar-chart")
            .append("svg")
            .attr("width", barChartWidth)
            .attr("height", barChartHeight)
            .style("transform", `translate(${mapTranslateX}px, ${mapTranslateY}px)`);

        const x = d3.scaleBand()
            .domain(updatedCities.map(d => d.name))
            .range([0, barChartWidth])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(updatedCities, d => d.temperature)])
            .nice()
            .range([barChartHeight, 0]);

        barChartSvg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${barChartHeight})`)
            .call(d3.axisBottom(x));

        barChartSvg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));

        const bars = barChartSvg.selectAll(".bar")
            .data(updatedCities)
            .enter().append("rect")
            .attr("class", "bar")
            .attr("x", d => x(d.name))
            .attr("y", barChartHeight)
            .attr("width", x.bandwidth())
            .attr("height", 0)
            .attr("fill", d => color(d.temperature))
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.name}<br/>${d.temperature}°C`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");

                
                d3.select(".city-name").text(d.name);
                d3.select(".city-temp").text(`${d.temperature}°C`);
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            });

        // Adds temperature values above the bars
        barChartSvg.selectAll(".label")
            .data(updatedCities)
            .enter().append("text")
            .attr("class", "label")
            .attr("x", d => x(d.name) + x.bandwidth() / 2)
            .attr("y", barChartHeight)
            .attr("dy", "-0.5em")
            .attr("text-anchor", "middle")
            .text(d => `${d.temperature}°C`);

        
        function animateBars() {
            bars.transition()
                .duration(1000)
                .attr("y", d => y(d.temperature))
                .attr("height", d => barChartHeight - y(d.temperature));

            barChartSvg.selectAll(".label")
                .transition()
                .duration(1000)
                .attr("y", d => y(d.temperature) - 5);
        }

      
        function isInView() {
            const rect = document.getElementById("bar-chart").getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
        }

       
        window.addEventListener("scroll", () => {
            if (isInView()) {
                animateBars();
            }
        });
    });
});


function isInView(element) {
    const rect = element.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
}


function addSlideUpAnimation() {
    const elements = document.querySelectorAll('.slide-up');
    elements.forEach(element => {
        if (isInView(element)) {
            element.classList.add('visible');
        }
    });
}


window.addEventListener('scroll', addSlideUpAnimation);


addSlideUpAnimation();


const footer = document.createElement('footer');
footer.className = 'footer';


const footerContent = `
    <div class="footer-content">
        <p>© 2024 2551187. All rights reserved.</p>
        <p>Accurate Weather Data provided by OpenWeather</p>
    </div>
`;


footer.innerHTML = footerContent;


document.body.appendChild(footer);


const exploreButtonHome = document.querySelector('.explore-button');
const choroplethSection = document.getElementById('choropleth-section');


exploreButtonHome.addEventListener('click', (event) => {
    event.preventDefault(); 
    choroplethSection.scrollIntoView({ behavior: 'smooth' }); 
});

const peekButton = document.querySelector('.peek-button');
const designSection = document.getElementById('design-section');


peekButton.addEventListener('click', (event) => {
    event.preventDefault(); 
    designSection.scrollIntoView({ behavior: 'smooth' }); 
});

const exploreButtonTheory = document.querySelector('.read-button');
const theorySection = document.getElementById('theory-section');


exploreButtonTheory.addEventListener('click', (event) => {
    event.preventDefault(); 
    theorySection.scrollIntoView({ behavior: 'smooth' }); 
});

const exploreButtonAbout = document.querySelector('.about-button');
const aboutSection = document.getElementById('about-section');


exploreButtonAbout.addEventListener('click', (event) => {
    event.preventDefault(); 
    aboutSection.scrollIntoView({ behavior: 'smooth' }); 
});



