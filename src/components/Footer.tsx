import { Camera } from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="section-padding !py-12 bg-charcoal-dark border-t border-border">
      <div className="container-wide">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2">
            <Camera className="w-6 h-6 text-primary" />
            <span className="font-display text-xl font-semibold">
              Pic<span className="text-primary">perfect</span>
            </span>
          </a>

          {/* Quick Links */}
          <nav className="flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
            <a href="#home" className="hover:text-primary transition-colors duration-300">
              Home
            </a>
            <a href="#portfolio" className="hover:text-primary transition-colors duration-300">
              Portfolio
            </a>
            <a href="#about" className="hover:text-primary transition-colors duration-300">
              About
            </a>
            <a href="#services" className="hover:text-primary transition-colors duration-300">
              Services
            </a>
            <a href="#contact" className="hover:text-primary transition-colors duration-300">
              Contact
            </a>
          </nav>

          {/* Copyright */}
          <p className="text-sm text-muted-foreground">
            © {currentYear} Picperfect. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
