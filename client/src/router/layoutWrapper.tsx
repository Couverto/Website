import { Outlet } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

interface LayoutWrapperProps {
  withLayout?: boolean;
}

export const LayoutWrapper = ({ withLayout = true }: LayoutWrapperProps) => {
  return (
    <>
      {withLayout && <Navbar />}
      <Outlet />
      {withLayout && <Footer />}
    </>
  );
};
