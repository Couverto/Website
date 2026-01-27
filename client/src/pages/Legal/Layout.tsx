import { Outlet } from "react-router-dom";

export const LegalLayout = () => {
  return (
    <div className="min-h-screen bg-background py-12 md:py-20">
      <div className="container mx-auto max-w-4xl px-4">
        <Outlet />
      </div>
    </div>
  );
};
