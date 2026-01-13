export interface RestaurantInterface {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  adress: string;
  city: string;
  phone: string;
  website?: string;
  coverImage?: string;
  images: string[];
  menu: string[];
  openingHours: Record<string, string>;
  cuisineType: string[];
  priceRange: string;
  rating: number;
  collaborators: string[] | any[]; // IDs or Populated Users
  createdAt: string;
  updatedAt: string;
}
