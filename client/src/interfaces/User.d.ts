export interface UserInterface {
  _id: string;
  name: string;
  forename: string;
  username: string;
  fullname: string;
  email: string;
  password?: string;
  phone?: string;
  restaurantRole?: string;
  role: string;
  createdAt: Date;
  updatedAt?: Date;
  __v?: number;
  avatar?: string;
  auth_type: string;
}
