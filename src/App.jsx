import { Navbar } from "@/layout/Navbar";
import { Hero } from "@/sections/Hero";
import { About } from "@/sections/About";
import { Projects } from "@/sections/Projects";
import { Experience } from "@/sections/Experience";
import { Testimonials } from "@/sections/Testimonials";
import { Contact } from "@/sections/Contact";
import { Footer } from "./layout/Footer";
import { ContentAdmin } from "./pages/ContentAdmin";
import { PortfolioContentProvider } from "./context/PortfolioContentContext.jsx";

function App() {
  return (
    <PortfolioContentProvider>
      {window.location.pathname.replace(/\/+$/, "") === "/admin" ? (
        <ContentAdmin />
      ) : (
        <div className="min-h-screen overflow-x-hidden">
          <Navbar />
          <main>
            <Hero />
            <About />
            <Projects />
            <Experience />
            <Testimonials />
            <Contact />
          </main>
          <Footer />
        </div>
      )}
    </PortfolioContentProvider>
  );
}

export default App;
