import type { Product } from "@/types";
import { getProductImage } from "@/lib/product-images";

const CATEGORIES = [
  { id: "cat-1", name: "Fruits & Vegetables" },
  { id: "cat-2", name: "Dairy & Eggs" },
  { id: "cat-3", name: "Bakery" },
  { id: "cat-4", name: "Beverages" },
  { id: "cat-5", name: "Snacks" },
  { id: "cat-6", name: "Staples" },
  { id: "cat-7", name: "Personal Care" },
  { id: "cat-8", name: "Household" },
  { id: "cat-9", name: "Grains & Pulses" },
] as const;

const NAMES_BY_CATEGORY: Record<string, string[]> = {
  "cat-1": [
    "Organic Tomatoes", "Alphonso Mangoes", "Broccoli", "Carrots", "Spinach", "Potatoes", "Onions", "Apples", "Bananas", "Capsicum",
    "Cucumber", "Lemon", "Cauliflower", "Green Beans", "Cabbage", "Peas", "Garlic", "Ginger", "Pumpkin", "Brinjal",
    "Lady Finger", "Radish", "Beetroot", "Sweet Potato", "Papaya", "Watermelon", "Muskmelon", "Pomegranate", "Grapes", "Orange",
    "Kiwi", "Strawberry", "Blueberry", "Pear", "Plum", "Peach", "Cherry", "Coconut", "Dragon Fruit", "Avocado",
    "Lime", "Coriander", "Mint", "Curry Leaves", "Fenugreek", "Drumstick", "Bottle Gourd", "Ridge Gourd", "Snake Gourd", "Taro",
    "Colocasia", "Yam", "Turnip", "Bok Choy", "Zucchini", "Bell Pepper Yellow", "Bell Pepper Red",
  ],
  "cat-2": [
    "Full Cream Milk", "Toned Milk", "Curd", "Farm Fresh Eggs", "Butter", "Cheese Slice", "Paneer", "Ghee", "Skimmed Milk", "Double Toned Milk",
    "Lassi", "Cheese Cube", "Mozzarella", "Cheddar", "Cream", "Condensed Milk", "Milk Powder", "Egg White", "Quail Eggs", "Duck Eggs",
    "Cottage Cheese", "Ricotta", "Sour Cream", "Whipping Cream", "Yogurt Drink", "Flavored Milk", "Probiotic Curd", "Greek Yogurt", "Whey", "Buttermilk",
    "Clarified Butter", "Cheese Spread", "Processed Cheese", "Goat Cheese", "Feta", "Cream Cheese", "Ice Cream Base", "Malai", "Khoa", "Rasmalai Pack",
    "Gulab Jamun Mix", "Peda", "Milk Cake", "Kalakand", "Fresh Paneer", "Tofu", "Soy Milk", "Almond Milk", "Oat Milk", "Coconut Milk",
    "Vegan Butter", "Margarine", "Low Fat Cheese", "Egg Replacer", "Lactose Free Milk",
  ],
  "cat-3": [
    "White Bread", "Brown Bread", "Croissant", "Muffin", "Rusk", "Bun", "Multigrain Bread", "Whole Wheat Bread", "Garlic Bread", "Pav",
    "Bagel", "Donut", "Cake Slice", "Cookies", "Cinnamon Roll", "Danish Pastry", "Baguette", "Sourdough", "Brioche", "English Muffin",
    "Tortilla", "Naan", "Kulcha", "Paratha", "Roti", "Thepla", "Puri", "Bhatura", "Pav Bhaji Bread", "Sandwich Bread",
    "Hamburger Bun", "Hot Dog Bun", "Pita Bread", "Lavash", "Focaccia", "Ciabatta", "Pretzel", "Waffle", "Pancake Mix", "Crepe",
    "Banana Bread", "Zucchini Bread", "Corn Bread", "Rye Bread", "Soda Bread", "Flatbread", "Chapati", "Phulka", "Rumali Roti", "Tandoori Roti",
    "Breadstick", "Croutons", "Bread Crumbs", "Pizza Base", "Burger Patty Bun", "Sub Roll",
  ],
  "cat-4": [
    "Mineral Water", "Orange Juice", "Cold Coffee", "Green Tea", "Cola", "Energy Drink", "Lemonade", "Coconut Water", "Masala Chai", "Fruit Punch",
    "Apple Juice", "Mango Juice", "Grape Juice", "Cranberry Juice", "Pineapple Juice", "Tomato Juice", "Mixed Fruit Juice", "Sweet Lime", "Guava Juice", "Pomegranate Juice",
    "Iced Tea", "Black Tea", "White Tea", "Oolong Tea", "Herbal Tea", "Ginger Tea", "Tulsi Tea", "Earl Grey", "Espresso", "Cappuccino",
    "Latte", "Americano", "Hot Chocolate", "Malt Drink", "Health Drink", "Electrolyte", "Sports Drink", "Soda", "Tonic Water", "Sparkling Water",
    "Flavored Water", "Vitamin Water", "Aloe Vera Drink", "Buttermilk", "Lassi Sweet", "Lassi Salted", "Sugarcane Juice", "Tender Coconut", "Kokum", "Aam Panna",
    "Sharbat", "Rose Milk", "Badam Milk", "Thandai", "Smoothie Mix", "Mocktail Mix",
  ],
  "cat-5": [
    "Potato Chips", "Chocolate", "Biscuits", "Namkeen", "Popcorn", "Dry Fruits", "Nuts", "Cake", "Candy", "Wafer",
    "Kurkure", "Bingo", "Lays", "Cheetos", "Pringles", "Doritos", "Tortilla Chips", "Pretzels", "Crackers", "Rice Cakes",
    "Granola Bar", "Energy Bar", "Protein Bar", "Muesli", "Oat Bar", "Nut Bar", "Date Bar", "Cereal", "Corn Flakes", "Muesli",
    "Chocos", "Kellogg's", "Honey Loops", "Choco Fills", "Marshmallow", "Gummy Bears", "Jelly", "Toffee", "Lollipop", "Chocolate Bar",
    "Dark Chocolate", "White Chocolate", "Nut Chocolate", "Truffle", "Fudge", "Halwa", "Ladoo", "Kaju Katli", "Soan Papdi", "Mysore Pak",
    "Jalebi", "Rasgulla", "Rasmalai", "Kheer", "Seviyan", "Mithai Box",
  ],
  "cat-6": [
    "Rice", "Wheat Flour", "Lentils", "Cooking Oil", "Sugar", "Salt", "Spices Pack", "Basmati Rice", "Sona Masoori", "Brown Rice",
    "Red Rice", "Poha", "Vermicelli", "Semolina", "Maida", "Besan", "Rice Flour", "Corn Flour", "Ragi Flour", "Jowar Flour",
    "Toor Dal", "Moong Dal", "Chana Dal", "Urad Dal", "Masoor Dal", "Rajma", "Chole", "Kabuli Chana", "White Chana", "Green Moong",
    "Mustard Oil", "Groundnut Oil", "Coconut Oil", "Olive Oil", "Sesame Oil", "Rice Bran Oil", "Blended Oil", "Vanaspati", "Ghee Tin", "Refined Oil",
    "Turmeric", "Red Chilli", "Cumin", "Coriander Powder", "Garam Masala", "Kitchen King", "Pav Bhaji Masala", "Chole Masala", "Sambar Powder", "Rasam Powder",
    "Tamarind", "Jaggery", "Honey", "Vinegar", "Soy Sauce", "Tomato Ketchup",
  ],
  "cat-9": [
    "Black Gram", "Bengal Gram", "Green Gram", "Toor Dal", "Masoor Dal", "Chana Dal", "Moong Dal", "Urad Dal"
  ],
  "cat-7": [
    "Shampoo", "Soap", "Toothpaste", "Hand Sanitizer", "Face Cream", "Body Lotion", "Deodorant", "Razor", "Shaving Cream", "Face Wash",
    "Sunscreen", "Lip Balm", "Moisturizer", "Serum", "Face Pack", "Hair Oil", "Hair Serum", "Conditioner", "Hair Gel", "Comb",
    "Toothbrush", "Mouthwash", "Dental Floss", "Tissue", "Wet Wipes", "Cotton", "Earbuds", "Sanitary Napkin", "Tampon", "Baby Diaper",
    "Baby Wipes", "Baby Lotion", "Baby Powder", "Baby Oil", "Nail Polish", "Nail Remover", "Perfume", "Talc", "Body Spray", "Hand Wash",
    "Detergent", "Fabric Softener", "Bleach", "Scrub", "Loofah", "Bath Sponge", "Soap Case", "Toothpaste Dispenser", "Mirror", "Tweezers",
    "Scissors", "Cotton Swabs", "Face Towel", "Hair Clip", "Hair Tie", "Bobby Pins",
  ],
  "cat-8": [
    "Dish Soap", "Tissue Paper", "Trash Bags", "Air Freshener", "Floor Cleaner", "Glass Cleaner", "Toilet Cleaner", "Broom", "Mop", "Dustpan",
    "Sponge", "Scrubber", "Gloves", "Bucket", "Squeezer", "Duster", "Vacuum Bag", "Insecticide", "Mosquito Repellent", "Room Spray",
    "Candle", "Matchbox", "Lighter", "Batteries", "Bulb", "LED Light", "Extension Cord", "Adapter", "Fuse", "Torch",
    "Aluminum Foil", "Cling Wrap", "Baking Paper", "Zipper Bags", "Food Container", "Water Bottle", "Lunch Box", "Thermos", "Ice Tray", "Coaster",
    "Table Mat", "Apron", "Kitchen Towel", "Oven Glove", "Pot Holder", "Shelf Liner", "Drawer Organizer", "Hanger", "Clip", "Hook",
    "Rope", "Tape", "Glue", "Stapler", "Pin", "Rubber Band", "Sticker",
  ],
};

export function generateProducts(): Product[] {
  const out: Product[] = [];
  let globalIndex = 0;
  const createdAt = "2024-01-01T10:00:00Z";

  CATEGORIES.forEach((cat) => {
    const names = NAMES_BY_CATEGORY[cat.id] ?? [];
    const count = Math.max(55, names.length);
    for (let i = 0; i < count; i++) {
      globalIndex++;
      const name = names[i] ?? `${cat.name} Item ${i + 1}`;
      const price = 25 + (i % 20) * 8 + (globalIndex % 7) * 5;
      out.push({
        id: `p${globalIndex}`,
        name,
        description: `Fresh ${name.toLowerCase()}`,
        price,
        originalPrice: i % 5 === 0 ? price + 15 : undefined,
        image: getProductImage(cat.id, i),
        categoryId: cat.id,
        categoryName: cat.name,
        stock: 50 + (i % 80),
        unit: i % 3 === 0 ? "kg" : i % 3 === 1 ? "pack" : "pc",
        createdAt,
        upcoming: false,
      });
    }
  });

  // Mark 12 products as upcoming (like BookMyShow "coming soon" - admin can add more)
  const upcomingIds = new Set(["p1", "p60", "p115", "p170", "p225", "p280", "p335", "p390", "p55", "p110", "p165", "p220"]);
  out.forEach((p) => {
    if (upcomingIds.has(p.id)) {
      p.upcoming = true;
      p.stock = 0;
    }
  });

  return out;
}
