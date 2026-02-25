export interface Feature {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
  position: number;
  associatedPages?: string[];
  createdAt: string;
  updatedAt: string;
}
