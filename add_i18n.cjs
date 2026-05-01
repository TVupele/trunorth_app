const fs = require('fs');

const file = 'src/i18n.ts';
let code = fs.readFileSync(file, 'utf8');

const enStrings = {
  "Travel Packages": "Travel Packages",
  "Discover amazing destinations and book your next adventure": "Discover amazing destinations and book your next adventure",
  "Featured Destinations": "Featured Destinations",
  "Popularity": "Popularity",
  "Price": "Price",
  "Rating": "Rating",
  "Price Range": "Price Range",
  "No packages found": "No packages found",
  "Try adjusting your search or filters": "Try adjusting your search or filters",
  "Package Highlights": "Package Highlights",
  "Price per person": "Price per person",
  "Travelers": "Travelers",
  "Total Amount": "Total Amount",
  "Search destinations...": "Search destinations...",
  "Sort by": "Sort by",
  "Filters": "Filters",
  "Clear Filters": "Clear Filters",
  "Expert Tutors": "Expert Tutors",
  "Find the perfect tutor to help you achieve your goals": "Find the perfect tutor to help you achieve your goals",
  "Top Rated Tutors": "Top Rated Tutors",
  "Popular Subjects": "Popular Subjects",
  "No tutors found": "No tutors found",
  "All Subjects": "All Subjects",
  "Mathematics": "Mathematics",
  "Science": "Science",
  "Languages": "Languages",
  "Music": "Music",
  "Arts": "Arts",
  "Any Rating": "Any Rating",
  "4.5+ Stars": "4.5+ Stars",
  "4.0+ Stars": "4.0+ Stars",
  "3.0+ Stars": "3.0+ Stars",
  "Any Time": "Any Time",
  "Weekdays": "Weekdays",
  "Weekends": "Weekends",
  "Evenings": "Evenings",
  "Morning": "Morning",
  "Search tutors...": "Search tutors...",
  "Minimum Rating": "Minimum Rating",
  "Availability": "Availability",
  "Discover products from local vendors": "Discover products from local vendors",
  "Popular Categories": "Popular Categories",
  "All Categories": "All Categories",
  "Electronics": "Electronics",
  "Clothing": "Clothing",
  "Food": "Food",
  "Services": "Services",
  "No products found": "No products found",
  "Search products...": "Search products...",
  "Marketplace": "Marketplace"
};

const haStrings = {
  "Travel Packages": "Fakitin Tafiya",
  "Discover amazing destinations and book your next adventure": "Gano wurare masu ban mamaki kuma kuyi ajiyar sabuwar tafiya",
  "Featured Destinations": "Wurare da aka fi so",
  "Popularity": "Shahararri",
  "Price": "Farashi",
  "Rating": "Kima",
  "Price Range": "Tsakanin Farashi",
  "No packages found": "Ba a samu fakitin ba",
  "Try adjusting your search or filters": "Gwada canza binciken ku ko tacewa",
  "Package Highlights": "Muhimman abubuwa a fakitin",
  "Price per person": "Farashi ga kowane mutum",
  "Travelers": "Masu tafiya",
  "Total Amount": "Jimlar Kuɗi",
  "Search destinations...": "Bincika wurare...",
  "Sort by": "Tsara da",
  "Filters": "Tace",
  "Clear Filters": "Cire Tacewa",
  "Expert Tutors": "Malaman Kwararru",
  "Find the perfect tutor to help you achieve your goals": "Nemo cikakken malami don taimaka muku cimma burin ku",
  "Top Rated Tutors": "Malaman da aka fi yaba wa",
  "Popular Subjects": "Darussan da aka fi so",
  "No tutors found": "Ba a samu malamai ba",
  "All Subjects": "Duk Darussan",
  "Mathematics": "Lissafi",
  "Science": "Kimiyya",
  "Languages": "Harsuna",
  "Music": "Waƙa",
  "Arts": "Zane",
  "Any Rating": "Kowace Kima",
  "4.5+ Stars": "Taurari 4.5+",
  "4.0+ Stars": "Taurari 4.0+",
  "3.0+ Stars": "Taurari 3.0+",
  "Any Time": "Kowane Lokaci",
  "Weekdays": "Ranakun aiki",
  "Weekends": "Karshen mako",
  "Evenings": "Yamma",
  "Morning": "Safiya",
  "Search tutors...": "Bincika malamai...",
  "Minimum Rating": "Kima Mafi Kankanta",
  "Availability": "Kasancewa",
  "Discover products from local vendors": "Gano kayayyaki daga masu sayarwa na gida",
  "Popular Categories": "Rukunan da aka fi so",
  "All Categories": "Duk Rukunan",
  "Electronics": "Kayan lantarki",
  "Clothing": "Tufafi",
  "Food": "Abinci",
  "Services": "Ayyuka",
  "No products found": "Ba a samu kayayyaki ba",
  "Search products...": "Bincika kayayyaki...",
  "Marketplace": "Shagon Kayayya"
};

// Use a simple split approach since Regex is tricky across lines
let parts = code.split(/"Connect & share": "Connect & share"/);
if (parts.length === 2) {
  let newEn = '';
  for (let key in enStrings) {
    if (!parts[0].includes(`"${key}":`)) {
      newEn += `"${key}": "${enStrings[key]}",\n      `;
    }
  }
  code = parts[0] + newEn + `"Connect & share": "Connect & share"` + parts[1];
}

let partsHa = code.split(/"Connect & share": "Huda da raba"/);
if (partsHa.length === 2) {
  let newHa = '';
  for (let key in haStrings) {
    if (!partsHa[0].includes(`"${key}":`)) {
      newHa += `"${key}": "${haStrings[key]}",\n      `;
    }
  }
  code = partsHa[0] + newHa + `"Connect & share": "Huda da raba"` + partsHa[1];
}

fs.writeFileSync(file, code);
console.log("i18n updated successfully.");
