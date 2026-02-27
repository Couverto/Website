import { Outlet } from "react-router-dom";

export const LegalLayout = () => {
  return (
    <div className="min-h-screen relative overflow-hidden bg-background">
      {/* Background elegant gradient blobs */}
      <div className="absolute top-0 inset-x-0 h-[500px] w-full bg-gradient-to-b from-primary/10 via-primary/5 to-transparent -z-10 pointer-events-none" />
      <div className="absolute -top-[30%] -left-[10%] w-[70%] h-[70%] rounded-full bg-primary/5 blur-3xl -z-10 pointer-events-none" />
      <div className="absolute top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl -z-10 pointer-events-none" />

      <div className="relative py-16 md:py-24">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};
