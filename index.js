const container = document.querySelector(".container");
const search = document.querySelector(".search-box button");
const weatherBox = document.querySelector(".weather-box");
const weatherDetails = document.querySelector(".weather-details");
const error404 = document.querySelector(".not-found");
const skydivingInfo = document.querySelector(".skydiving-info");

// Helper function to convert wind degrees to cardinal direction
function degreesToCardinal(degrees) {
    const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
    const index = Math.round(degrees / 22.5) % 16;
    return directions[index];
}

// Helper function to estimate wind at altitude based on surface wind
// This is a simplified model - real atmospheric data would be more accurate
function estimateWindAtAltitude(surfaceSpeed, surfaceDeg, altitudeMeters) {
    // Wind generally increases with altitude (power law approximation)
    // Also experiences slight directional shift due to Coriolis effect
    const altitudeFactor = Math.pow(altitudeMeters / 10, 0.15); // Power law coefficient
    const estimatedSpeed = surfaceSpeed * altitudeFactor;

    // Slight directional shift (veering) with altitude in Northern Hemisphere
    // Typically 10-30 degrees, we'll use a conservative estimate
    const directionShift = Math.min(altitudeMeters / 200, 25);
    const estimatedDeg = (surfaceDeg + directionShift) % 360;

    return {
        speed: Math.round(estimatedSpeed * 10) / 10,
        deg: Math.round(estimatedDeg),
        cardinal: degreesToCardinal(estimatedDeg)
    };
}

// Function to get skydiving recommendation
function getSkydivingRecommendation(surfaceWind, cloudCover) {
    let recommendation = '';
    let safetyLevel = 'good';

    if (surfaceWind > 25) {
        recommendation = '⚠️ High winds at surface - Not recommended for jumping';
        safetyLevel = 'dangerous';
    } else if (surfaceWind > 20) {
        recommendation = '⚠️ Strong winds - Only for experienced skydivers';
        safetyLevel = 'caution';
    } else if (surfaceWind > 15) {
        recommendation = '⚠️ Moderate winds - Use caution, check with DZO';
        safetyLevel = 'caution';
    } else if (cloudCover > 80) {
        recommendation = '☁️ Heavy cloud coverage - Check visibility and cloud ceiling';
        safetyLevel = 'caution';
    } else if (cloudCover > 50) {
        recommendation = '🌤️ Moderate clouds - Good conditions, monitor cloud ceiling';
        safetyLevel = 'good';
    } else if (surfaceWind < 10) {
        recommendation = '✅ Excellent conditions for skydiving!';
        safetyLevel = 'excellent';
    } else {
        recommendation = '✅ Good conditions for skydiving';
        safetyLevel = 'good';
    }

    return { recommendation, safetyLevel };
}

search.addEventListener("click", () => {

    const APIkey = 'd5ff17d2f6562db9b14ead9ef3ef479b';
    const city = document.querySelector(".search-box input").value;

    if (city === '')
        return;

    fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${APIkey}&units=metric&lang=en`)
        .then(response => response.json())
        .then(json => {

            if (json.cod === '404') {
                container.style.height = '400px';
                weatherBox.style.display = 'none';
                weatherDetails.style.display = 'none';
                skydivingInfo.style.display = 'none';
                error404.style.display = 'block';
                error404.classList.add("fadeIn");
                return;
            }

            error404.style.display = 'none';
            error404.classList.remove("fadeIn");

            const image = document.querySelector(".weather-box img");
            const temperature = document.querySelector(".weather-box .temperature");
            const description = document.querySelector(".weather-box .description");
            const humidity = document.querySelector(".weather-details .humidity span");
            const wind = document.querySelector(".weather-details .wind span");
            const windDirection = document.querySelector(".weather-details .wind-direction span");
            const clouds = document.querySelector(".weather-details .clouds span");

            switch (json.weather[0].main) {
                case 'Clear':
                    image.src = 'images/clear.png';
                    break;

                case 'Rain':
                    image.src = 'images/rain.png';
                    break;

                case 'Snow':
                    image.src = 'images/snow.png';
                    break;

                case 'Clouds':
                    image.src = 'images/cloud.png';
                    break;

                case 'Haze':
                    image.src = 'images/mist.png';
                    break;

                default:
                    image.src = '';
            }

            const surfaceWindSpeed = json.wind.speed * 3.6; // Convert m/s to km/h
            const surfaceWindDeg = json.wind.deg || 0;
            const cloudCoverage = json.clouds.all;

            temperature.innerHTML = `${parseInt(json.main.temp)}<span>°C</span>`;
            description.innerHTML = `${json.weather[0].description}`;
            humidity.innerHTML = `${json.main.humidity}%`;
            wind.innerHTML = `${Math.round(surfaceWindSpeed)} km/h`;
            windDirection.innerHTML = `${surfaceWindDeg}° (${degreesToCardinal(surfaceWindDeg)})`;
            clouds.innerHTML = `${cloudCoverage}%`;

            // Calculate winds at different altitudes
            const altitudes = [
                { meters: 10, label: 'Surface' },
                { meters: 500, label: '1,500 ft (500m)' },
                { meters: 1000, label: '3,000 ft (1000m)' },
                { meters: 1500, label: '5,000 ft (1500m)' },
                { meters: 3000, label: '10,000 ft (3000m)' },
                { meters: 4000, label: '13,000 ft (4000m)' }
            ];

            const altitudeItems = document.querySelectorAll(".altitude-item");
            altitudes.forEach((alt, index) => {
                const windData = estimateWindAtAltitude(surfaceWindSpeed, surfaceWindDeg, alt.meters);
                const speedSpan = altitudeItems[index].querySelector(".wind-speed-alt");
                const dirSpan = altitudeItems[index].querySelector(".wind-dir-alt");

                speedSpan.innerHTML = `${windData.speed} km/h`;
                dirSpan.innerHTML = `${windData.cardinal} (${windData.deg}°)`;
            });

            // Set skydiving recommendation
            const recommendationData = getSkydivingRecommendation(surfaceWindSpeed, cloudCoverage);
            const recommendationText = document.querySelector(".recommendation-text");
            recommendationText.innerHTML = recommendationData.recommendation;
            recommendationText.className = `recommendation-text ${recommendationData.safetyLevel}`;

            weatherBox.style.display = 'block';
            weatherDetails.style.display = 'flex';
            skydivingInfo.style.display = 'block';
            weatherBox.classList.add("fadeIn");
            weatherDetails.classList.add("fadeIn");
            skydivingInfo.classList.add("fadeIn");
            container.style.height = '1100px';
        });
});