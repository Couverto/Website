import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link, useParams } from "react-router-dom";
import { RestaurantInterface } from "@/interfaces/Restaurant";

interface RestaurantBreadcrumbProps {
  restaurant: RestaurantInterface | null;
}

export const RestaurantBreadcrumb = ({ restaurant }: RestaurantBreadcrumbProps) => {
  const location = useLocation();
  const { id } = useParams();

  // Map paths to translation keys
  const getPageTitle = (pathname: string) => {
    if (pathname.includes("/dashboard")) return "Tableau de bord";
    if (pathname.includes("/bookings")) return "Réservations";
    if (pathname.includes("/clients")) return "Clients";
    if (pathname.includes("/collaborators")) return "Collaborateurs";
    if (pathname.includes("/stats")) return "Statistiques";
    if (pathname.includes("/settings")) return "Paramètres";
    return "";
  };

  const pageTitle = getPageTitle(location.pathname);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem className="hidden md:block">
          <BreadcrumbLink asChild>
            <Link to={`/restaurant/${id}/dashboard`}>{restaurant?.name || "Restaurant"}</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pageTitle && (
          <>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>{pageTitle}</BreadcrumbPage>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
};
