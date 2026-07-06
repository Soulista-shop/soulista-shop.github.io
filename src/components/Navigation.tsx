import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, LogIn, LogOut, Shield } from "lucide-react";
import { useState, useMemo } from "react";
import { Button } from "./ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useContent } from "@/hooks/useContent";

export const Navigation = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { content } = useContent();
  const logoSize = useMemo(() => {
    const raw = parseInt(content.logo_size?.text_content ?? "16", 10);
    return Number.isFinite(raw) ? raw * 4 : 64;
  }, [content.logo_size?.text_content]);
  const location = useLocation();
  const { user, isAdmin, signOut } = useAuth();
  const { itemCount } = useCart();

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Shop", path: "/shop" },
    { name: "About", path: "/about" },
    { name: "Contact", path: "/contact" },
    { name: "Instapay", path: "/instapay" },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur-md border-b border-border shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Soulista Logo - Left */}
          <Link to="/" className="flex items-center leading-none">
            <img 
              src="/logo.png" 
              alt="Soulista" 
              className="w-auto"
              style={{ height: `${logoSize}px` }}
            />
          </Link>

          {/* Desktop Navigation - Right */}
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`text-sm font-medium transition-smooth hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin">
                <Button variant="outline" size="sm">
                  <Shield className="mr-2 h-4 w-4" />
                  Admin
                </Button>
              </Link>
            )}
            <Link to="/cart">
              <Button variant="outline" size="icon" className="relative">
                <ShoppingBag className="h-5 w-5" />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>
            {user ? (
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            ) : (
              <Link to="/auth">
                <Button variant="ghost" size="sm">
                  <LogIn className="mr-2 h-4 w-4" />
                  Login
                </Button>
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 text-foreground hover:text-primary transition-smooth"
          >
            {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4 animate-fade-in space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setIsOpen(false)}
                className={`block py-2 text-sm font-medium transition-smooth hover:text-primary ${
                  isActive(link.path) ? "text-primary" : "text-foreground"
                }`}
              >
                {link.name}
              </Link>
            ))}
            {isAdmin && (
              <Link to="/admin" onClick={() => setIsOpen(false)}>
                <div className="py-2 text-sm font-medium text-foreground hover:text-primary">
                  <Shield className="inline mr-2 h-4 w-4" />
                  Admin
                </div>
              </Link>
            )}
            <Link to="/cart" onClick={() => setIsOpen(false)}>
              <div className="py-2 text-sm font-medium text-foreground hover:text-primary">
                <ShoppingBag className="inline mr-2 h-4 w-4" />
                Cart {itemCount > 0 && `(${itemCount})`}
              </div>
            </Link>
            {user ? (
              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                className="py-2 text-sm font-medium text-foreground hover:text-primary w-full text-left"
              >
                <LogOut className="inline mr-2 h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link to="/auth" onClick={() => setIsOpen(false)}>
                <div className="py-2 text-sm font-medium text-foreground hover:text-primary">
                  <LogIn className="inline mr-2 h-4 w-4" />
                  Login
                </div>
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};
