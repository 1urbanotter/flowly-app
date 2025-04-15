// src/main.tsx
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import AuthForm from "./components/AuthForm";
import { useAppStore } from "./store";
import "./index.css";
import { MoonLoader } from "react-spinners";

function Root() {
  const session = useAppStore((state) => state.session);
  const isSessionLoading = useAppStore((state) => state.isSessionLoading);
  const checkSession = useAppStore((state) => state.checkSession);

  useEffect(() => {
    checkSession();
  }, [checkSession]);

  if (isSessionLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="text-center">
          <MoonLoader color="#3b82f6" size={50} />
          <p className="mt-4 text-lg text-gray-600 dark:text-gray-300">
            Verifying session...
          </p>
        </div>
      </div>
    );
  }

  return session ? <App /> : <AuthForm />;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
