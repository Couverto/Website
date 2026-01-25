import { Umbrella, Wifi, Accessibility, Beer, Wind, Car, Dog, CreditCard, Banknote, Smartphone, Ticket, StickyNote } from "lucide-react";

export const CUISINES = [
  "Française",
  "Italienne",
  "Japonaise",
  "Chinoise",
  "Indienne",
  "Mexicaine",
  "Américaine",
  "Méditerranéenne",
  "Végétarienne",
  "Vegan",
  "Bistrot",
  "Gastronomique",
  "Fast Food",
  "Brasserie",
];

export const PRICES = [
  { id: "vlow", value: "$" },
  { id: "low", value: "$$" },
  { id: "medium", value: "$$$" },
  { id: "high", value: "$$$$" },
  { id: "vhigh", value: "$$$$$" },
];

export const FEATURES_LIST = [
  { id: "terrace", value: "Terrasse", icon: Umbrella },
  { id: "wifi", value: "Wifi", icon: Wifi },
  { id: "accessible", value: "Accès PMR", icon: Accessibility },
  { id: "bar", value: "Bar", icon: Beer },
  { id: "air_conditioning", value: "Climatisation", icon: Wind },
  { id: "parking", value: "Parking", icon: Car },
  { id: "pets_allowed", value: "Animaux acceptés", icon: Dog },
];

export const PAYMENT_METHODS = [
  { id: "card", value: "Carte Bancaire", icon: CreditCard },
  { id: "cash", value: "Espèces", icon: Banknote },
  { id: "apple_pay", value: "Apple Pay", icon: Smartphone },
  { id: "google_pay", value: "Google Pay", icon: Smartphone },
  { id: "tickets_restaurant", value: "Tickets Restaurant", icon: Ticket },
  { id: "cheque", value: "Chèque", icon: StickyNote },
  { id: "ancv", value: "Chèque-Vacances (ANCV)", icon: Ticket },
];
