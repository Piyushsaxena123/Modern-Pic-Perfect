import { Camera, Heart, Building, Users, Sparkles, Film } from "lucide-react";

const services = [
  {
    icon: Users,
    title: "Portrait Photography",
    description:
      "Professional headshots and artistic portraits that capture personality and essence.",
    price: "From $299",
  },
  {
    icon: Heart,
    title: "Wedding Photography",
    description:
      "Complete coverage of your special day with a cinematic, storytelling approach.",
    price: "From $2,499",
  },
  {
    icon: Building,
    title: "Commercial Photography",
    description:
      "High-quality images for brands, products, and corporate communications.",
    price: "From $599",
  },
  {
    icon: Sparkles,
    title: "Event Photography",
    description:
      "Capturing the energy and highlights of your corporate or private events.",
    price: "From $499",
  },
  {
    icon: Camera,
    title: "Lifestyle Sessions",
    description:
      "Natural, candid photography for families, couples, and individuals.",
    price: "From $399",
  },
  {
    icon: Film,
    title: "Photo & Video",
    description:
      "Combined packages offering both photography and videography services.",
    price: "Custom Quote",
  },
];

const Services = () => {
  return (
    <section id="services" className="section-padding bg-charcoal">
      <div className="container-wide">
        {/* Section Header */}
        <div className="text-center mb-16">
          <p className="text-primary font-medium tracking-[0.3em] uppercase text-sm mb-4">
            What I Offer
          </p>
          <h2 className="heading-lg mb-6">Services</h2>
          <p className="body-md max-w-2xl mx-auto">
            From intimate portraits to grand weddings, I offer a comprehensive
            range of photography services tailored to your unique vision.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <div
              key={service.title}
              className="group relative bg-secondary/50 backdrop-blur-sm rounded-xl p-8 border border-border hover:border-primary/50 transition-all duration-500 opacity-0 animate-fade-in-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Icon */}
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary/20 transition-colors duration-300">
                <service.icon className="w-7 h-7 text-primary" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-semibold mb-3 group-hover:text-primary transition-colors duration-300">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
                {service.description}
              </p>

              {/* Price & CTA */}
              <div className="flex items-center justify-between">
                <span className="text-primary font-semibold">
                  {service.price}
                </span>
                <a
                  href="#contact"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300 line-animate"
                >
                  Learn More →
                </a>
              </div>

              {/* Hover Glow Effect */}
              <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/5 to-transparent" />
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-16">
          <p className="text-muted-foreground mb-6">
            Need a custom package? Let's discuss your requirements.
          </p>
          <a
            href="#contact"
            className="inline-block px-8 py-4 bg-primary text-primary-foreground font-medium rounded-full hover:bg-gold-light transition-all duration-300 glow-sm hover:glow"
          >
            Request Custom Quote
          </a>
        </div>
      </div>
    </section>
  );
};

export default Services;
