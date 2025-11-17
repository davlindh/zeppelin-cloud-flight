import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTopDonors } from "@/hooks/funding/useTopDonors";
import { Trophy, Medal, Award } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface DonationLeaderboardProps {
  campaignId: string;
}

export const DonationLeaderboard = ({ campaignId }: DonationLeaderboardProps) => {
  const { data: topDonors, isLoading } = useTopDonors(campaignId);

  const getPositionIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 1:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 2:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return null;
    }
  };

  const getFaveLevelColor = (level: string) => {
    switch (level) {
      case 'seed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'sprout':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'tree':
        return 'bg-teal-100 text-teal-800 dark:bg-teal-900/20 dark:text-teal-400';
      case 'forest':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top Supporters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between">
              <Skeleton className="h-12 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!topDonors || topDonors.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Top Supporters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-center py-8">
            Be the first to support this campaign! 🎉
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-5 h-5" />
          Top Supporters
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {topDonors.map((donor, index) => (
          <div
            key={donor.donor_user_id || index}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="flex items-center gap-2 min-w-[2rem]">
                {getPositionIcon(index)}
                <span className="text-sm font-semibold text-muted-foreground">
                  {index + 1}.
                </span>
              </div>
              <div className="flex-1">
                <p className="font-medium">{donor.donor_name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${getFaveLevelColor(donor.fave_level)}`}>
                    Fave {donor.fave_score}
                  </span>
                </div>
              </div>
            </div>
            <div className="text-right">
              <p className="font-bold text-lg">
                {donor.total_donated.toLocaleString('sv-SE')} {donor.currency}
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
