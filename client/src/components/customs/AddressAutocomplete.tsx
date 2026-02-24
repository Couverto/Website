import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { MapPin, Loader2, X } from "lucide-react";
import debounce from "lodash.debounce";
import axios from "axios";
import { cn } from "@/lib/utils";

interface AddressFeature {
  properties: {
    label: string;
    city: string;
    postcode: string;
    context: string;
  };
  geometry: {
    coordinates: [number, number];
  };
}

interface AddressAutocompleteProps {
  value?: string;
  onChange: (value: string) => void;
  onSelect: (data: { address: string; city: string; zipcode: string; coordinates?: [number, number] }) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  searchType?: "address" | "municipality";
  onValidityChange?: (isValid: boolean) => void;
}

export const AddressAutocomplete = ({
  value = "",
  onChange,
  onSelect,
  placeholder = "Rechercher une adresse...",
  className,
  error,
  searchType = "address",
  onValidityChange,
}: AddressAutocompleteProps) => {
  const [inputValue, setInputValue] = useState(value);
  const [suggestions, setSuggestions] = useState<AddressFeature[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const searchAddress = async (query: string) => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery || trimmedQuery.length < 3) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      let url = `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(trimmedQuery)}&limit=5`;
      if (searchType === "municipality") {
        url += "&type=municipality";
      }
      const response = await axios.get(url);
      setSuggestions(response.data.features);
      setIsOpen(true);
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = useRef(debounce(searchAddress, 300)).current;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    setInputValue(newVal);
    onChange(newVal);
    if (onValidityChange) onValidityChange(false);
    debouncedSearch(newVal);
  };

  const handleSelect = (feature: AddressFeature) => {
    const { label, city, postcode } = feature.properties;
    const { coordinates } = feature.geometry;

    setInputValue(label);
    setIsOpen(false);

    if (onValidityChange) onValidityChange(true);

    // Call onSelect with parsed data
    onSelect({
      address: label,
      city,
      zipcode: postcode,
      coordinates: coordinates,
    });
  };

  const clearInput = () => {
    setInputValue("");
    onChange("");
    if (onValidityChange) onValidityChange(false);
    setSuggestions([]);
    setIsOpen(false);
  };

  return (
    <div ref={wrapperRef} className={cn("relative", className)}>
      <div className="relative group">
        <MapPin
          className={cn(
            "absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 transition-colors",
            error ? "text-red-400" : "text-muted-foreground group-focus-within:text-primary",
          )}
        />
        <Input
          value={inputValue}
          onChange={handleInputChange}
          placeholder={placeholder}
          className={cn("pl-10 pr-10", error && "border-red-500 bg-red-50/30 focus-visible:ring-red-500")}
          autoComplete="off"
        />
        {loading ? (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        ) : inputValue ? (
          <button
            type="button"
            onClick={clearInput}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>

      {isOpen && suggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-popover text-popover-foreground rounded-md border shadow-md animate-in fade-in-0 zoom-in-95">
          <ul className="py-1 max-h-60 overflow-auto">
            {suggestions.map((feature, index) => (
              <li
                key={index}
                onClick={() => handleSelect(feature)}
                className="px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors text-sm"
              >
                <div className="font-medium">{feature.properties.label}</div>
                <div className="text-xs text-muted-foreground">{feature.properties.context}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
