const fs = require('fs');

function applyTranslations(filePath, translationsMap) {
  let content = fs.readFileSync(filePath, 'utf8');
  let changed = false;

  for (const [original, translated] of Object.entries(translationsMap)) {
    const regex1 = new RegExp(`>\\s*${original}\\s*<`, 'g');
    if (regex1.test(content)) {
      content = content.replace(regex1, `>{t('${original}')}<`);
      changed = true;
    }
    
    // Also look for placeholder=""
    const regex2 = new RegExp(`placeholder="${original}"`, 'g');
    if (regex2.test(content)) {
      content = content.replace(regex2, `placeholder={t('${original}')}`);
      changed = true;
    }

    // Look for string literals that might be used
    const regex3 = new RegExp(`(?<!t\\()('${original}'|"${original}")(?!\\))`, 'g');
    if (regex3.test(content)) {
      // Need to be careful with this one, might replace things we don't want
      // Only run it manually
    }
  }

  // Ensure t is used if not imported
  if (changed && !content.includes('useTranslation')) {
    content = "import { useTranslation } from 'react-i18next';\n" + content;
  }
  
  if (changed) {
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}

const travelTranslations = {
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
  "Clear Filters": "Clear Filters"
};

const tutorTranslations = {
  "Expert Tutors": "Expert Tutors",
  "Find the perfect tutor to help you achieve your goals": "Find the perfect tutor to help you achieve your goals",
  "Top Rated Tutors": "Top Rated Tutors",
  "Popular Subjects": "Popular Subjects",
  "No tutors found": "No tutors found",
  "Try adjusting your search or filters": "Try adjusting your search or filters",
  "All Subjects": "All Subjects",
  "Mathematics": "Mathematics",
  "Science": "Science",
  "Languages": "Languages",
  "Music": "Music",
  "Arts": "Arts",
  "Any Rating": "Any Rating",
  "4.5\\+ Stars": "4.5+ Stars",
  "4.0\\+ Stars": "4.0+ Stars",
  "3.0\\+ Stars": "3.0+ Stars",
  "Any Time": "Any Time",
  "Weekdays": "Weekdays",
  "Weekends": "Weekends",
  "Evenings": "Evenings",
  "Morning": "Morning",
  "Clear Filters": "Clear Filters",
  "Search tutors...": "Search tutors...",
  "Minimum Rating": "Minimum Rating",
  "Availability": "Availability",
  "Price Range": "Price Range"
};

const marketplaceTranslations = {
  "Marketplace": "Marketplace",
  "Discover products from local vendors": "Discover products from local vendors",
  "Featured Products": "Featured Products",
  "Popular Categories": "Popular Categories",
  "All Categories": "All Categories",
  "Electronics": "Electronics",
  "Clothing": "Clothing",
  "Food": "Food",
  "Services": "Services",
  "No products found": "No products found",
  "Try adjusting your search or filters": "Try adjusting your search or filters",
  "Search products...": "Search products...",
  "Price Range": "Price Range",
  "Clear Filters": "Clear Filters"
};

applyTranslations('src/pages/Travel.tsx', travelTranslations);
applyTranslations('src/pages/Tutoring.tsx', tutorTranslations);
applyTranslations('src/pages/Marketplace.tsx', marketplaceTranslations);
