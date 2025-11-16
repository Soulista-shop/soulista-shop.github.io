import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useContent } from "@/hooks/useContent";

// Resolve product asset image paths (supports assets and absolute URLs)
const imageModules = import.meta.glob("/src/assets/products/*", { eager: true, as: "url" }) as Record<string, string>;
const resolveImage = (path?: string) => {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("/")) return path;
  const filename = path.split("/").pop()!;
  const match = Object.keys(imageModules).find((k) => k.endsWith(`/${filename}`));
  return match ? imageModules[match] : path;
};

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { getContent } = useContent();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("featured", true)
        .order("sort_order", { ascending: true })
        .limit(8);
      if (!error) setFeaturedProducts((data || []).map(p => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: Number(p.price),
        discount_price: p.discount_price ? Number(p.discount_price) : undefined,
        images: ((p.images && p.images.length > 0) ? p.images : [p.main_image]).map(resolveImage).filter(Boolean) as string[],
        description: p.description,
      })));
      setLoading(false);
    };
    fetchFeatured();
  }, []);


  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className={`${getContent('hero_slogan').className} mb-6 animate-fade-in text-black`}>
              {getContent('hero_slogan').text}
            </h1>
            <p className={`${getContent('hero_description').className} text-black mb-8 animate-fade-in`}>
              {getContent('hero_description').text}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button 
                size="lg" 
                className="w-full sm:w-auto shadow-elegant"
                onClick={() => { navigate('/shop'); window.scrollTo(0, 0); }}
              >
                Shop Collection
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Link to="/about">
                <Button size="lg" variant="outline" className="w-full sm:w-auto">
                  Our Story
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Pieces</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Carefully curated styles that embody modern elegance
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg"
              onClick={() => { navigate('/shop'); window.scrollTo(0, 0); }}
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      {/* About Preview */}
      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={`${getContent('vision_title').className} mb-6`}>
              {getContent('vision_title').text}
            </h2>
            <p className={`${getContent('vision_description').className} text-muted-foreground mb-8`}>
              {getContent('vision_description').text}
            </p>
            <div className="flex gap-6 justify-center mb-8">
              <a 
                href="https://www.instagram.com/soulista__/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-smooth flex items-center gap-2"
              >
                <Instagram className="h-6 w-6" />
                <span>Follow us on Instagram</span>
              </a>
              <a 
                href="https://www.facebook.com/Soulistaa" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-smooth flex items-center gap-2"
              >
                <Facebook className="h-6 w-6" />
                <span>Like us on Facebook</span>
              </a>
            </div>
            <Link to="/about">
              <Button variant="outline">
                Learn More About Us
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
