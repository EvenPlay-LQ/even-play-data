import { Video } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const AthleteHighlights = () => {
  return (
    <DashboardLayout role="athlete">
      <div className="md:ml-16 space-y-6">
        <h1 className="text-2xl font-display font-bold text-foreground">Highlights</h1>
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Video className="h-8 w-8 text-primary" />
          </div>
          <h3 className="font-display font-semibold text-foreground mb-1">Upload Coming Soon</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Soon you'll be able to upload and showcase your best match highlights here.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AthleteHighlights;
