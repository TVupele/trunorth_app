import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface ServiceCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
  variant?: "default" | "primary" | "accent";
}

export function ServiceCard({
  icon,
  title,
  description,
  href,
  variant = "default",
}: ServiceCardProps) {
  const variantStyles = {
    default: "border-border hover:border-primary/50",
    primary: "border-primary/30 bg-primary/5 hover:border-primary",
    accent: "border-accent/30 bg-accent/5 hover:border-accent",
  };

  const iconStyles = {
    default: "text-primary",
    primary: "text-primary",
    accent: "text-accent",
  };

  const buttonVariants = {
    default: "default" as const,
    primary: "default" as const,
    accent: "secondary" as const,
  };

  return (
    <Link to={href} className="block">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ scale: 1.02, y: -2 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        <Card
          className={`h-full transition-all duration-200 hover:shadow-md hover:ring-1 hover:ring-ring/30 ${variantStyles[variant]}`}
        >
          <CardHeader className="space-y-2 p-3 pb-2">
            <div className={`w-8 h-8 flex items-center justify-center ${iconStyles[variant]}`}>
              {icon}
            </div>
            <CardTitle className="text-sm">{title}</CardTitle>
            <CardDescription className="text-xs leading-snug line-clamp-2">
              {description}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-3 pt-0">
            <Button
              variant={buttonVariants[variant]}
              size="sm"
              className="w-full group text-xs h-8"
              asChild
            >
              <span className="flex items-center justify-center gap-1">
                Access
                <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
              </span>
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    </Link>
  );
}