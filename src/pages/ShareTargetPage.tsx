import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Share2, ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import AppLayout from "@/components/AppLayout";

const ShareTargetPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const title = searchParams.get("title") || "";
  const text = searchParams.get("text") || "";
  const url = searchParams.get("url") || "";

  const sharedContent = text || url || title;

  useEffect(() => {
    // If nothing was shared, redirect to home
    if (!title && !text && !url) {
      navigate("/buzz", { replace: true });
    }
  }, [title, text, url, navigate]);

  const handlePostToBuzz = () => {
    // Store shared content for the Buzz page to pick up
    sessionStorage.setItem(
      "ep_shared_content",
      JSON.stringify({ title, text, url })
    );
    navigate("/buzz?compose=true", { replace: true });
  };

  return (
    <AppLayout>
      <div className="flex min-h-[60vh] items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Share2 className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Shared with Even Playground</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {title && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Title</p>
                <p className="text-sm">{title}</p>
              </div>
            )}
            {text && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Content</p>
                <p className="text-sm">{text}</p>
              </div>
            )}
            {url && (
              <div>
                <p className="text-sm font-medium text-muted-foreground">Link</p>
                <a
                  href={url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {url}
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <Button onClick={handlePostToBuzz} className="w-full">
                Post to Buzz
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate("/buzz", { replace: true })}
                className="w-full"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ShareTargetPage;
