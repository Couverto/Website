import { Router } from "./router/routes.js";
import { useAuthContext } from "./contexts/authContext.js";
import { Loading } from "./components/customs/loading.js";
import "./styles/index.css";
import { useAxiosInterceptor } from "./hooks/useAxiosInterceptors.js";
import { ScrollToTop } from "./components/ScrollToTop.js";

function App() {
  const { loading } = useAuthContext();
  useAxiosInterceptor();

  if (loading) {
    return <Loading />;
  }

  return (
    <>
      <ScrollToTop />
      <Router />
    </>
  );
}

export default App;
