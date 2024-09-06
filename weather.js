const apiKey = config.SECRET_KEY;



const tempOutput = document.getElementById('temperature');
const locationSearched = document.querySelector('.location-searched');
const locationCountry = document.querySelector('.location-country');
const locationDate = document.querySelector('.location-date');
const descMain = document.querySelector('.desc-main');
const descSub = document.querySelector('.desc-sub');

const locationInput = document.getElementById('location-input');


const date = new Date();
const formattedDate = date.toLocaleDateString('en-GB', {
  month: 'short', day: '2-digit'
}).replace(/ /g, ' ');

async function fetchWeatherData(city) {
    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    
    try {
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.length === 0) {
            alert("City not found.");
            return;
        }

        const { lat, lon } = geocodeData[0];
        
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        displayWeatherData(weatherData, city);
    } catch (error) {
        console.error("Error fetching weather data: ", error);
    }
}

function displayWeatherData(data, city) {
    const temperature = Math.round(data.main.temp) + '°C';
    const description = data.weather[0].description;
    const country = data.sys.country;

    tempOutput.textContent = temperature;
    locationSearched.textContent = city.charAt(0).toUpperCase() + city.slice(1);
    locationCountry.textContent = country;
    locationDate.textContent = formattedDate;
    descMain.textContent = data.weather[0].main;
    descSub.textContent = description;
}



document.getElementById('submit-btn').addEventListener('click', () => {
    const city = locationInput.value;
    if (city) {
        fetchWeatherData(city);
    }
});





let currentLocation = {};


const recentLocationValue = recentLocation.valuex;

recentLocation.addEventListener('click', () => {
    console.log(recentLocation);
})