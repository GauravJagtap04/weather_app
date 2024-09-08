async function getApiKey() {
    try {
      const response = await fetch('/api/weather-proxy');
      const data = await response.json();
      return data.apiKey;
    } catch (error) {
      console.error('Error fetching API key:', error);
    }
}

const weatherLogo = document.getElementById('weather-logo');
const tempOutput = document.getElementById('temperature');
const locationSearched = document.querySelector('.location-searched');
const locationCountry = document.querySelector('.location-country');
const locationDate = document.querySelector('.location-date');
const descMain = document.querySelector('.desc-main');
const descSub = document.querySelector('.desc-sub');
const locationInput = document.getElementById('location-input');
const submitBtn = document.getElementById("submit-btn");
const recentSearch = document.getElementById("recent-search");
const searchContainer = document.getElementById("search-container");
const rightContainer = document.getElementById("right-container");
const weatherIconDiv = document.getElementById("weather-icon-div");
const weatherInfo = document.getElementById("weather-info");

const locationData = JSON.parse(localStorage.getItem("data")) || [];
let currentLocation = {};

const date = new Date();
const formattedDate = date.toLocaleDateString('en-GB', {
  month: 'short', day: '2-digit'
}).replace(/ /g, ' ');

async function fetchWeatherData(city) {
    const apiKey = await getApiKey();

    const geocodeUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${city}&limit=1&appid=${apiKey}`;
    
    try {
        const geocodeResponse = await fetch(geocodeUrl);
        const geocodeData = await geocodeResponse.json();
        if (geocodeData.length === 0) {
            alert("City not found.");
            return false;
        }

        const { lat, lon } = geocodeData[0];
        
        const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();
        
        displayWeatherData(weatherData, city);
        return true;
    } catch (error) {
        console.error("Error fetching weather data: ", error);
        return false;
    }
}

function displayWeatherData(data, city) {
    const temperature = Math.round(data.main.temp) + '°C';
    const description = data.weather[0].description;
    const country = data.sys.country;
    const weatherLogoVal = data.weather[0].icon;

    tempOutput.textContent = temperature;
    locationSearched.textContent = city.charAt(0).toUpperCase() + city.slice(1);
    locationCountry.textContent = country;
    locationDate.textContent = formattedDate;
    descMain.textContent = data.weather[0].main;
    descSub.textContent = description;
    weatherIconDiv.innerHTML = `<img width="30px" height="30px" src="http://openweathermap.org/img/w/${weatherLogoVal}.png" alt="weather-icon" id="weather-logo"></img>`;
}




const addRecentLocation = () => {
    const locationValue = locationInput.value.trim();

    
    const locationObj = {
        id: `${locationValue.toLowerCase().split(" ").join("-")}-${Date.now()}`,
        locVal: locationValue.charAt(0).toUpperCase() + locationValue.slice(1),
    };

    const dataArrIndex = locationData.findIndex((item) => item.id === currentLocation.id);

    if (dataArrIndex === -1) {
        locationData.unshift(locationObj);
    } else {
        locationData[dataArrIndex] = locationObj;
    }
    
    localStorage.setItem("data", JSON.stringify(locationData));

    locationInput.value = "";
    updateOutputRecentLocation();       
};

const updateOutputRecentLocation = () => {    
    if (locationData.length >= 1) {
        recentSearch.style.display = 'block';
        recentSearch.innerHTML = `
            <span>
                Recent search<hr>
            </span>
            <ul id="list"></ul>
        `;

        const list = document.getElementById("list");
        
        locationData.forEach(
            ({id, locVal}) => {
                list.innerHTML += `
                    <li id="${id}" class="recent-location translate" style="position: relative;" onclick="getWeather('${locVal}')">
                        ${locVal} 
                        <img title="Remove" id="delete-location" onclick="removeLocation('${id}')" src="images/x.png" alt="close-icon" width="20px" height="20px" style="padding: 0 5px; margin: 0; position: absolute; right: 0%; top: 50%">
                    </li>
                `;
            }
        );

        
        if(window.innerWidth <= 600) {
            searchContainer.style.height = "100%";
            rightContainer.style.background = "transparent";
            rightContainer.style.boxShadow = "0";
            rightContainer.style.backdropFilter = "none";
            rightContainer.style.borderRadius = "0";
            rightContainer.style.border = "0";
            return;
        }
        else if(window.innerWidth > 600) {
            searchContainer.style.height = "100%";
            rightContainer.style.background = "rgba(184, 184, 184, 0.25)";
            rightContainer.style.boxShadow = "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )";
            rightContainer.style.backdropFilter = "blur( 7px )";
            rightContainer.style.borderRadius = "10px";
            rightContainer.style.border = "1px solid rgba( 255, 255, 255, 0.18 )";
            weatherInfo.style.width = "65%";
            return;
        }
    } else {
        searchContainer.style.height = "fit-content";
        recentSearch.style.display = 'none';
        recentSearch.innerHTML = "";
        rightContainer.style.background = "transparent";
        rightContainer.style.boxShadow = "none";
        rightContainer.style.backdropFilter = "none";
        rightContainer.style.borderRadius = "0";
        rightContainer.style.border = "none";
        weatherInfo.style.width = "97%";
        return;
    }
};

function getWeather(city) {
    fetchWeatherData(city);
}

function removeLocation(locationId) {
    const dataArrIndex = locationData.findIndex(
        (item) => item.id === locationId
    );

    if (dataArrIndex !== -1) {
        locationData.splice(dataArrIndex, 1);
        document.getElementById(locationId).remove();
        localStorage.setItem("data", JSON.stringify(locationData));
    }

    updateOutputRecentLocation();
};



const submit = async () => {
    const city = locationInput.value;
    if (city) {
        const cityFound = await fetchWeatherData(city);
        if (cityFound) {
            addRecentLocation();
            fetchWeatherData(city);
        }
    }

    updateOutputRecentLocation();
};

submitBtn.addEventListener('click', () => {
    submit();
});

locationInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        e.preventDefault();
        submit();
    }   
});

updateOutputRecentLocation();






function getUserLocation() {
    showLoadingScreen();
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(successCallback, errorCallback);
    } else {
        alert("Geolocation is not supported by this browser.");
        hideLoadingScreen();
    }
}

function successCallback(position) {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    fetchWeatherByCoordinates(lat, lon).finally(() => hideLoadingScreen());
}

function errorCallback(error) {
    console.error("Error fetching location: ", error);
    alert("Unable to retrieve your location.");
    hideLoadingScreen();
}

document.addEventListener('DOMContentLoaded', () => {
    getUserLocation();
})

async function fetchWeatherByCoordinates(lat, lon) {
    const apiKey = await getApiKey();

    const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${apiKey}`;
    
    try {
        const weatherResponse = await fetch(weatherUrl);
        const weatherData = await weatherResponse.json();

        const city = weatherData.name; // Get city name from the response
        displayWeatherData(weatherData, city);
    } catch (error) {
        console.error("Error fetching weather data: ", error);
    }
}





const loadingScreen = document.getElementById('loading-screen');

const showLoadingScreen = () => {
    loadingScreen.style.display = 'flex';
}

const hideLoadingScreen = () => {
    loadingScreen.style.display = 'none';
}