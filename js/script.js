document.addEventListener('DOMContentLoaded', function () {
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

    const scrollIndicator = document.getElementById('scroll-indicator');
    const toggleScrollIndicator = () => {
        if (scrollIndicator) {
            if (window.scrollY > 0) {
                scrollIndicator.classList.add('hidden');
            } else {
                scrollIndicator.classList.remove('hidden');
            }
        }
    };

    window.addEventListener('scroll', toggleScrollIndicator);
    toggleScrollIndicator();

    scrollIndicator.addEventListener('click', () => {
        const nextSection = document.querySelector('.section.center:nth-of-type(2)');
        if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
        }
    });

    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    window.onscroll = function() {
        if (document.body.scrollTop > 100 || document.documentElement.scrollTop > 100) {
            scrollToTopBtn.style.display = "block";
        } else {
            scrollToTopBtn.style.display = "none";
        }
    };

    scrollToTopBtn.onclick = function() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    };

    const submitFormButton = document.getElementById('submitForm');

    if (submitFormButton) {
        submitFormButton.addEventListener('click', function (event) {
            event.preventDefault();
            document.querySelectorAll('.error-message').forEach(el => el.textContent = '');
            const successMessage = document.getElementById('formSuccess');
            successMessage.textContent = '';
            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const message = document.getElementById('message').value.trim();
            let valid = true;
            const nameError = document.getElementById('nameError');
            if (!name.match(/^[A-Za-z\s]+$/) || name.length === 0) {
                nameError.textContent = "Name must not be empty and only contain letters and spaces.";
                valid = false;
            }
            const emailError = document.getElementById('emailError');
            if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                emailError.textContent = "Invalid email format.";
                valid = false;
            }
            const phoneError = document.getElementById('phoneError');
            if (!phone.match(/^\d{10}$/)) {
                phoneError.textContent = "Phone number must be 10 digits.";
                valid = false;
            }
            const messageError = document.getElementById('messageError');
            if (message.length < 10 || message.length > 300) {
                messageError.textContent = "Message must be between 10 and 300 characters.";
                valid = false;
            }
            if (valid) {
                successMessage.textContent = "Form submitted successfully!";
                successMessage.style.color = "green";
            }
        });
    }

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

    const modal = document.getElementById("modal");
    const openModalButton = document.getElementById("openModal");
    const closeButton = document.querySelector(".close-button");
    const comments = [];

    openModalButton.onclick = function () {
        modal.style.display = "block";
        displayComments();
    }

    closeButton.onclick = function () {
        modal.style.display = "none";
    }

    window.onclick = function (event) {
        if (event.target === modal) {
            modal.style.display = "none";
        }
    }

    document.getElementById("saveAnnotation").onclick = function () {
        const annotation = document.getElementById("annotation").value;
        if (annotation) {
            comments.push(annotation);
            document.getElementById("annotation").value = '';
            modal.style.display = "none";
            displayComments();
            updateLatestComment(annotation);
        } else {
            alert("Please enter a comment before saving.");
        }
    };

    function displayComments() {
        const commentsList = document.getElementById("commentsList");
        commentsList.innerHTML = '';
        comments.forEach(comment => {
            const li = document.createElement("li");
            li.textContent = comment;
            commentsList.appendChild(li);
        });
    }

    function updateLatestComment(comment) {
        const latestCommentBox = document.getElementById("commentDisplay");
        latestCommentBox.textContent = `Latest Comment: ${comment.length > 50 ? comment.substring(0, 50) + "..." : comment}`;
    }
});

const mapWidth = 800;
const mapHeight = 500;
const mapTranslateX = -350; 
const mapTranslateY = 50; 
const barTranslateX = -300; 
const barTranslateY = 50; 

const svg = d3.select("#map")
    .append("svg")
    .attr("width", mapWidth)
    .attr("height", mapHeight)
    .style("transform", `translate(${mapTranslateX}px, ${mapTranslateY}px)`);

const projection = d3.geoOrthographic()
    .scale(200)
    .translate([mapWidth / 2, mapHeight / 2]);

const path = d3.geoPath().projection(projection);
const zoomScale = d3.scaleLinear()
    .domain([1, 10])
    .range([200, 1000]);

const color = d3.scaleSequential(d3.interpolateCool)
    .domain([0, 40]);

const tooltip = d3.select("#tooltip");

d3.json("https://d3js.org/world-110m.v1.json").then(world => {
    svg.append("path")
        .datum(topojson.feature(world, world.objects.countries))
        .attr("d", path)
        .attr("class", "country")
        .attr("fill", "rgba(173, 216, 230, 0.6)"); 

    const cities = [
        { name: "Tokyo", lat: 35.6895, lon: 139.6917 },
        { name: "New York", lat: 40.7128, lon: -74.0060 },
        { name: "London", lat: 51.5074, lon: -0.1278 },
        { name: "Sydney", lat: -33.8688, lon: 151.2093 },
        { name: "Paris", lat: 48.8566, lon: 2.3522 },
        { name: "Moscow", lat: 55.7558, lon: 37.6173 },
        { name: "Dubai", lat: 25.276987, lon: 55.296249 },
        { name: "Rio de Janeiro", lat: -22.9068, lon: -43.1729 },
        { name: "Cairo", lat: 30.0444, lon: 31.2357 }
    ];

    const apiKey = "27d833b58f7ff7cbd9f4e405457fb950";

    Promise.all(cities.map(city => 
        fetch(`https://api.openweathermap.org/data/2.5/forecast?lat=${city.lat}&lon=${city.lon}&units=metric&appid=${apiKey}`)
            .then(response => response.json())
            .then(data => {
                city.temperatures = data.list.map(entry => ({
                    date: new Date(entry.dt * 1000),
                    temperature: entry.main.temp
                }));
                return city;
            })
            .catch(error => console.error(`Error fetching data for ${city.name}:`, error))
    )).then(updatedCities => {
        updatedCities.forEach(city => {
            svg.append("circle")
                .datum(city)
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1])
                .attr("r", 5)
                .attr("fill", color(city.temperatures[0].temperature))
                .on("mouseover", (event, d) => {
                    tooltip.transition()
                        .duration(200)
                        .style("opacity", .9);
                    tooltip.html(`${d.name}<br/>${d.temperatures[0].temperature}°C`)
                        .style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");

                    d3.select(".city-name").text(d.name);
                    d3.select(".city-temp").text(`${d.temperatures[0].temperature}°C`);
                })
                .on("mousemove", (event) => {
                    tooltip.style("left", (event.pageX + 5) + "px")
                        .style("top", (event.pageY - 28) + "px");
                })
                .on("mouseout", () => {
                    tooltip.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on("click", (event, d) => {
                    const lineChartSection = document.querySelector('.line-chart-wrapper');
                    const sectionPosition = lineChartSection.getBoundingClientRect().top + window.scrollY;
                    const offset = 50;
                    const targetPosition = sectionPosition - offset;
                    window.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    const cityFilter = d3.select("#city-filter");
                    cityFilter.property("value", d.name);
                    cityFilter.dispatch("change");
                });
        });

        createLineChart(updatedCities);

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

        d3.select("#zoom-slider").on("input", function() {
            const zoomLevel = this.value;
            const choroplethBounds = svg.node().getBoundingClientRect();

            const maxWidth = Math.max(choroplethBounds.width, choroplethBounds.height);
            const maxHeight = maxWidth;

            const desiredGlowSize = zoomScale(zoomLevel) * 2;
            const glowSize = Math.min(desiredGlowSize, maxWidth);

            if (zoomLevel >= 10) {
                d3.select(".glow-background")
                    .style("width", `${choroplethBounds.width}px`)
                    .style("height", `${choroplethBounds.height}px`)
                    .style("border-radius", "0");
            } else {
                d3.select(".glow-background")
                    .style("width", `${glowSize}px`)
                    .style("height", `${glowSize}px`)
                    .style("border-radius", "50%");
            }

            projection.scale(zoomScale(zoomLevel));
            svg.selectAll("path").attr("d", path);
            svg.selectAll("circle")
                .attr("cx", d => projection([d.lon, d.lat])[0])
                .attr("cy", d => projection([d.lon, d.lat])[1]);
        });

        const barChartWidth = 800;
        const barChartHeight = 500;
        const barChartSvg = d3.select("#bar-chart")
            .append("svg")
            .attr("width", barChartWidth)
            .attr("height", barChartHeight + 100)
            .style("transform", `translate(${barTranslateX}px, ${barTranslateY}px)`);

        const y = d3.scaleLinear()
            .domain([
                d3.min(updatedCities, d => d3.min(d.temperatures, t => t.temperature)) - 10, 
                d3.max(updatedCities, d => d.temperatures[0].temperature)
            ])
            .nice()
            .range([barChartHeight, 0]);

        const x = d3.scaleBand()
            .domain(updatedCities.map(d => d.name))
            .range([0, barChartWidth])
            .padding(0.1);

        barChartSvg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${barChartHeight})`)
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", "12px")
            .attr("transform", "translate(0, 0)rotate(-30)")
            .style("text-anchor", "end");

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
            .attr("fill", d => color(d.temperatures[0].temperature))
            .attr("height", 0)
            .attr("opacity", 0)
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.name}<br/>${d.temperatures[0].temperature}°C`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .on("click", (event, d) => {
                const lineChartSection = document.querySelector('#line-chart');
                const sectionPosition = lineChartSection.getBoundingClientRect().top + window.scrollY;
                const offset = 50;
                const targetPosition = sectionPosition - offset;

                window.scrollTo({ top: targetPosition, behavior: 'smooth' });

                const cityFilter = d3.select("#city-filter");
                cityFilter.property("value", d.name);
                cityFilter.dispatch("change");
            });

        barChartSvg.selectAll(".label")
            .data(updatedCities)
            .enter().append("text")
            .attr("class", "label")
            .attr("x", d => x(d.name) + x.bandwidth() / 2)
            .attr("y", barChartHeight)
            .attr("dy", "-0.5em")
            .attr("text-anchor", "middle")
            .text(d => `${d.temperatures[0].temperature}°C`);

        function animateBars() {
            bars.transition()
                .duration(1000)
                .attr("y", d => {
                    const barHeight = barChartHeight - y(d.temperatures[0].temperature);
                    return Math.max(y(d.temperatures[0].temperature), barChartHeight - barHeight);
                })
                .attr("height", d => {
                    const barHeight = barChartHeight - y(d.temperatures[0].temperature);
                    return Math.min(barHeight, barChartHeight);
                })
                .attr("opacity", 1);

            barChartSvg.selectAll(".label")
                .transition()
                .duration(1000)
                .attr("y", d => Math.max(y(d.temperatures[0].temperature) - 5, 0));
        }

        const barChartInView = () => {
            const rect = document.getElementById("bar-chart").getBoundingClientRect();
            return rect.top >= 0 && rect.bottom <= window.innerHeight;
        };

        window.addEventListener("scroll", () => {
            if (barChartInView()) {
                animateBars();
            }
        });

        const barCityFilter = d3.select("#bar-city-filter");
        barCityFilter.selectAll("option")
            .data(updatedCities.concat({ name: "All cities" }))
            .enter()
            .append("option")
            .attr("value", d => d.name)
            .text(d => d.name);

        barCityFilter.on("change", function() {
            const selectedCityName = this.value;

            bars.transition().duration(500).attr("opacity", d => {
                return selectedCityName === "All cities" || d.name === selectedCityName ? 1 : 0;
            });

            bars.transition().duration(500).attr("y", d => {
                if (selectedCityName === "All cities" || d.name === selectedCityName) {
                    return y(d.temperatures[0].temperature);
                }
                return barChartHeight;
            }).attr("height", d => {
                return (selectedCityName === "All cities" || d.name === selectedCityName) 
                        ? barChartHeight - y(d.temperatures[0].temperature) 
                        : 0;
            });

            barChartSvg.selectAll(".label")
                .transition()
                .duration(500)
                .attr("y", d => {
                    return (selectedCityName === "All cities" || d.name === selectedCityName)
                        ? Math.max(y(d.temperatures[0].temperature) - 5, 0)
                        : barChartHeight;
                });
        });

        const secondLineChartSvg = d3.select("#second-line-chart")
            .append("svg")
            .attr("width", '100%')
            .attr("height", 400)
            .attr("viewBox", `0 0 ${barChartWidth} 400`)
            .append("g")
            .attr("transform", `translate(0,0)`);

        function renderSecondLineChart(selectedCities) {
            const lastWeekTemperatures = selectedCities.flatMap(city => 
                city.temperatures.filter(temp => {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return temp.date >= sevenDaysAgo;
                }).map(temp => ({ ...temp, cityName: city.name }))
            );

            const x = d3.scaleTime().range([0, barChartWidth]);

            const y = d3.scaleLinear()
                .domain([d3.min(lastWeekTemperatures, d => d.temperature) - 10, d3.max(lastWeekTemperatures, d => d.temperature)])
                .range([400, 0]);

            x.domain(d3.extent(lastWeekTemperatures, d => d.date));

            secondLineChartSvg.selectAll("*").remove();

            const lineGroups = secondLineChartSvg.selectAll(".line-group")
                .data(selectedCities)
                .enter()
                .append("g")
                .attr("class", "line-group");

            lineGroups.append("path")
                .datum(d => d.temperatures.filter(temp => {
                    const sevenDaysAgo = new Date();
                    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                    return temp.date >= sevenDaysAgo;
                }))
                .attr("class", "line")
                .attr("d", d3.line()
                    .x(d => x(d.date))
                    .y(d => y(d.temperature)))
                .attr("fill", "none")
                .attr("stroke", (d) => cityColors(d.name))
                .attr("stroke-width", 2)
                .attr("opacity", 0)
                .transition() 
                .duration(1000)
                .attr("opacity", 1);

            const secondLineCityFilter = d3.select("#city-filter");
            secondLineCityFilter.on("change", function() {
                const selectedCityName = this.value;
                const filteredCityData = selectedCityName === "All cities" ? updatedCities : [updatedCities.find(city => city.name === selectedCityName)];
                renderSecondLineChart(filteredCityData);
            });
        }
    });
});

let updatedCities = [];

function createLineChart(cities) {
    updatedCities = cities; 
        
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const lineChartWidth = document.getElementById('line-chart').clientWidth - margin.left - margin.right;
    const lineChartHeight = 400 - margin.top - margin.bottom;

    d3.select("#line-chart").selectAll("*").remove();
    
    const cityFilter = d3.select("#city-filter");
    cityFilter.selectAll("option")
        .data(cities.concat({ name: "All cities" }))
        .enter()
        .append("option")
        .attr("value", d => d.name)
        .text(d => d.name);
    
    cityFilter.property("value", "All cities");

    const lineChartSvg = d3.select("#line-chart")
        .append("svg")
        .attr("width", '100%')
        .attr("height", lineChartHeight + margin.top + margin.bottom)
        .attr("viewBox", `0 0 ${lineChartWidth + margin.left + margin.right} ${lineChartHeight + margin.top + margin.bottom}`)
        .append("g")
        .attr("transform", `translate(${margin.left},${margin.top})`);

    const cityColors = d3.scaleOrdinal(d3.schemeAccent).domain(cities.map(city => city.name));

    const updateLegend = (selectedCities) => {
        const legend = d3.select("#legend").style("display", "flex").style("flex-direction", "column").style("margin-left", "10px");
        legend.selectAll("*").remove();
        selectedCities.forEach(city => {
            legend.append("div")
                .style("display", "flex")
                .style("align-items", "center")
                .style("margin-bottom", "5px")
                .html(`<span style="display:inline-block; width: 12px; height: 12px; background-color: ${cityColors(city.name)}; margin-right: 5px;"></span>${city.name}`);
        });
    };

    const renderChart = () => {
        const selectedCityName = cityFilter.property("value");

        const selectedCities = selectedCityName === "All cities" 
            ? updatedCities 
            : updatedCities.filter(city => city.name === selectedCityName);

        updateLegend(selectedCities);

        const lastWeekTemperatures = selectedCities.flatMap(city => 
            city.temperatures.filter(temp => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return temp.date >= sevenDaysAgo;
            }).map(temp => ({ ...temp, cityName: city.name }))
        );

        const x = d3.scaleTime().range([0, lineChartWidth]);
        const y = d3.scaleLinear()
            .domain([d3.min(lastWeekTemperatures, d => d.temperature) - 10, d3.max(lastWeekTemperatures, d => d.temperature)])
            .range([lineChartHeight, 0]);

        x.domain(d3.extent(lastWeekTemperatures, d => d.date));

        lineChartSvg.selectAll(".line").remove(); 
        lineChartSvg.selectAll(".dot").remove(); 

        const lineGroups = lineChartSvg.selectAll(".line-group")
            .data(selectedCities)
            .enter()
            .append("g")
            .attr("class", "line-group");

        lineGroups.append("path")
            .datum(d => d.temperatures.filter(temp => {
                const sevenDaysAgo = new Date();
                sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
                return temp.date >= sevenDaysAgo;
            }))
            .attr("class", "line")
            .attr("d", d3.line()
                .x(d => x(d.date))
                .y(d => y(d.temperature)))
            .attr("fill", "none")
            .attr("stroke", (d) => cityColors(d.name))
            .attr("stroke-width", 2)
            .attr("opacity", 0)
            .transition() 
            .duration(1000)
            .attr("opacity", 1);

        lineChartSvg.selectAll(".dot")
            .data(lastWeekTemperatures)
            .enter().append("circle")
            .attr("class", "dot")
            .attr("cx", d => x(d.date))
            .attr("cy", d => y(d.temperature))
            .attr("r", 4)
            .attr("fill", d => cityColors(d.cityName))
            .attr("opacity", 0)
            .on("mouseover", (event, d) => {
                tooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                tooltip.html(`${d.cityName}<br/>${d.temperature}°C<br/>${d.date.toLocaleString()}`)
                    .style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mousemove", (event) => {
                tooltip.style("left", (event.pageX + 5) + "px")
                    .style("top", (event.pageY - 28) + "px");
            })
            .on("mouseout", () => {
                tooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
            })
            .transition() 
            .duration(1000)
            .attr("opacity", 1);

        lineChartSvg.selectAll(".x-axis").remove();
        lineChartSvg.selectAll(".y-axis").remove();

        lineChartSvg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${lineChartHeight})`)
            .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%Y-%m-%d %H:%M")));

        lineChartSvg.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(y));
    }

    renderChart();

    cityFilter.on("change", renderChart);
};

function redrawLineChart() {
    createLineChart(updatedCities);
}

window.addEventListener('resize', redrawLineChart);

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
