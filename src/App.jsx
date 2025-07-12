import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "react-hot-toast";

const App = () => {
  return (
    <div className="min-h-screen flex flex-col">

      <AuthProvider>
        <Toaster/>
        <div className="min-h-32 w-3xs bg-amber-950">Hello</div>
      </AuthProvider>
    </div>
  );
};

export default App;