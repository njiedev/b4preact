import { Link } from "react-router-dom";
import { ChartBar, Rocket, ShieldAlert, User, Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuItem,
  NavigationMenuList,
} from "@/components/ui/navigation-menu";
import { useSession } from "@/context/SessionContext";
import supabase from "@/supabase";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, CirclePlay } from "lucide-react";

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
  icon,
  title,
  description,
}) => {
  return (
    <Card className="transition-shadow duration-300 hover:shadow-lg">
      <CardContent className="pt-6 flex flex-col items-center text-center">
        <div className="p-3 bg-muted rounded-full mb-4">{icon}</div>
        <CardTitle className="mb-2">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardContent>
    </Card>
  );
};

const LandingPage = () => {
  const { session } = useSession();
  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div className="text-2xl font-bold">ACME INC</div>

            {/* Desktop Navigation */}
            <NavigationMenu className="hidden md:flex">
              <NavigationMenuList>
                <NavigationMenuItem></NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-primary-foreground"
            >
              <Menu className="h-6 w-6" />
            </Button>
          </div>
        </div>
      </nav>

      <header className="flex items-center justify-center">
        <div className="max-w-screen-xl w-full mx-auto grid lg:grid-cols-2 gap-12 px-6 py-12">
          <div>
            <Badge className="bg-gradient-to-br via-70% from-primary via-muted/30 to-primary rounded-full py-1 border-none">
              Just released v1.0.0
            </Badge>
            <h1 className="mt-6 max-w-[17ch] text-4xl md:text-5xl lg:text-[2.75rem] xl:text-5xl font-bold !leading-[1.2]">
              Customized Shadcn UI Blocks & Components
            </h1>
            <p className="mt-6 max-w-[60ch] text-lg">
              Explore a collection of Shadcn UI blocks and components, ready to
              preview and copy. Streamline your development workflow with
              easy-to-implement examples.
            </p>
            <div className="mt-12 flex items-center gap-4">
              <Button size="lg" className="rounded-full text-base">
                {session?.user ? (
                  <Button
                    variant="ghost"
                    onClick={() => {
                      supabase.auth.signOut();
                    }}
                  >
                    Sign out
                  </Button>
                ) : (
                  <Link to="/signin">Sign In</Link>
                )}{" "}
                <ArrowUpRight className="!h-5 !w-5" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full text-base shadow-none"
              >
                <CirclePlay className="!h-5 !w-5" /> Watch Demo
              </Button>
            </div>
          </div>
          <div className="w-full aspect-video bg-accent rounded-xl" />
        </div>
      </header>
      {/* Features Section */}
      <section id="features" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            Why Choose Acme Inc?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Rocket size={24} />}
              title="Lightning Fast"
              description="Our solutions are optimized for performance, ensuring you get results quickly."
            />
            <FeatureCard
              icon={<ShieldAlert size={24} />}
              title="Secure & Reliable"
              description="Bank-level security protocols to keep your data safe and your business running."
            />
            <FeatureCard
              icon={<ChartBar size={24} />}
              title="Data-Driven"
              description="Make informed decisions with our advanced analytics and reporting tools."
            />
            <FeatureCard
              icon={<User size={24} />}
              title="Customer Focused"
              description="24/7 support and a team dedicated to your success every step of the way."
            />
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="md:w-1/2">
              <div className="bg-muted rounded-xl h-64 md:h-80 w-full flex items-center justify-center text-muted-foreground">
                About Image Placeholder
              </div>
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold mb-6 text-foreground">
                About Acme Inc
              </h2>
              <p className="text-muted-foreground mb-4">
                Founded in 1998, Acme Inc has been at the forefront of
                innovation for over two decades. We've helped thousands of
                businesses transform their operations and achieve unprecedented
                growth.
              </p>
              <p className="text-muted-foreground mb-6">
                Our team of experts brings together diverse skills and
                experiences to deliver solutions that are not just effective,
                but revolutionary.
              </p>
              <Button variant="outline" asChild>
                <Link to="/about">Learn Our Story</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-16 bg-background">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">
            What Our Clients Say
          </h2>
          <div className="max-w-3xl mx-auto">
            <Card>
              <CardContent className="p-8">
                <p className="text-lg text-muted-foreground mb-4">
                  "Acme Inc transformed our business processes and helped us
                  achieve 200% growth in just one year. Their team's dedication
                  and expertise made all the difference."
                </p>
                <div className="flex items-center">
                  <Avatar>
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      JS
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-bold text-foreground">Jane Smith</p>
                    <p className="text-muted-foreground">CEO of TechForward</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;
