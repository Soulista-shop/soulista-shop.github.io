import { Link } from "react-router-dom";
import { Instagram, Facebook, Mail } from "lucide-react";
import { SizeChartGuide } from "@/components/SizeChartGuide";

export const Footer = () => {
  return (
    <footer className="bg-muted mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center leading-none mb-4">
              <span className="text-3xl font-brand text-foreground tracking-wide">Soulista</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Modern women's casual wear that combines elegance with comfort.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              📍 Egypt
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">Quick Links</h4>
            <div className="space-y-2">
              <Link to="/shop" className="block text-sm text-muted-foreground hover:text-primary transition-smooth">
                Shop
              </Link>
              <Link to="/about" className="block text-sm text-muted-foreground hover:text-primary transition-smooth">
                About Us
              </Link>
              <Link to="/contact" className="block text-sm text-muted-foreground hover:text-primary transition-smooth">
                Contact
              </Link>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-4">Customer Service</h4>
            <div className="space-y-2">
              <SizeChartGuide variant="footer" label="Size Guide" />
              <p className="text-sm text-muted-foreground">Shipping Info</p>
              <p className="text-sm text-muted-foreground">Returns</p>
            </div>
          </div>

          {/* Connect */}
          <div>
            <h4 className="font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              <a href="https://www.instagram.com/soulista__/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="https://www.facebook.com/Soulistaa" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-smooth">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="mailto:contact@soulista.com" className="text-muted-foreground hover:text-primary transition-smooth">
                <Mail className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © 2024 Soulista. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};
