import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface LayoutWrapperProps {
  withLayout?: boolean;
}

export const LayoutWrapper = ({ withLayout = true }: LayoutWrapperProps) => {
  return (
    <div className="flex flex-col min-h-screen">
      {withLayout && <Navbar />}
      <main className="flex-1">
        <Outlet />
      </main>
      {withLayout && <Footer />}
    </div>
  );
};
