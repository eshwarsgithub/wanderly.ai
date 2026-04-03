export interface WeatherDay {
  date: string;                 // ISO date string e.g. "2026-06-15"
  tempHighC: number;
  tempLowC: number;
  description: string;          // e.g. "partly cloudy"
  icon: string;                 // OpenWeatherMap icon code e.g. "02d"
  humidity: number;
  precipitationChance: number;  // 0-100
}

interface OWMGeoResult {
  lat: number;
  lon: number;
}

interface OWMForecastItem {
  dt_txt: string;
  main: { temp_max: number; temp_min: number; humidity: number };
  weather: Array<{ description: string; icon: string }>;
  pop: number; // probability of precipitation 0-1
}

/**
 * Fetches a weather forecast for a destination.
 * OpenWeatherMap free tier supports up to 5 days.
 * Returns an empty array for dates beyond the forecast window or if the API key is missing.
 */
export async function getWeatherForecast(
  destination: string,
  startDate: string,
  days: number
): Promise<WeatherDay[]> {
  const apiKey = process.env.OPENWEATHERMAP_API_KEY;
  if (!apiKey) return [];

  // Check if start date is within the 5-day window
  const start = new Date(startDate);
  const now = new Date();
  const diffDays = Math.ceil((start.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays > 5) return [];

  try {
    // Step 1: Geocode destination
    const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(destination)}&limit=1&appid=${apiKey}`;
    const geoRes = await fetch(geoUrl);
    if (!geoRes.ok) return [];
    const geoData = (await geoRes.json()) as OWMGeoResult[];
    if (!geoData.length) return [];

    const { lat, lon } = geoData[0];

    // Step 2: Fetch 5-day forecast (3-hour intervals)
    const count = Math.min(days, 5) * 8;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=${count}`;
    const forecastRes = await fetch(forecastUrl);
    if (!forecastRes.ok) return [];

    const forecastData = await forecastRes.json();
    const items: OWMForecastItem[] = forecastData.list ?? [];

    // Group 3-hour intervals by date
    const byDate = new Map<string, OWMForecastItem[]>();
    for (const item of items) {
      const date = item.dt_txt.split(" ")[0];
      if (!byDate.has(date)) byDate.set(date, []);
      byDate.get(date)!.push(item);
    }

    const result: WeatherDay[] = [];
    for (const [date, dayItems] of byDate) {
      const tempHighC = Math.max(...dayItems.map((i) => i.main.temp_max));
      const tempLowC = Math.min(...dayItems.map((i) => i.main.temp_min));
      const humidity = Math.round(dayItems.reduce((s, i) => s + i.main.humidity, 0) / dayItems.length);
      const precipitationChance = Math.round(Math.max(...dayItems.map((i) => i.pop)) * 100);
      // Use midday reading for description/icon, fallback to first item
      const midday = dayItems.find((i) => i.dt_txt.includes("12:00")) ?? dayItems[0];
      const description = midday.weather[0]?.description ?? "unknown";
      const icon = midday.weather[0]?.icon ?? "01d";

      result.push({ date, tempHighC: Math.round(tempHighC), tempLowC: Math.round(tempLowC), description, icon, humidity, precipitationChance });
    }

    return result.slice(0, days);
  } catch {
    return [];
  }
}
