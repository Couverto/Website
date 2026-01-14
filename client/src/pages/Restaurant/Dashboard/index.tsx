import { useParams } from "react-router-dom";

export const RestaurantDashboard = () => {
  const { id } = useParams();
  return (
    <div>
      <h1 className="text-3xl font-bold">Restaurant Dashboard</h1>
      <p>Restaurant ID: {id}</p>
      <p className="mt-4 text-muted-foreground">Modules coming soon (Bookings, Settings, Menu, etc.)</p>
    </div>
  );
};
