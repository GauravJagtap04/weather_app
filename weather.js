const apiKey = 'f5149f257c40256f290b73d9f830fa24';

const date = new Date();
const formattedDate = date.toLocaleDateString('en-GB', {
  month: 'short', day: '2-digit'
}).replace(/ /g, ' ');

// Fetch weather data based on the city
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

    document.getElementById('temperature').textContent = temperature;
    document.querySelector('.location-searched').textContent = city.charAt(0).toUpperCase() + city.slice(1);
    document.querySelector('.location-country').textContent = country;
    document.querySelector('.desc-main').textContent = data.weather[0].main;
    document.querySelector('.desc-sub').textContent = description;
    document.querySelector('.location-date').textContent = formattedDate;
}

document.getElementById('submit-btn').addEventListener('click', () => {
    const city = document.getElementById('location-input').value;
    if (city) {
        fetchWeatherData(city);
    }
});



// const apiKey = 'f5149f257c40256f290b73d9f830fa24';
// const apiUrl = 'https://api.openweathermap.org/data/2.5/weather';

// const locationInput = document.getElementById("location-input");
// const submitBtn = document.getElementById("submit-btn");
// const temperature = document.getElementById("temperature");
// const locationSearched = document.querySelector(".location-searched");
// const locationCountry = document.querySelector(".location-country");
// const locationDate = document.querySelector(".location-date");
// const descMain = document.querySelector(".desc-main");
// const descSub = document.querySelector(".desc-sub");
// const recentSearch = document.getElementById("recent-search");
// const recentSearchList = document.getElementById("list");

// submitBtn.addEventListener('click', () => {
//     const location = locationInput.value;

//     if (location) {
//         fetchWeather(location);
//     }
// });

// function fetchWeather(location) {
//     const url = '${apiUrl}?q=${location}&appid=${apiKey}&units=metric';

//     fetch(url)
//         .then(response => response.json())
//         .then(data => {
//             locationSearched.textContent = data.name;
//             temperature.textContent = '${Math.round(data.main.temp)}°C';
//             descMain.textContent = 'data.weather[0].description';
//         })
//         .catch(error => {
//             console.error('Error fetching weather data: ', error);
//         });
// }