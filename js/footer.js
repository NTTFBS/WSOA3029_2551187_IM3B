
const footer = document.createElement('footer');
footer.className = 'footer';

const footerContent = `
    <div class="footer-content">
        <p>© 2024 Worldwide Weather. All rights reserved.</p>
        <p>Accurate Weather Data provided by OpenWeather</p>
    </div>
`;

footer.innerHTML = footerContent;

document.body.appendChild(footer);
