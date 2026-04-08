import type { WeatherDay } from "@/lib/weather";

interface WeatherWidgetProps {
  weatherData: WeatherDay | null | undefined;
}

export default function WeatherWidget({ weatherData }: WeatherWidgetProps) {
  if (!weatherData) return null;

  return (
    <span className="flex items-center gap-1 text-xs text-slate-400">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`https://openweathermap.org/img/wn/${weatherData.icon}@1x.png`}
        alt={weatherData.description}
        width={16}
        height={16}
        className="w-4 h-4 -my-0.5"
      />
      <span className="font-medium text-slate-500">
        {weatherData.tempHighC}°/{weatherData.tempLowC}°
      </span>
      {weatherData.precipitationChance > 10 && (
        <span className="text-blue-400">{weatherData.precipitationChance}%☔</span>
      )}
    </span>
  );
}
