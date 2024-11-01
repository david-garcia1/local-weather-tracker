import { v4 as uuidv4 } from "uuid";
import fs from 'node:fs/promises';
// TODO: Define a City class with name and id properties
class City{
  name:string
  id:string
  constructor(
    name:string,
    id:string,
  )
  {
    this.name=name;
    this.id=id;
  }
}
// TODO: Complete the HistoryService class
class HistoryService {
  // TODO: Define a read method that reads from the searchHistory.json file
  private async read() {
    return await fs.readFile('db/db.json', {flag:"a+", encoding:"utf8"})
  }
  // TODO: Define a write method that writes the updated cities array to the searchHistory.json file
  private async write(cities: City[]) {
    return await fs.writeFile('db/db.json', JSON.stringify(cities, null, '\t'))
  }
  // TODO: Define a getCities method that reads the cities from the searchHistory.json file and returns them as an array of City objects
  async getCities() {
    return await this.read().then((cities) => {
      let parsedCities: City[];

      try {
        parsedCities = [].concat(JSON.parse(cities));
      } catch (err) {
        parsedCities = [];
      }
      return parsedCities;
    });
  }
  // TODO Define an addCity method that adds a city to the searchHistory.json file
  async addCity(city: string) {
    if (!city) {
      throw new Error("City cannot be blank");
    }
    const newCity: City = {
      id: uuidv4(),
      name: city,
    };
    return await this.getCities()
      .then((cities) => {
        return [...cities, newCity];
      })
      .then((updatedCities) => this.write(updatedCities))
      .then(() => newCity);
  }
  // * BONUS TODO: Define a removeCity method that removes a city from the searchHistory.json file
  // BONUS: Define a removeCity method that removes a city from the searchHistory.json file
async removeCity(id: string): Promise<boolean> {
  const cities = await this.getCities();

  // Filter out the city with the given id
  const updatedCities = cities.filter((city) => city.id !== id);

  // Check if any city was removed
  if (updatedCities.length === cities.length) {
    return false; // No city was removed, ID not found
  }

  // Write the updated list back to the file
  await this.write(updatedCities);
  return true; // City was successfully removed
  }
}

export default new HistoryService();