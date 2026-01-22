import { RestaurantInterface } from "./Restaurant";
import { UserInterface } from "./User";
import { Plan } from "./Plan";

export interface RestaurantCardProps {
  restaurant: RestaurantInterface;
  filters?: {
    date?: string;
    guests?: string;
  };
}

export interface CuisineSelectorProps {
  value: string[];
  onChange: (value: string[]) => void;
  className?: string;
  variant?: "default" | "compact";
}

export interface RestaurantContext {
  restaurant: RestaurantInterface;
}

export interface BookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  restaurant: RestaurantInterface;
  initialData?: {
    date?: string;
    guests?: string | number;
  };
}

export interface BookingFormProps {
  restaurant: RestaurantInterface;
  onSuccess: () => void;
  initialData?: {
    date?: string;
    guests?: string | number;
  };
}

export interface UserFormProps {
  dialog: (isOpen: boolean) => void;
  refresh: () => void;
  action: string;
  user?: UserInterface;
}

export interface PlanFormProps {
  dialog: (isOpen: boolean) => void;
  refresh: () => void;
  action: string;
  plan?: Plan;
}

export interface PreviewProps {
  data: any; // Using any for WizardData to avoid circular dependency or complex schema import here for now
}

export interface StepProps {
  data: any;
  updateData: (data: Partial<any>) => void;
  errors?: Record<string, string>;
}

export interface InvitationInfo {
  restaurant: {
    _id: string;
    name: string;
    coverImage?: string;
    city: string;
  };
  createdBy: {
    name: string;
    forename: string;
  };
}
