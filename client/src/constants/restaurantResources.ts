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
  { id: "vlow", value: "$", range: "10€ - 20€", label: "Budget" },
  { id: "low", value: "$$", range: "20€ - 30€", label: "Standard" },
  { id: "medium", value: "$$$", range: "30€ - 40€", label: "Confort" },
  { id: "high", value: "$$$$", range: "40€ - 50€", label: "Premium" },
  { id: "vhigh", value: "$$$$$", range: "50€+", label: "Prestige" },
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
