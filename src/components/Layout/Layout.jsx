import React from "react";
import Header from "./Header";
import Footer from "./Footer";

const Layout = ({ children, theme, toggleTheme }) => {
  return (
    <div className="min-h-screen w-full bg-white dark:bg-slate-900 flex flex-col">
      <Header theme={theme} toggleTheme={toggleTheme} />
      <main className="flex-1 w-full bg-white dark:bg-slate-900">
        {children}
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
