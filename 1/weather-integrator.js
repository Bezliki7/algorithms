const WeatherModel = {
  timestamp: null,
  location: {
    city: null,
    country: null,
    latitude: null,
    longitude: null,
  },
  temperature: {
    current: null,
    feels_like: null,
    min: null,
    max: null,
  },
  conditions: {
    main: null,
    description: null,
    icon: null,
  },
  wind: {
    speed: null,
    direction: null,
    gust: null,
  },
  humidity: null,
  pressure: null,
  precipitation: {
    rain: null,
    snow: null,
    probability: null,
  },
  visibility: null,
  clouds: null,
  sunrise: null,
  sunset: null,
};

class OpenWeatherMapAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "https://api.openweathermap.org/data/2.5/weather";
  }

  async fetchData(city) {
    const url = `${this.baseUrl}?q=${encodeURIComponent(city)}&appid=${this.apiKey}&units=metric&lang=ru`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`OpenWeatherMap error: ${response.status}`);
    return await response.json();
  }

  normalizeToModel(data) {
    return {
      timestamp: new Date(data.dt * 1000),
      location: {
        city: data.name,
        country: data.sys?.country,
        latitude: data.coord?.lat,
        longitude: data.coord?.lon,
      },
      temperature: {
        current: data.main?.temp,
        feels_like: data.main?.feels_like,
        min: data.main?.temp_min,
        max: data.main?.temp_max,
      },
      conditions: {
        main: data.weather?.[0]?.main,
        description: data.weather?.[0]?.description,
        icon: data.weather?.[0]?.icon,
      },
      wind: {
        speed: data.wind?.speed,
        direction: data.wind?.deg,
        gust: data.wind?.gust,
      },
      humidity: data.main?.humidity,
      pressure: data.main?.pressure,
      precipitation: {
        rain: data.rain?.["1h"],
        snow: data.snow?.["1h"],
        probability: null,
      },
      visibility: data.visibility,
      clouds: data.clouds?.all,
      sunrise: data.sys?.sunrise ? new Date(data.sys.sunrise * 1000) : null,
      sunset: data.sys?.sunset ? new Date(data.sys.sunset * 1000) : null,
    };
  }
}

class VisualCrossingAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl =
      "https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline";
  }

  async fetchData(city) {
    const url = `${this.baseUrl}/${encodeURIComponent(city)}/today?unitGroup=metric&include=current&key=${this.apiKey}&contentType=json&lang=ru`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`VisualCrossing error: ${response.status}`);
    return await response.json();
  }

  normalizeToModel(data) {
    const current = data.currentConditions;
    return {
      timestamp: new Date(current.datetimeEpoch * 1000),
      location: {
        city: data.resolvedAddress?.split(",")[0],
        country: data.resolvedAddress?.split(",").pop()?.trim(),
        latitude: data.latitude,
        longitude: data.longitude,
      },
      temperature: {
        current: current.temp,
        feels_like: current.feelslike,
        min: data.days?.[0]?.tempmin,
        max: data.days?.[0]?.tempmax,
      },
      conditions: {
        main: current.conditions?.split(",")[0],
        description: current.conditions,
        icon: current.icon,
      },
      wind: {
        speed: current.windspeed,
        direction: current.winddir,
        gust: current.windgust,
      },
      humidity: current.humidity,
      pressure: current.pressure,
      precipitation: {
        rain: current.precip,
        snow: current.snow,
        probability: current.precipprob,
      },
      visibility: current.visibility,
      clouds: current.cloudcover,
      sunrise: current.sunrise
        ? new Date(`${current.datetime.split("T")[0]}T${current.sunrise}`)
        : null,
      sunset: current.sunset
        ? new Date(`${current.datetime.split("T")[0]}T${current.sunset}`)
        : null,
    };
  }
}

class WeatherstackAdapter {
  constructor(apiKey) {
    this.apiKey = apiKey;
    this.baseUrl = "http://api.weatherstack.com/current";
  }

  async fetchData(city) {
    const url = `${this.baseUrl}?access_key=${this.apiKey}&query=${encodeURIComponent(city)}&units=m`;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Weatherstack error: ${response.status}`);
    return await response.json();
  }

  normalizeToModel(data) {
    return {
      timestamp: new Date(data.location?.localtime),
      location: {
        city: data.location?.name,
        country: data.location?.country,
        latitude: data.location?.lat,
        longitude: data.location?.lon,
      },
      temperature: {
        current: data.current?.temperature,
        feels_like: data.current?.feelslike,
        min: null,
        max: null,
      },
      conditions: {
        main: data.current?.weather_descriptions?.[0]?.split(",")[0],
        description: data.current?.weather_descriptions?.[0],
        icon: data.current?.weather_icons?.[0],
      },
      wind: {
        speed: data.current?.wind_speed,
        direction: data.current?.wind_degree,
        gust: data.current?.wind_gust,
      },
      humidity: data.current?.humidity,
      pressure: data.current?.pressure,
      precipitation: {
        rain: data.current?.precip,
        snow: null,
        probability: null,
      },
      visibility: data.current?.visibility,
      clouds: data.current?.cloudcover,
      sunrise: null,
      sunset: null,
    };
  }
}

class ValueNormalizer {
  static normalizeBoolean(value) {
    if (typeof value === "boolean") return value;
    if (typeof value === "number") return value !== 0;
    if (typeof value === "string") {
      const lower = value.toLowerCase().trim();
      if (["true", "yes", "да", "1", "+", "on"].includes(lower)) return true;
      if (["false", "no", "нет", "0", "-", "off", "null"].includes(lower))
        return false;
    }
    return Boolean(value);
  }

  static normalizeTemperature(value) {
    if (value === null || value === undefined) return null;
    const num = parseFloat(value);
    return isNaN(num) ? null : Math.round(num * 10) / 10;
  }

  static normalizeWindDirection(degrees) {
    if (degrees === null || degrees === undefined) return null;
    const directions = ["С", "СВ", "В", "ЮВ", "Ю", "ЮЗ", "З", "СЗ"];
    const index = Math.round((degrees % 360) / 45) % 8;
    return directions[index];
  }

  static normalizeCondition(value) {
    if (!value) return null;
    const conditions = {
      clear: "Ясно",
      sunny: "Ясно",
      cloudy: "Облачно",
      "partly cloudy": "Переменная облачность",
      rain: "Дождь",
      snow: "Снег",
      thunderstorm: "Гроза",
      fog: "Туман",
      mist: "Дымка",
    };
    return conditions[value.toLowerCase()] || value;
  }
}

class WeatherDataIntegrator {
  constructor(config) {
    this.adapters = [];

    if (config.openWeatherMap) {
      this.adapters.push(new OpenWeatherMapAdapter(config.openWeatherMap));
    }
    if (config.visualCrossing) {
      this.adapters.push(new VisualCrossingAdapter(config.visualCrossing));
    }
    if (config.weatherstack) {
      this.adapters.push(new WeatherstackAdapter(config.weatherstack));
    }
  }

  async fetchAndIntegrate(city) {
    const results = [];

    for (const adapter of this.adapters) {
      try {
        const rawData = await adapter.fetchData(city);
        const normalizedData = adapter.normalizeToModel(rawData);
        const finalData = this.applyValueNormalization(normalizedData);

        console.log(`=== ${adapter.constructor.name} ===`);
        console.log("Сырые данные:");
        console.log(JSON.stringify(rawData, null, 2));
        console.log("\nНормализованные данные:");
        console.log(JSON.stringify(finalData, null, 2));
        console.log("\n");

        results.push({
          source: adapter.constructor.name,
          normalized: finalData,
        });
      } catch (error) {
        console.log(`=== ${adapter.constructor.name} - Ошибка ===`);
        console.log(error.message);
        console.log("\n");
      }
    }

    return results;
  }

  applyValueNormalization(data) {
    const normalized = JSON.parse(JSON.stringify(data));

    normalized.temperature.current = ValueNormalizer.normalizeTemperature(
      normalized.temperature.current,
    );
    normalized.temperature.feels_like = ValueNormalizer.normalizeTemperature(
      normalized.temperature.feels_like,
    );
    normalized.temperature.min = ValueNormalizer.normalizeTemperature(
      normalized.temperature.min,
    );
    normalized.temperature.max = ValueNormalizer.normalizeTemperature(
      normalized.temperature.max,
    );

    normalized.conditions.main = ValueNormalizer.normalizeCondition(
      normalized.conditions.main,
    );
    normalized.conditions.description = ValueNormalizer.normalizeCondition(
      normalized.conditions.description,
    );

    if (normalized.wind.direction !== null) {
      normalized.wind.direction_degrees = normalized.wind.direction;
      normalized.wind.direction_text = ValueNormalizer.normalizeWindDirection(
        normalized.wind.direction,
      );
    }

    return normalized;
  }
}

export {
  WeatherModel,
  OpenWeatherMapAdapter,
  VisualCrossingAdapter,
  WeatherstackAdapter,
  ValueNormalizer,
  WeatherDataIntegrator,
};
