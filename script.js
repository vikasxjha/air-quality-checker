/**
 * Air Quality Checker - Interactive Web Application
 *
 * @author Vikas Jha
 * @version 1.0.0
 * @date August 2025
 * @description A responsive web application that checks air quality by Indian pincode
 *              and provides health recommendations based on current pollution levels.
 *
 * Data Sources:
 * - Air Quality: IQAir AirVisual API (https://www.iqair.com/air-pollution-data-api)
 * - Location Data: Indian Postal Pincode API (https://api.postalpincode.in)
 * - Health Guidelines: American Lung Association (https://www.lung.org/clean-air/outdoors/10-tips-to-protect-yourself)
 *
 * Technologies:
 * - Vanilla JavaScript (ES6+)
 * - Bootstrap 5 for responsive design
 * - Font Awesome for icons
 * - CSS3 with animations and transitions
 *
 * Copyright (c) 2025 Vikas Jha. All rights reserved.
 */

// Air Quality Checker JavaScript

// DOM Elements
const pincodeInput = document.getElementById("pincodeInput");
const checkButton = document.getElementById("checkButton");
const buttonText = document.getElementById("buttonText");
const loadingSpinner = document.getElementById("loadingSpinner");
const errorAlert = document.getElementById("errorAlert");
const errorMessage = document.getElementById("errorMessage");
const resultsCard = document.getElementById("resultsCard");
const resetButton = document.getElementById("resetButton");

// Result elements
const moodBackground = document.getElementById("moodBackground");
const moodCharacter = document.getElementById("moodCharacter");
const aqiStatus = document.getElementById("aqiStatus");
const locationInfo = document.getElementById("locationInfo");
const aqiValue = document.getElementById("aqiValue");
const mainPollutant = document.getElementById("mainPollutant");
const temperature = document.getElementById("temperature");
const humidity = document.getElementById("humidity");
const windSpeed = document.getElementById("windSpeed");

// Health recommendations elements
const healthRecommendations = document.getElementById("healthRecommendations");
const healthTitle = document.getElementById("healthTitle");
const healthMessage = document.getElementById("healthMessage");
const healthMessageText = document.getElementById("healthMessageText");
const healthTipsList = document.getElementById("healthTipsList");

// API Configuration
const PINCODE_API_BASE = "https://api.postalpincode.in/pincode/";
const AIR_QUALITY_API_BASE = "http://api.airvisual.com/v2/city";
const AIR_QUALITY_API_KEY = "YOUR_API_KEY_HERE"; // You'll need to get this from IQAir

// Health recommendations from American Lung Association
const HEALTH_RECOMMENDATIONS = {
  good: {
    title: "Excellent Air Quality!",
    message:
      "Perfect conditions for all outdoor activities. Air quality is satisfactory for all groups.",
    tips: [
      "✅ Enjoy all outdoor activities and exercise",
      "🏃‍♂️ Great time for jogging, cycling, and outdoor sports",
      "🪟 Open windows for natural ventilation",
      "👨‍👩‍👧‍👦 Safe for children and sensitive individuals to play outside",
      "🌱 Consider walking or biking instead of driving",
    ],
    color: "success",
  },
  moderate: {
    title: "Take Precautions",
    message:
      "Air quality is acceptable for most people, but sensitive individuals should be cautious.",
    tips: [
      "📱 Check daily air pollution forecasts before outdoor activities",
      "🏋️‍♀️ Consider moving intense workouts indoors if you're sensitive",
      "🚗 Avoid exercising near high-traffic areas and busy highways",
      "👶 Limit outdoor time for children with asthma or respiratory conditions",
      "⚡ Use less energy at home to help reduce overall air pollution",
      "🚌 Use public transportation, walk, bike or carpool when possible",
    ],
    color: "warning",
  },
  unhealthy: {
    title: "⚠️ Protect Your Health",
    message:
      "Air quality is unhealthy. Everyone should limit outdoor exposure and take protective measures.",
    tips: [
      "🚫 Avoid exercising outdoors - move all workouts indoors",
      "🏠 Stay indoors with windows and doors closed",
      "😷 Wear N95 or P100 masks when going outside if necessary",
      "🚌 Use public transportation instead of walking or biking",
      "💨 Use air purifiers indoors if available",
      "🚭 Don't burn wood, trash, or use fireplaces",
      "⚡ Reduce energy use to help improve air quality",
      "🏥 Contact your doctor if you experience breathing difficulties",
      "👥 Keep children and elderly indoors as much as possible",
      "🪟 Seal gaps around doors and windows to prevent outdoor air from coming inside",
    ],
    color: "danger",
  },
};

// Event Listeners
pincodeInput.addEventListener("keypress", function (e) {
  if (e.key === "Enter") {
    checkAirQuality();
  }
});

pincodeInput.addEventListener("input", function (e) {
  // Only allow numbers and limit to 6 digits
  let value = e.target.value.replace(/[^0-9]/g, "");

  // Limit to 6 digits
  if (value.length > 6) {
    value = value.slice(0, 6);
  }

  e.target.value = value;

  // Clear any existing errors when user starts typing
  hideError();
  pincodeInput.classList.remove("is-invalid");

  // Provide real-time feedback
  if (value.length > 0) {
    updateInputFeedback(value);
  } else {
    clearInputFeedback();
  }
});

// Provide real-time input feedback
function updateInputFeedback(value) {
  const feedbackElement = document.querySelector(".form-text");

  if (value.length < 6) {
    feedbackElement.textContent = `Enter ${6 - value.length} more digit${
      6 - value.length !== 1 ? "s" : ""
    }`;
    feedbackElement.className = "form-text text-muted";
  } else if (value.length === 6) {
    // Quick validation check
    if (isInvalidPincodePattern(value)) {
      feedbackElement.textContent = "This pincode pattern looks invalid";
      feedbackElement.className = "form-text text-warning";
    } else {
      feedbackElement.textContent = "Ready to check air quality";
      feedbackElement.className = "form-text text-success";
    }
  }
}

// Clear input feedback
function clearInputFeedback() {
  const feedbackElement = document.querySelector(".form-text");
  feedbackElement.textContent = "Enter a 6-digit Indian pincode";
  feedbackElement.className = "form-text text-muted";
}

// Add Escape key support for reset
document.addEventListener("keydown", function (e) {
  if (e.key === "Escape" && !resultsCard.classList.contains("d-none")) {
    resetPage();
  }
});

// Add helpful pincode suggestions on double-click
pincodeInput.addEventListener("dblclick", function () {
  if (!pincodeInput.value) {
    showPincodeSuggestions();
  }
});

// Add placeholder animation on focus
pincodeInput.addEventListener("focus", function () {
  if (!pincodeInput.value) {
    pincodeInput.placeholder = "e.g., 110001, 400001, 560001...";
  }
});

pincodeInput.addEventListener("blur", function () {
  if (!pincodeInput.value) {
    pincodeInput.placeholder = "Enter your pincode (e.g., 110001)";
  }
});

// Main function to check air quality
async function checkAirQuality() {
  const pincode = pincodeInput.value.trim();

  // Validate pincode
  if (!validatePincode(pincode)) {
    return;
  }

  setLoadingState(true);
  hideError();
  hideResults();

  try {
    // Step 1: Get location from pincode with retry
    const locationData = await retryRequest(() =>
      getLocationFromPincode(pincode)
    );

    // Step 2: Get air quality data
    const airQualityData = await getAirQualityData(locationData);

    // Step 3: Display results
    displayResults(locationData, airQualityData);
  } catch (error) {
    console.error("Error:", error);

    // Parse error message for category
    const [category, message] = error.message.includes("|")
      ? error.message.split("|")
      : ["GENERAL", error.message];

    // Handle different error categories
    switch (category) {
      case "PINCODE_NOT_FOUND":
      case "INVALID_PINCODE":
      case "NO_DATA":
      case "INCOMPLETE_DATA":
        showValidationError(
          message,
          "Try a different pincode or check for typos"
        );
        break;
      case "NETWORK":
      case "TIMEOUT":
        showNetworkError(message);
        break;
      case "API_ERROR":
        showApiError(message);
        break;
      default:
        showError(message);
    }
  } finally {
    setLoadingState(false);
  }
}

// Retry mechanism for network failures
async function retryRequest(requestFunction, maxRetries = 2, delay = 1000) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await requestFunction();
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }

      // Only retry for network errors
      if (
        error.message.includes("NETWORK") ||
        error.message.includes("TIMEOUT")
      ) {
        await new Promise((resolve) => setTimeout(resolve, delay * attempt));
        continue;
      } else {
        throw error;
      }
    }
  }
}

// Provide helpful pincode suggestions
function getSamplePincodes() {
  return [
    { code: "110001", city: "New Delhi, Delhi" },
    { code: "400001", city: "Mumbai, Maharashtra" },
    { code: "560001", city: "Bangalore, Karnataka" },
    { code: "600001", city: "Chennai, Tamil Nadu" },
    { code: "700001", city: "Kolkata, West Bengal" },
    { code: "500001", city: "Hyderabad, Telangana" },
  ];
}

// Show helpful suggestions on validation errors
function showPincodeSuggestions() {
  const samples = getSamplePincodes();
  const randomSample = samples[Math.floor(Math.random() * samples.length)];

  const suggestion = `Try a valid pincode like <strong>${randomSample.code}</strong> (${randomSample.city})`;
  showError(suggestion, "info");
}

// Validate pincode input with comprehensive checks
function validatePincode(pincode) {
  // Check if input is empty or only whitespace
  if (!pincode || pincode.trim().length === 0) {
    showPincodeSuggestions();
    highlightInput();
    return false;
  }

  // Check for non-numeric characters
  if (!/^\d+$/.test(pincode)) {
    showValidationError(
      "Pincode must contain only numbers (0-9)",
      "Remove any letters, spaces, or special characters"
    );
    highlightInput();
    return false;
  }

  // Check length - must be exactly 6 digits
  if (pincode.length < 6) {
    showValidationError(
      `Pincode must be 6 digits (you entered ${pincode.length})`,
      "Add more digits to complete your pincode"
    );
    highlightInput();
    return false;
  }

  if (pincode.length > 6) {
    showValidationError(
      "Pincode cannot be more than 6 digits",
      "Indian pincodes are exactly 6 digits long"
    );
    highlightInput();
    return false;
  }

  // Check for common invalid patterns
  if (isInvalidPincodePattern(pincode)) {
    showValidationError(
      "Invalid pincode format",
      "Please enter a valid Indian pincode (avoid patterns like 111111 or 123456)"
    );
    highlightInput();
    return false;
  }

  // Check if it's a valid Indian pincode range (100000-999999)
  const pincodeNumber = parseInt(pincode);
  if (pincodeNumber < 100000 || pincodeNumber > 999999) {
    showValidationError(
      "Please enter a valid Indian pincode (100000-999999)",
      "Indian pincodes start from 100000"
    );
    highlightInput();
    return false;
  }

  return true;
}

// Check for invalid pincode patterns
function isInvalidPincodePattern(pincode) {
  // Check for repeating digits (e.g., 111111, 000000)
  if (/^(\d)\1{5}$/.test(pincode)) {
    return true;
  }

  // Check for sequential patterns (e.g., 123456, 654321)
  if (isSequentialPattern(pincode)) {
    return true;
  }

  return false;
}

// Check for sequential number patterns
function isSequentialPattern(pincode) {
  const digits = pincode.split("").map(Number);

  // Check ascending sequence
  let isAscending = true;
  let isDescending = true;

  for (let i = 1; i < digits.length; i++) {
    if (digits[i] !== digits[i - 1] + 1) {
      isAscending = false;
    }
    if (digits[i] !== digits[i - 1] - 1) {
      isDescending = false;
    }
  }

  return isAscending || isDescending;
}

// Highlight input field for errors
function highlightInput() {
  pincodeInput.classList.add("is-invalid");
  setTimeout(() => {
    pincodeInput.classList.remove("is-invalid");
  }, 3000);
}

// Get location data from pincode with enhanced error handling
async function getLocationFromPincode(pincode) {
  try {
    // Add timeout to prevent hanging requests
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    const response = await fetch(`${PINCODE_API_BASE}${pincode}`, {
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 404) {
        throw new Error("Pincode not found. Please verify and try again.");
      } else if (response.status >= 500) {
        throw new Error("Server error. Please try again in a few minutes.");
      } else {
        throw new Error(
          `Request failed (${response.status}). Please try again.`
        );
      }
    }

    const data = await response.json();

    // Validate response structure
    if (!data || !Array.isArray(data) || data.length === 0) {
      throw new Error("Invalid response from server. Please try again.");
    }

    // Check if pincode was found
    if (data[0].Status !== "Success") {
      if (data[0].Message && data[0].Message.includes("found")) {
        throw new Error(
          "PINCODE_NOT_FOUND|This pincode doesn't exist. Please check and try again."
        );
      } else {
        throw new Error(
          "INVALID_PINCODE|Invalid pincode. Please verify and try again."
        );
      }
    }

    // Validate that we have post office data
    if (!data[0].PostOffice || data[0].PostOffice.length === 0) {
      throw new Error("NO_DATA|No location data found for this pincode.");
    }

    const postOffice = data[0].PostOffice[0];

    // Validate required fields
    if (!postOffice.District || !postOffice.State || !postOffice.Country) {
      throw new Error(
        "INCOMPLETE_DATA|Incomplete location data. Please try a different pincode."
      );
    }

    return {
      city: postOffice.District,
      state: postOffice.State,
      country: postOffice.Country,
      name: postOffice.Name || postOffice.District,
    };
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(
        "TIMEOUT|Request timed out. Please check your internet connection and try again."
      );
    }

    if (
      error.message.includes("fetch") ||
      error.message.includes("NetworkError")
    ) {
      throw new Error(
        "NETWORK|Network error. Please check your internet connection and try again."
      );
    }

    // Re-throw custom errors as-is
    throw error;
  }
}

// Get air quality data from IQAir API
async function getAirQualityData(locationData) {
  // Note: For demo purposes, we'll simulate the API response
  // In production, you'll need to get an API key from IQAir and make actual API calls

  try {
    // Simulated API response for demo
    // Replace this with actual API call:
    // const response = await fetch(`${AIR_QUALITY_API_BASE}?city=${locationData.city}&state=${locationData.state}&country=${locationData.country}&key=${AIR_QUALITY_API_KEY}`);

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Simulated response data
    const simulatedData = generateSimulatedAirQualityData();

    return simulatedData;
  } catch (error) {
    throw new Error(
      "Unable to fetch air quality data. Please try again later."
    );
  }
}

// Generate simulated air quality data for demo
function generateSimulatedAirQualityData() {
  const aqiValues = [25, 45, 75, 95, 125, 155, 175, 205];
  const pollutants = ["pm25", "pm10", "o3", "no2", "so2", "co"];
  const randomAqi = aqiValues[Math.floor(Math.random() * aqiValues.length)];

  return {
    data: {
      current: {
        pollution: {
          aqius: randomAqi,
          mainus: pollutants[Math.floor(Math.random() * pollutants.length)],
        },
        weather: {
          tp: Math.floor(Math.random() * 20) + 15, // 15-35°C
          hu: Math.floor(Math.random() * 40) + 40, // 40-80%
          ws: (Math.random() * 15 + 2).toFixed(1), // 2-17 m/s
        },
      },
    },
  };
}

// Display results on the UI
function displayResults(locationData, airQualityData) {
  const pollution = airQualityData.data.current.pollution;
  const weather = airQualityData.data.current.weather;

  // Update location info
  locationInfo.textContent = `${locationData.name}, ${locationData.city}, ${locationData.state}`;

  // Update AQI and status
  const aqi = pollution.aqius;
  aqiValue.textContent = aqi;

  // Update main pollutant
  const pollutantNames = {
    pm25: "PM2.5",
    pm10: "PM10",
    o3: "O₃",
    no2: "NO₂",
    so2: "SO₂",
    co: "CO",
  };
  mainPollutant.textContent =
    pollutantNames[pollution.mainus] || pollution.mainus.toUpperCase();

  // Update weather info
  temperature.innerHTML = `${weather.tp}°C`;
  humidity.innerHTML = `${weather.hu}%`;
  windSpeed.innerHTML = `${weather.ws} m/s`;

  // Update mood and background based on AQI
  updateMoodCharacter(aqi);

  // Update health recommendations
  updateHealthRecommendations(aqi);

  // Show results
  showResults();
}

// Update mood character based on AQI
function updateMoodCharacter(aqi) {
  let mood, character, status, bgClass;

  if (aqi <= 50) {
    // Good air quality
    mood = "happy";
    character = "😀";
    status = `Great Air Quality! (${aqi})`;
    bgClass = "mood-happy";
  } else if (aqi <= 150) {
    // Moderate air quality
    mood = "neutral";
    character = "😐";
    status = `Moderate Air Quality (${aqi})`;
    bgClass = "mood-neutral";
  } else {
    // Poor air quality
    mood = "sad";
    character = aqi <= 200 ? "😷" : "😢";
    status = `Poor Air Quality (${aqi})`;
    bgClass = "mood-sad";
  }

  // Update character and background
  moodCharacter.textContent = character;
  aqiStatus.textContent = status;

  // Remove existing mood classes and add new one
  moodBackground.classList.remove("mood-happy", "mood-neutral", "mood-sad");
  moodBackground.classList.add(bgClass);

  // Add a slight animation trigger
  moodCharacter.style.animation = "none";
  setTimeout(() => {
    moodCharacter.style.animation = "bounce 2s ease-in-out infinite";
  }, 100);
}

// Update health recommendations based on AQI
function updateHealthRecommendations(aqi) {
  let recommendations;

  if (aqi <= 50) {
    recommendations = HEALTH_RECOMMENDATIONS.good;
  } else if (aqi <= 150) {
    recommendations = HEALTH_RECOMMENDATIONS.moderate;
  } else {
    recommendations = HEALTH_RECOMMENDATIONS.unhealthy;
  }

  // Update title and message
  healthTitle.textContent = recommendations.title;
  healthMessageText.textContent = recommendations.message;

  // Update alert styling
  healthMessage.className = `alert alert-${recommendations.color} mb-3`;

  // Update tips list
  healthTipsList.innerHTML = "";
  recommendations.tips.forEach((tip) => {
    const li = document.createElement("li");
    li.innerHTML = tip;
    li.className = "mb-2";
    healthTipsList.appendChild(li);
  });

  // Add emergency notice for very poor air quality
  if (aqi > 200) {
    const emergencyLi = document.createElement("li");
    emergencyLi.innerHTML =
      "🚨 <strong>EMERGENCY:</strong> Air quality is hazardous. Seek immediate indoor shelter and consider medical attention if experiencing symptoms.";
    emergencyLi.className = "mb-2 alert alert-danger p-2";
    emergencyLi.style.borderLeft = "4px solid #dc3545";
    emergencyLi.style.fontWeight = "bold";
    healthTipsList.insertBefore(emergencyLi, healthTipsList.firstChild);
  }

  // Add animation to health section
  healthRecommendations.style.animation = "slideUp 0.5s ease-out";
}

// Get health category based on AQI
function getHealthCategory(aqi) {
  if (aqi <= 50) return "good";
  if (aqi <= 150) return "moderate";
  return "unhealthy";
}

// UI State Management Functions
function setLoadingState(loading) {
  if (loading) {
    checkButton.disabled = true;
    buttonText.classList.add("d-none");
    loadingSpinner.classList.remove("d-none");
  } else {
    checkButton.disabled = false;
    buttonText.classList.remove("d-none");
    loadingSpinner.classList.add("d-none");
  }
}

function showError(message, type = "error") {
  errorMessage.innerHTML = message;

  // Clear existing alert classes
  errorAlert.className = "alert d-flex align-items-center";

  // Set alert type based on error category
  switch (type) {
    case "warning":
      errorAlert.classList.add("alert-warning");
      break;
    case "info":
      errorAlert.classList.add("alert-info");
      break;
    default:
      errorAlert.classList.add("alert-danger");
  }

  errorAlert.classList.remove("d-none");

  // Auto-hide error after different durations based on type
  const hideDelay = type === "info" ? 3000 : type === "warning" ? 4000 : 6000;

  clearTimeout(window.errorTimeout);
  window.errorTimeout = setTimeout(() => {
    hideError();
  }, hideDelay);
}

// Enhanced error display with suggestions
function showValidationError(message, suggestion = "") {
  let fullMessage = `<strong>Input Error:</strong> ${message}`;
  if (suggestion) {
    fullMessage += `<br><small><i class="fas fa-lightbulb me-1"></i>${suggestion}</small>`;
  }
  showError(fullMessage, "warning");
}

function showNetworkError(message) {
  const fullMessage = `<strong>Connection Error:</strong> ${message}<br><small><i class="fas fa-wifi me-1"></i>Check your internet connection and try again</small>`;
  showError(fullMessage, "error");
}

function showApiError(message) {
  const fullMessage = `<strong>Service Error:</strong> ${message}<br><small><i class="fas fa-server me-1"></i>This might be a temporary issue</small>`;
  showError(fullMessage, "error");
}

function hideError() {
  errorAlert.classList.add("d-none");
}

function showResults() {
  resultsCard.classList.remove("d-none");
}

function hideResults() {
  resultsCard.classList.add("d-none");
}

// Reset function to clear results and allow new search
function resetPage() {
  // Clear input field
  pincodeInput.value = "";

  // Hide results and errors
  hideResults();
  hideError();

  // Reset button states
  setLoadingState(false);

  // Reset all result fields to default values
  resetResultFields();

  // Focus back on input field
  pincodeInput.focus();

  // Add a subtle animation to indicate reset
  pincodeInput.style.animation = "pulse 0.5s ease-in-out";
  setTimeout(() => {
    pincodeInput.style.animation = "";
  }, 500);
}

// Helper function to reset all result field values
function resetResultFields() {
  aqiStatus.textContent = "";
  locationInfo.textContent = "";
  aqiValue.textContent = "--";
  mainPollutant.textContent = "--";
  temperature.innerHTML = "--";
  humidity.innerHTML = "--";
  windSpeed.innerHTML = "--";

  // Reset mood character to default
  moodCharacter.textContent = "😊";
  moodBackground.classList.remove("mood-happy", "mood-neutral", "mood-sad");
  moodBackground.classList.add("mood-neutral");

  // Reset health recommendations
  healthTitle.textContent = "Health Recommendations";
  healthMessageText.textContent = "";
  healthMessage.className = "alert alert-info mb-3";
  healthTipsList.innerHTML = "";
}

// Initialize app
document.addEventListener("DOMContentLoaded", function () {
  // Developer attribution
  console.log(
    "%c🌍 Air Quality Checker",
    "color: #0d6efd; font-size: 20px; font-weight: bold;"
  );
  console.log(
    "%cDeveloped by: Vikas Jha",
    "color: #198754; font-size: 14px; font-weight: bold;"
  );
  console.log(
    "%c© 2025 All rights reserved",
    "color: #6c757d; font-size: 12px;"
  );
  console.log(
    "%cData Sources:",
    "color: #fd7e14; font-size: 12px; font-weight: bold;"
  );
  console.log("• Air Quality: IQAir AirVisual API");
  console.log("• Location: Indian Postal Pincode API");
  console.log("• Health Tips: American Lung Association");
  console.log(
    "%cBuilt with ❤️ for environmental awareness",
    "color: #dc3545; font-size: 12px;"
  );

  // Focus on input field
  pincodeInput.focus();

  // Add sample pincode for testing
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    pincodeInput.placeholder = "Enter pincode (try: 110001 for demo)";
  }
});

// Additional utility functions

// Format AQI status with color coding
function getAQIStatusClass(aqi) {
  if (aqi <= 50) return "text-success";
  if (aqi <= 100) return "text-warning";
  if (aqi <= 150) return "text-orange";
  return "text-danger";
}

// Get AQI description
function getAQIDescription(aqi) {
  if (aqi <= 50) return "Good - Air quality is satisfactory";
  if (aqi <= 100) return "Moderate - Air quality is acceptable";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy - Everyone may experience health effects";
  if (aqi <= 300) return "Very Unhealthy - Health alert";
  return "Hazardous - Emergency conditions";
}

// Copy functionality for sharing results
function copyResults() {
  const location = locationInfo.textContent;
  const aqi = aqiValue.textContent;
  const pollutant = mainPollutant.textContent;
  const temp = temperature.textContent;

  const text = `Air Quality Report for ${location}:\nAQI: ${aqi}\nMain Pollutant: ${pollutant}\nTemperature: ${temp}`;

  navigator.clipboard.writeText(text).then(() => {
    // Could show a toast notification here
    console.log("Results copied to clipboard");
  });
}
