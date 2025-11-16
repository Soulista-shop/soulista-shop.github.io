import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Users } from "lucide-react";
import { useContent } from "@/hooks/useContent";

const About = () => {
  const { getContent } = useContent();
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="gradient-hero pt-20 md:pt-32 pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className={`${getContent('about_title').className} mb-6`}>
              {getContent('about_title').text}
            </h1>
            <p className={`${getContent('about_description').className} text-muted-foreground`}>
              {getContent('about_description').text}
            </p>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="pt-4 md:pt-6 pb-8 md:pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className={`${getContent('mission_title').className} mb-8 text-center`}>
              {getContent('mission_title').text}
            </h2>
            <p className={`${getContent('mission_description').className} text-muted-foreground text-center mb-12`}>
              {getContent('mission_description').text}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Heart className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Made with Love</h3>
                <p className="text-muted-foreground">
                  Every piece is carefully crafted with attention to detail and quality
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary/30 mb-4">
                  <Sparkles className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Timeless Style</h3>
                <p className="text-muted-foreground">
                  Classic designs that remain relevant season after season
                </p>
              </div>

              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                  <Users className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Community First</h3>
                <p className="text-muted-foreground">
                  Building a community of confident, empowered women
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="bg-muted pt-8 md:pt-12 pb-16 md:pb-24">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Values</h2>
            <div className="space-y-6 text-lg text-muted-foreground">
              <p>
                <strong className="text-foreground">Quality:</strong> We source premium fabrics and 
                work with skilled artisans to ensure every piece meets our high standards.
              </p>
              <p>
                <strong className="text-foreground">Sustainability:</strong> We're committed to 
                responsible fashion, minimizing our environmental impact at every step.
              </p>
              <p>
                <strong className="text-foreground">Inclusivity:</strong> Fashion is for everyone. 
                We celebrate diversity and create pieces for all body types.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Join Our Journey</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Discover pieces that celebrate your unique style and become part of the Soulista community
            </p>
            <Link to="/shop">
              <Button size="lg" className="shadow-elegant">
                Explore Collection
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
