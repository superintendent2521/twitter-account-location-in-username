// Country name to flag emoji mapping
const COUNTRY_FLAGS = {
  "Afghanistan": "🇦🇫",
  "Albania": "🇦🇱",
  "Algeria": "🇩🇿",
  "Argentina": "🇦🇷",
  "Australia": "🇦🇺",
  "Austria": "🇦🇹",
  "Bangladesh": "🇧🇩",
  "Belgium": "🇧🇪",
  "Brazil": "🇧🇷",
  "Canada": "🇨🇦",
  "Chile": "🇨🇱",
  "China": "🇨🇳",
  "Colombia": "🇨🇴",
  "Czech Republic": "🇨🇿",
  "Denmark": "🇩🇰",
  "Egypt": "🇪🇬",
  "Europe": "🇪🇺",
  "Finland": "🇫🇮",
  "France": "🇫🇷",
  "Germany": "🇩🇪",
  "Greece": "🇬🇷",
  "Hong Kong": "🇭🇰",
  "Hungary": "🇭🇺",
  "India": "🇮🇳",
  "Indonesia": "🇮🇩",
  "Iran": "🇮🇷",
  "Iraq": "🇮🇶",
  "Ireland": "🇮🇪",
  "Israel": "🇮🇱",
  "Italy": "🇮🇹",
  "Japan": "🇯🇵",
  "Kenya": "🇰🇪",
  "Malaysia": "🇲🇾",
  "Mexico": "🇲🇽",
  "Netherlands": "🇳🇱",
  "New Zealand": "🇳🇿",
  "Nigeria": "🇳🇬",
  "Norway": "🇳🇴",
  "Pakistan": "🇵🇰",
  "Philippines": "🇵🇭",
  "Poland": "🇵🇱",
  "Portugal": "🇵🇹",
  "Romania": "🇷🇴",
  "Russia": "🇷🇺",
  "Saudi Arabia": "🇸🇦",
  "Singapore": "🇸🇬",
  "South Africa": "🇿🇦",
  "Korea": "🇰🇷",
  "South Korea": "🇰🇷",
  "Spain": "🇪🇸",
  "Sweden": "🇸🇪",
  "Switzerland": "🇨🇭",
  "Taiwan": "🇹🇼",
  "Thailand": "🇹🇭",
  "Turkey": "🇹🇷",
  "Ukraine": "🇺🇦",
  "United Arab Emirates": "🇦🇪",
  "United Kingdom": "🇬🇧",
  "United States": "🇺🇸",
  "Venezuela": "🇻🇪",
  "Vietnam": "🇻🇳"
};

// Normalize common abbreviations/aliases to canonical country names
const COUNTRY_ALIASES = {
  "US": "United States",
  "USA": "United States",
  "UNITEDSTATES": "United States",
  "UNITEDSTATESOFAMERICA": "United States",
  "CA": "Canada",
  "CAN": "Canada",
  "UK": "United Kingdom",
  "GB": "United Kingdom",
  "GBR": "United Kingdom",
  "UAE": "United Arab Emirates",
  "SA": "Saudi Arabia",
  "KSA": "Saudi Arabia",
  "AU": "Australia",
  "AUS": "Australia",
  "NZ": "New Zealand",
  "EU": "Europe",
  "EUROPEANUNION": "Europe"
};

function getCountryFlag(countryName) {
  if (!countryName) return null;
  
  // Try exact match first
  if (COUNTRY_FLAGS[countryName]) {
    return COUNTRY_FLAGS[countryName];
  }
  
  // Try alias map (normalize punctuation/spacing)
  const aliasKey = countryName.replace(/[\s\.-]/g, '').toUpperCase();
  if (COUNTRY_ALIASES[aliasKey]) {
    const canonical = COUNTRY_ALIASES[aliasKey];
    return COUNTRY_FLAGS[canonical] || null;
  }
  
  // Try case-insensitive match
  const normalized = countryName.trim();
  for (const [country, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (country.toLowerCase() === normalized.toLowerCase()) {
      return flag;
    }
  }
  
  return null;
}

