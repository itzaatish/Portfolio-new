import { Github, Linkedin, Twitter, Heart } from "lucide-react";
import portfolio from "@/data/portfolio.json";

const socialIcons = { github: Github, linkedin: Linkedin, twitter: Twitter };

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { footer, site } = portfolio;

  return (
    <footer className="py-12 border-t border-border">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
          {/* Logo & Copyright */}
          <div className="text-center md:text-left">
            <a href="#" className="text-xl font-bold tracking-tight">
              {site.logo}<span className="text-primary">.</span>
            </a>
            <p className="text-sm text-muted-foreground mt-2">
              © {currentYear} {site.copyrightName}. All rights reserved.
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap justify-center gap-6">
            {footer.links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            {footer.socials.map((social) => {
              const Icon = socialIcons[social.platform] || Github;
              return (
              <a
                key={social.label}
                href={social.url}
                aria-label={social.label}
                className="p-2 rounded-full glass hover:bg-primary/10 hover:text-primary transition-all"
              >
                <Icon className="w-5 h-5" />
              </a>
            )})}
          </div>
        </div>
      </div>
    </footer>
  );
};
