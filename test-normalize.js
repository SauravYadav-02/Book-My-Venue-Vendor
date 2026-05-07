const input = [ '["Generator","Wi-Fi"]' ];
let amenities = input;
if (Array.isArray(amenities) && amenities.length === 1 && typeof amenities[0] === "string" && amenities[0].startsWith("[")) {
    amenities = JSON.parse(amenities[0]);
}
console.log(amenities);
