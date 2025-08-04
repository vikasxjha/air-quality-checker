# Air Quality Checker 🌍💨

A responsive web application that checks air quality based on Indian pincodes. The app features a clean, mobile-friendly interface with animated mood indicators that change based on air quality levels.

## 🌟 Features

- **Pincode-based Search**: Enter any 6-digit Indian pincode to get air quality data
- **Responsive Design**: Mobile-first design that works on all devices
- **Animated Mood Character**: Visual indicator that changes expression based on AQI levels
- **Real-time Weather**: Display temperature, humidity, and wind speed
- **Loading States**: Smooth loading indicators and error handling
- **Bootstrap Integration**: Modern, clean UI with Bootstrap 5

## 🎨 Design Highlights

### Mood Character System

- **AQI ≤ 50**: 😀 Happy character with reddish background (Good air quality)
- **AQI 51-150**: 😐 Neutral character with yellowish background (Moderate air quality)
- **AQI > 150**: 😷/😢 Sad character with bluish background (Poor air quality)

### Visual Features

- Gradient backgrounds with smooth transitions
- Animated mood character with bounce effect
- Pulsing background animation
- Responsive card layout
- Clean typography and spacing

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Internet connection for API calls
- (Optional) IQAir API key for live data

### Installation

1. Clone or download the project files
2. Open `index.html` in a web browser
3. Enter a 6-digit Indian pincode (e.g., 110001)
4. Click "Check Air Quality"

### Project Structure

```
air-quality-checker/
├── index.html          # Main HTML file
├── styles.css          # Custom styles and animations
├── script.js           # JavaScript functionality
├── README.md           # Project documentation
└── .github/
    └── copilot-instructions.md
```

## 🔧 Technical Details

### APIs Used

1. **Pincode API**: `https://api.postalpincode.in/pincode/{pincode}`

   - Converts pincode to city/state/country information
   - Free to use, no API key required

2. **IQAir AirVisual API**: `http://api.airvisual.com/v2/city`
   - Provides air quality and weather data
   - Requires API key (currently simulated for demo)

### Technologies

- **HTML5**: Semantic markup with accessibility features
- **CSS3**: Custom properties, flexbox, grid, animations
- **JavaScript (ES6+)**: Async/await, fetch API, DOM manipulation
- **Bootstrap 5**: Responsive grid and components
- **Font Awesome**: Icons for enhanced UI

### Key JavaScript Functions

- `checkAirQuality()`: Main function that orchestrates the data flow
- `getLocationFromPincode()`: Fetches location data from pincode
- `getAirQualityData()`: Retrieves air quality information
- `updateMoodCharacter()`: Updates UI based on AQI levels
- `displayResults()`: Renders all data to the interface

## 📱 Responsive Design

The application is built with a mobile-first approach:

- **Mobile (< 576px)**: Single column layout, larger touch targets
- **Tablet (576px - 768px)**: Optimized spacing and typography
- **Desktop (> 768px)**: Enhanced layout with hover effects

## 🎯 Usage Examples

### Testing Pincodes

- **110001** (New Delhi): Urban area with varying AQI levels
- **400001** (Mumbai): Metropolitan area
- **560001** (Bangalore): Tech hub
- **600001** (Chennai): Coastal city

### Sample Workflow

1. User enters pincode "110001"
2. App validates input (6 digits, numbers only)
3. Fetches location: "New Delhi, Delhi, India"
4. Retrieves air quality data (simulated)
5. Updates mood character based on AQI
6. Displays comprehensive results

## 🔮 Future Enhancements

### Planned Features

- [ ] Historical data charts
- [ ] Multiple location comparison
- [ ] Push notifications for poor air quality
- [ ] Social sharing functionality
- [ ] PWA capabilities for offline use
- [ ] Geolocation-based detection

### API Integration

- [ ] Connect to live IQAir API
- [ ] Add multiple air quality data sources
- [ ] Implement caching for better performance
- [ ] Add rate limiting and error retry logic

## 🎨 Customization

### Changing Mood Characters

Edit the `updateMoodCharacter()` function in `script.js`:

```javascript
if (aqi <= 50) {
  character = "😀"; // Change to your preferred emoji
  bgClass = "mood-happy";
}
```

### Styling Modifications

Update CSS custom properties in `styles.css`:

```css
:root {
  --happy-bg: linear-gradient(135deg, #your-colors);
  --neutral-bg: linear-gradient(135deg, #your-colors);
  --sad-bg: linear-gradient(135deg, #your-colors);
}
```

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**: Use a local server (Live Server extension in VS Code)
2. **API Timeouts**: Check internet connection and API endpoints
3. **Invalid Pincode**: Ensure 6-digit Indian pincode format

### Development Tips

- Use browser developer tools for debugging
- Check console for error messages
- Test with various pincode inputs
- Verify responsive design on different screen sizes

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the troubleshooting section
2. Open an issue on GitHub
3. Review the code comments for additional context

---

Made with ❤️ for cleaner air awareness
