// footer.js

// Dynamically create and append/inject footer content to the document
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

// Add slide-up animation on scroll for visible elements
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

// Smooth scrolling to various sections on home page button clicks
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
