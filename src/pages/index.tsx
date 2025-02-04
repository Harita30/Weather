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
    const res = await fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=6c417aee9fd845df809163341250202&q=${city}&days=5`
    );
    if (!res.ok) throw new Error("Failed to fetch weather data");

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
    <div className="flex flex-col items-center p-5">
      <h1 className="text-3xl font-bold">Weather App</h1>

      <div className="flex gap-2 my-4">
        <input
          type="text"
          placeholder="Enter city..."
          className="border p-2 rounded-md"
          onChange={(e) => setCity(e.target.value)}
        />
        <button
          onClick={fetchWeather}
          className="bg-blue-500 text-white p-2 rounded-md"
        >
          Fetch Weather
        </button>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {weather && location && (
        <div className="border p-4 rounded-md shadow-md">
          <h2 className="text-xl font-semibold">Today</h2>
          <p>
            <strong>City:</strong> {location.name}
          </p>
          <p>
            <strong>Temperature:</strong> {weather.temp_c}°C
          </p>
          <p>
            <strong>Humidity:</strong> {weather.humidity}%
          </p>
          <p>
            <strong>Condition:</strong> {weather.condition.text}
          </p>
          <img
            src={`https:${weather.condition.icon}`}
            alt={weather.condition.text}
          />
        </div>
      )}

      {forecast.length > 0 && (
        <div className="mt-4">
          <h2 className="text-lg font-semibold">5-Day Forecast</h2>
          <div className="grid grid-cols-5 gap-4">
            {forecast.map((day) => (
              <div key={day.date} className="border p-2 rounded-md text-center">
                <p>
                  <strong>{day.date}</strong>
                </p>
                <p>{day.day.avgtemp_c}°C</p>
                <img
                  src={`https:${day.day.condition.icon}`}
                  alt={day.day.condition.text}
                />
                <p>{day.day.condition.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
