import { Campaign, formatCurrency } from '@/lib/index';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

interface CampaignCardProps {
  campaign: Campaign;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const percentage = Math.min((campaign.raised / campaign.goal) * 100, 100);
  const remaining = Math.max(campaign.goal - campaign.raised, 0);
  const endDate = new Date(campaign.endDate);
  const daysLeft = Math.max(
    Math.ceil((endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)),
    0
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -4 }}
      className="h-full"
    >
      <Card className="h-full flex flex-col overflow-hidden transition-all duration-200 hover:shadow-lg">
        <div className="relative aspect-video overflow-hidden">
          <img
            src={campaign.image}
            alt={campaign.title}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
          />
          <Badge
            className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm"
            variant="secondary"
          >
            {campaign.category}
          </Badge>
        </div>

        <CardHeader className="pb-2">
          <h3 className="font-semibold text-base line-clamp-2 leading-tight">
            {campaign.title}
          </h3>
          <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
            {campaign.description}
          </p>
        </CardHeader>

        <CardContent className="flex-1 space-y-3 pb-3">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-semibold text-primary">
                {formatCurrency(campaign.raised, campaign.currency)}
              </span>
              <span className="text-muted-foreground">
                of {formatCurrency(campaign.goal, campaign.currency)}
              </span>
            </div>
            <Progress value={percentage} className="h-2" />
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{percentage.toFixed(1)}% funded</span>
              <span>{formatCurrency(remaining, campaign.currency)} to go</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{campaign.donors.toLocaleString()} donors</span>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{daysLeft} days left</span>
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            by {campaign.organizer}
          </div>
        </CardContent>

        <CardFooter className="pt-0">
          <Button className="w-full">
            Donate Now
          </Button>
        </CardFooter>
      </Card>
    </motion.div>
  );
}
