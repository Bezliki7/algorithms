import { WeatherDataIntegrator } from "./weather-integrator.js";

async function runDemo() {
  const config = {
    openWeatherMap: "token",
    visualCrossing: "token",
    weatherstack: "token",
  };

  const integrator = new WeatherDataIntegrator(config);

  const result = await integrator.fetchAndIntegrate("Москва");

  console.log("Результаты интеграции:");
  console.log(JSON.stringify(result, null, 2));
}

runDemo().catch(console.error);
