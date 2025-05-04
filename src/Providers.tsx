import { Outlet } from "react-router-dom";
import { SessionProvider } from "./context/SessionContext";
import { ThemeProvider } from "./components/theme-provider";

const Providers = () => {
  return (
    <SessionProvider>
      <ThemeProvider
        defaultTheme="dark"
        storageKey="react-supabase-shadcn-auth-template"
      >
        <Outlet />
      </ThemeProvider>
    </SessionProvider>
  );
};

export default Providers;
