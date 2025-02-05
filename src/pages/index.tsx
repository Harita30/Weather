import { GetServerSideProps } from "next";
import { useState } from "react";
import { useRouter } from "next/router";

interface WeatherData {
  temp_c: number;
  humidity: number;
  condition: { text: string; icon: string };
}

interface ForecastDay {
  date: string;
  day: { avgtemp_c: number; condition: { text: string; icon: string } };
}

interface LocationData {
  name: string;
}

interface HomeProps {
  weather: WeatherData | null;
  location: LocationData | null;
  forecast: ForecastDay[];
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const city = context.query.city ? String(context.query.city) : null;

  if (!city) {
    return {
      props: {
        error: "Please enter a valid city name.",
        weather: null,
        location: null,
        forecast: [],
      },
    };
  }

  try {
    // 🔄 Fetch data directly from the Weather API
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=6c417aee9fd845df809163341250202&q=${city}&days=5`
    );
    if (!res.ok) {
      return {
        props: {
          error: `City "${city}" not found. Please enter a valid city name.`,
          weather: null,
          location: null,
          forecast: [],
        },
      };
    }
    const data = await res.json();

    return {
      props: {
        error: null,
        weather: data.current || null,
        location: data.location || null,
        forecast: data.forecast?.forecastday || [],
      },
    };
  } catch (error) {
    console.error("Weather API Error:", error);
    return {
      props: {
        error: "Could not fetch weather data.",
        weather: null,
        location: null,
        forecast: [],
      },
    };
  }
};

export default function Home({
  weather,
  location,
  forecast,
  error,
}: HomeProps & { error?: string }) {
  const [city, setCity] = useState("");
  const router = useRouter();

  const fetchWeather = async () => {
    if (!city.trim()) {
      alert("Please enter a valid city name.");
      return;
    }
    router.push(`/?city=${encodeURIComponent(city)}`);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-900 via-blue-600 to-blue-400 text-white p-6">
      <div className="bg-white text-black rounded-lg shadow-lg p-6 w-full max-w-screen-xl mx-auto text-center">
        <h1 className="text-4xl font-bold mb-4 text-gray-800">Weather App</h1>

        {/* Input Field */}
        <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Enter city..."
            className="border border-gray-300 p-3 rounded-md w-full sm:w-2/3 text-lg"
            onChange={(e) => setCity(e.target.value)}
          />
          <button
            onClick={fetchWeather}
            className="bg-blue-700 hover:bg-blue-900 text-white text-lg p-3 rounded-md transition duration-300 w-full sm:w-1/3"
          >
            Fetch Weather
          </button>
        </div>

        {error ? (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4 rounded-md w-full max-w-lg text-center">
            <p className="text-lg font-semibold">Error:</p>
            <p>{error}</p>
          </div>
        ) : (
          <>
            {weather && location && (
              <div className="bg-blue-700 text-white p-6 rounded-lg shadow-md mt-4">
                <h2 className="text-2xl font-semibold mb-2">Today</h2>
                <p className="text-lg">
                  <strong>City:</strong> {location.name}
                </p>
                <p className="text-lg">
                  <strong>Temperature:</strong> {weather.temp_c}°C
                </p>
                <p className="text-lg">
                  <strong>Humidity:</strong> {weather.humidity}%
                </p>
                <p className="text-lg">
                  <strong>Condition:</strong> {weather.condition.text}
                </p>
                <img
                  src={`https:${weather.condition.icon}`}
                  alt={weather.condition.text}
                  className="w-24 h-24 mx-auto mt-2"
                />
              </div>
            )}

            {forecast.length > 0 && (
              <div className="mt-6">
                <h2 className="text-2xl font-semibold mb-3">5-Day Forecast</h2>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 w-full max-w-screen-lg mx-auto text-center items-stretch">
                  {forecast.map((day) => (
                    <div
                      key={day.date}
                      className="bg-white text-black p-4 rounded-lg shadow-md text-center"
                    >
                      <p className="font-semibold text-lg">{day.date}</p>
                      <p className="text-lg">{day.day.avgtemp_c}°C</p>
                      <img
                        src={`https:${day.day.condition.icon}`}
                        alt={day.day.condition.text}
                        className="w-16 h-16 mx-auto"
                      />
                      <p className="text-sm text-gray-600">
                        {day.day.condition.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
