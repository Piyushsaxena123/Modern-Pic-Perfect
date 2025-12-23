import { Helmet } from "react-helmet-async";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Portfolio from "@/components/Portfolio";
import About from "@/components/About";
import Services from "@/components/Services";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Picperfect | Professional Photography Services</title>
        <meta
          name="description"
          content="Award-winning professional photographer specializing in portraits, weddings, and commercial photography. Capturing moments that last forever."
        />
        <meta
          name="keywords"
          content="photography, portrait photography, wedding photographer, commercial photography, professional photographer"
        />
        <link rel="canonical" href="https://picperfect.com" />
      </Helmet>

      <div className="min-h-screen bg-background text-foreground">
        <Navbar />
        <main>
          <Hero />
          <Portfolio />
          <About />
          <Services />
          <Contact />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
