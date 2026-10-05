export async function currentWeather( city ) {
  if (typeof city !== "string" || !city.trim()) {
    throw new Error("Weather requires a non-empty city name");
  }
  console.log("Weather tool called");
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.trim())}&appid=0c3e9fcdef4018def4d8384c6c1b42c2`
  const response = await fetch(url);
  if (!response.ok) throw new Error(await response.text());
  const data= await response.json();
  // console.log(data.weather[0].description)
  return data.weather[0].description
}

// await currentWeather("Delhi")
