const PRODUCT_NAME_TE: Record<string, string> = {
  "Full Cream Milk": "ఫుల్ క్రీమ్ పాలు (Paalu)",
  "Toned Milk": "టోన్డ్ పాలు",
  "Skimmed Milk": "స్కిమ్డ్ పాలు",
  "Double Toned Milk": "డబుల్ టోన్డ్ పాలు",
  "Buttermilk": "మజ్జిగ",
  "Curd": "పెరుగు",
  "Paneer": "పనీర్",
  "Ghee": "నెయ్యి",
  "Farm Fresh Eggs": "తాజా గుడ్లు",
  "Rice": "బియ్యం",
  "Wheat Flour": "గోధుమ పిండి",
  "Sugar": "చెక్కెర",
  "Salt": "ఉప్పు",
  "Black Gram": "మినుములు (Minumulu)",
  "Bengal Gram": "సెనగలు (Senagalu)",
  "Green Gram": "పెసలు (Pesalu)",
  "Toor Dal": "కందిపప్పు",
  "Moong Dal": "పెసర పప్పు",
  "Chana Dal": "సెనగపప్పు",
  "Urad Dal": "మినపప్పు",
  "Masoor Dal": "మసూర్ పప్పు",
  "Lentils": "పప్పులు",
  "Cooking Oil": "వంట నూనె",
  "Mustard Oil": "ఆవ నూనె",
  "Groundnut Oil": "వేరుసెనగ నూనె",
  "Coconut Oil": "కొబ్బరి నూనె",
  "Tomatoes": "టమాటాలు",
  "Organic Tomatoes": "సేంద్రియ టమాటాలు",
  "Potatoes": "బంగాళాదుంపలు",
  "Onions": "ఉల్లిపాయలు",
  "Carrots": "క్యారెట్లు",
  "Spinach": "పాలకూర",
  "Bananas": "అరటిపండ్లు",
  "Apples": "ఆపిల్స్",
  "Mango Juice": "మామిడి జ్యూస్",
  "Mineral Water": "మినరల్ వాటర్",
  "Potato Chips": "బంగాళాదుంప చిప్స్",
  "Biscuits": "బిస్కెట్లు",
  "White Bread": "వైట్ బ్రెడ్",
  "Brown Bread": "బ్రౌన్ బ్రెడ్",
};

const CATEGORY_NAME_TE: Record<string, string> = {
  "Fruits & Vegetables": "పండ్లు & కూరగాయలు",
  "Dairy & Eggs": "పాల ఉత్పత్తులు & గుడ్లు",
  "Bakery": "బేకరీ",
  "Beverages": "పానీయాలు",
  "Snacks": "స్నాక్స్",
  "Staples": "అవసర కిరాణా",
  "Personal Care": "వ్యక్తిగత సంరక్షణ",
  "Household": "గృహ అవసరాలు",
  "Grains & Pulses": "ధాన్యాలు & పప్పులు",
};

function normalizeLocale(locale: string | undefined): string {
  return locale === "te" ? "te" : "en";
}

export function localizeProductName(name: string, locale: string | undefined): string {
  if (normalizeLocale(locale) !== "te") return name;
  return PRODUCT_NAME_TE[name] ?? name;
}

export function localizeCategoryName(name: string, locale: string | undefined): string {
  if (normalizeLocale(locale) !== "te") return name;
  return CATEGORY_NAME_TE[name] ?? name;
}
