import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/ProductCard";
import { ArrowRight, Instagram, Facebook } from "lucide-react";
import { useContent } from "@/hooks/useContent";
import { useFeaturedProducts } from "@/hooks/useProducts";

const Home = () => {
  const { getContent } = useContent();
  const { data: featuredProducts = [], isLoading: loading } = useFeaturedProducts();
  const navigate = useNavigate();

  const featuredTitle = getContent(
    "featured_section_title",
    "Featured Pieces",
    "text-3xl md:text-4xl",
    "font-bold"
  );
  const featuredDescription = getContent(
    "featured_section_description",
    "Meet your go-to summer outfits—colorful, comfy, and made for every summer moment.",
    "text-base",
    "font-sans"
  );

  return (
    <div className="min-h-screen">
      <section className="bg-white py-8 md:py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className={`${getContent("hero_slogan").className} mb-6 animate-fade-in text-black`}>
              {getContent("hero_slogan").text}
            </h1>
            <p className={`${getContent("hero_description").className} text-black mb-8 animate-fade-in`}>
              {getContent("hero_description").text}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in">
              <Button
                size="lg"
                className="w-full sm:w-auto shadow-elegant"
                onClick={() => {
                  navigate("/shop");
                  window.scrollTo(0, 0);
                }}
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

      <section className="py-4 md:py-6">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className={`${featuredTitle.className} mb-4 text-foreground`}>{featuredTitle.text}</h2>
            <p className={`${featuredDescription.className} text-muted-foreground max-w-2xl mx-auto`}>
              {featuredDescription.text}
            </p>
          </div>
          {loading ? (
            <p className="text-center text-muted-foreground py-8">Loading products...</p>
          ) : (
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                navigate("/shop");
                window.scrollTo(0, 0);
              }}
            >
              View All Products
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>

      <section className="bg-muted py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className={`${getContent("vision_title").className} mb-6`}>
              {getContent("vision_title").text}
            </h2>
            <p className={`${getContent("vision_description").className} text-muted-foreground mb-8`}>
              {getContent("vision_description").text}
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
