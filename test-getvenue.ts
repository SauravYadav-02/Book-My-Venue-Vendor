import { getVenueById } from './src/services/venueService.js';
(async () => {
  try {
    const venue = await getVenueById("69f86df444cc897e912fd8eb");
    console.log("Venue amenities:", venue.amenities);
    console.log("Is array?", Array.isArray(venue.amenities));
  } catch (e) {
    console.error(e);
  }
})();
