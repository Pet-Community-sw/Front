import { useEffect, useState } from "react";

const API_KEY = "4e89c68eff09acce492ba496792d382e";

const getWeatherEmoji = (main) => {
  switch (main) {
    case "Clear":
      return "☀️";
    case "Clouds":
      return "☁️";
    case "Rain":
    case "Drizzle":
      return "🌧️";
    case "Thunderstorm":
      return "⛈️";
    case "Snow":
      return "❄️";
    case "Mist":
    case "Fog":
    case "Haze":
      return "🌫️";
    default:
      return "🌡️";
  }
};

export const Weather = () => {
  const [weatherText, setWeatherText] = useState("날씨 불러오는 중...");

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/data/2.5/weather?q=Seoul&appid=${API_KEY}&units=metric&lang=kr`
        );
        const data = await res.json();

        const main = data.weather[0].main;
        const description = data.weather[0].description;
        const temp = Math.round(data.main.temp);
        const icon = getWeatherEmoji(main);

        const today = new Date();
        const dateStr = `${today.getMonth() + 1}월 ${today.getDate()}일`;

        setWeatherText(`${dateStr} ${icon} ${description} ${temp}º`);
      } catch (error) {
        setWeatherText("날씨 정보를 불러올 수 없습니다.");
      }
    };

    fetchWeather();
  }, []);

  return weatherText;
};
