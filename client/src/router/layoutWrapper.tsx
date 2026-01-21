import { Outlet, useLocation } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { cn } from "@/lib/utils";

interface LayoutWrapperProps {
  withLayout?: boolean;
}

export const LayoutWrapper = ({ withLayout = true }: LayoutWrapperProps) => {
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  return (
    <div className="flex flex-col min-h-screen">
      {withLayout && <Navbar />}
      <main className={cn("flex-1", withLayout && !isHomePage && "pt-24")}>
        <Outlet />
      </main>
      {withLayout && <Footer />}
    </div>
  );
};
