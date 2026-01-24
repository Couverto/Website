import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { useLocation, Link, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RestaurantInterface } from "@/interfaces/Restaurant";

interface RestaurantBreadcrumbProps {
  restaurant: RestaurantInterface | null;
}

export const RestaurantBreadcrumb = ({ restaurant }: RestaurantBreadcrumbProps) => {
  const { t } = useTranslation();
  const location = useLocation();
  const { id } = useParams();

  // Map paths to translation keys
  const getPageTitle = (pathname: string) => {
    if (pathname.includes("/dashboard")) return t("pages.restaurant.nav.dashboard");
    if (pathname.includes("/bookings")) return t("pages.restaurant.nav.bookings");
    if (pathname.includes("/clients")) return t("pages.restaurant.nav.clients");
    if (pathname.includes("/collaborators")) return t("pages.restaurant.nav.collaborators");
    if (pathname.includes("/stats")) return t("pages.restaurant.nav.stats") || "Statistiques";
    if (pathname.includes("/settings")) return t("pages.restaurant.nav.settings");
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
