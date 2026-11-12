// One shared shape for a product. The card, the grid, search and the cart all use this.
export interface Product {
  id: string; // unique, used for the product page link and as the list key
  name: string;
  description: string;
  price: number; // current price in whole naira, e.g. 8500. The card formats it as ₦8,500
  oldPrice?: number; // the REAL previous price. When it is higher than price, the card shows it slashed
  stock: number; // how many are left (this is NOT the cart quantity)
  rating: number; // 0 to 5, from buyer reviews
  sold: number; // how many have been sold
  image: string; // picture URL
  category?: string; // used by search and the Suggested picks links
  verified?: boolean; // true ONLY after Fimba Go has checked the product
  quality?: number; // 0 to 100, Fimba Go's own inspection score. Leave out if not inspected
}
