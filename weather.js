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
const dnIcon = document.getElementById("dn-icon");
const time = document.getElementById("time");

const locationData = JSON.parse(localStorage.getItem("data")) || [];
let currentLocation = {};

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
    const weatherId = data.weather[0].main;
    const weatherIconClass = getWeatherIcon(weatherId);

    const timestamp = data.dt;
    const timezoneOffset = data.timezone;
    const utcTime = timestamp * 1000;

    const utcDate = new Date(utcTime);

    const localTime = new Date(utcDate.getTime() + (timezoneOffset * 1000));


    const formattedDate = localTime.toLocaleDateString('en-GB', {
        month: 'short',
        day: '2-digit'
    }).replace(/ /g, ' ');

    const formattedTime = localTime.toLocaleTimeString('en-GB', {
        hour: '2-digit',
        minute: '2-digit'
    }).replace(/ /g, ' ');    

    const hours = localTime.getHours();
    const isDay = hours >= 6 && hours < 18;

    if (isDay) {
        dnIcon.classList.remove('fa-moon');
        dnIcon.classList.add('fa-sun');
    } else {
        dnIcon.classList.remove('fa-sun');
        dnIcon.classList.add('fa-moon');
    }

    tempOutput.textContent = temperature;
    locationSearched.textContent = city.charAt(0).toUpperCase() + city.slice(1);
    locationCountry.textContent = country;
    locationDate.textContent = formattedDate;
    time.textContent = formattedTime;
    descMain.textContent = data.weather[0].main;
    descSub.textContent = description;
    weatherIconDiv.innerHTML = `<i class="fa-solid ${weatherIconClass}" style="font-size:30px;"></i>`;
    setWeatherBackground(weatherId);
}





function setWeatherBackground(weatherId) {
    const gradientMapping = {
        "Thunderstorm": "#00000d, #b7cdd5",
        "Drizzle": "#60717d, #ddcec0",
        "Rain": "#3b444b, #f9f3e5",
        "Snow": "#959a9d, #edefe9",
        "Clear": "#4286c6, #f3cba3",
        "Clouds": "#bdc3c7, #2c3e50",
        "Mist": "#5b6e7a, #ddd8ca",
        "Fog": "#333d47, #b8c6cd",
        "Tornado": "#0e121b, #a3b8c1"
    };

    const backgroundImageMapping = {
        "Thunderstorm": "url('images/bg/thunderstorm.jpeg')",
        "Drizzle": "url('images/bg/drizzle.jpeg')",
        "Rain": "url('images/bg/rain.jpeg')",
        "Snow": "url('images/bg/snow.jpeg')",
        "Clear": "url('images/bg/clear.jpg')",
        "Clouds": "url('images/bg/clouds.jpeg')",
        "Mist": "url('images/bg/mist.jpeg')",
        "Fog": "url('images/bg/fog.jpeg')",
        "Tornado": "url('images/bg/tornado.jpeg')"
    };

    const gradient = gradientMapping[weatherId] || "#1c92d2, #f2fcfe";
    const backgroundImage = backgroundImageMapping[weatherId] || "url('images/bg/clouds.jpeg')";

    document.getElementById('main').style.background = `linear-gradient(${gradient})`;
    document.getElementById('container').style.backgroundImage = backgroundImage;
}




const getWeatherIcon = weatherId => {
    const weatherMapping = {
        "Thunderstorm": "fa-cloud-bolt",
        "Drizzle": "fa-cloud-rain",
        "Rain": "fa-cloud-showers-heavy",
        "Snow": "fa-snowflake",
        "Clear": "fa-sun",
        "Clouds": "fa-cloud",
        "Mist": "fa-smog",
        "Smoke": "fa-smog",
        "Haze": "fa-smog",
        "Dust": "fa-wind",
        "Fog": "fa-smog",
        "Sand": "fa-wind",
        "Ash": "fa-smog",
        "Squall": "fa-cloud-showers-heavy",
        "Tornado": "fa-tornado"
    };
    return weatherMapping[weatherId] || "fa-cloud";
};

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

        
        if(window.innerWidth <= 728) {
            searchContainer.style.height = "100%";
            weatherInfo.style.width = "100%";
            rightContainer.style.background = "transparent";
            rightContainer.style.boxShadow = "0";
            rightContainer.style.backdropFilter = "none";
            rightContainer.style.borderRadius = "0";
            rightContainer.style.border = "0";
            time.style.left = "0";
            time.style.top = "50px";
            return;
        }
        else if(window.innerWidth > 728) {
            searchContainer.style.height = "100%";
            rightContainer.style.background = "rgba(184, 184, 184, 0.25)";
            rightContainer.style.boxShadow = "0 8px 32px 0 rgba( 31, 38, 135, 0.37 )";
            rightContainer.style.backdropFilter = "blur( 7px )";
            rightContainer.style.borderRadius = "10px";
            rightContainer.style.border = "1px solid rgba( 255, 255, 255, 0.18 )";
            weatherInfo.style.width = "fit-content";
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
        time.style.left = "0";
        time.style.top = "50px";
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