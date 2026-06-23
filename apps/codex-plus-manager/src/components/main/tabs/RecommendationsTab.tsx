import { RefreshCw } from "lucide-react";
import {
  AdGrid,
  Button,
  CardContent,
  CardHead,
  Panel,
} from "@/components/main/ui/SharedComponents";
import { type Actions, type AdItem, type AdsResult } from "@/types";

function isExpiredAd(ad: AdItem) {
  if (!ad.expires_at) return false;
  const expiresAt = Date.parse(ad.expires_at);
  return Number.isFinite(expiresAt) && expiresAt < Date.now();
}

export function RecommendationsTab({
  ads,
  actions,
}: {
  ads: AdsResult | null;
  actions: Actions;
}) {
  const items = (ads?.ads ?? []).filter((ad) => !isExpiredAd(ad));
  const sponsors = items.filter((ad) => ad.type === "sponsor");
  const normal = items.filter((ad) => ad.type === "normal");
  return (
    <>
      <Panel>
        <CardHead
          title="Recommendations"
          detail="Uses the same remote ad source as the Codex plugin menu"
        />
        <CardContent>
          <div className="recommend-hero">
            <div>
              <strong>
                {ads
                  ? `loaded ${items.length}  recommendations`
                  : "Recommendations not yet loaded"}
              </strong>
              <span>
                Content from BigPizzaV3/Ad-List, categorized as sponsor and
                normal recommendations.
              </span>
            </div>
            <Button onClick={() => void actions.refreshAds()}>
              <RefreshCw className="h-4 w-4" />
              Refresh Recommendations
            </Button>
          </div>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead
          title="Sponsor Recommendations"
          detail={`${sponsors.length}  items`}
        />
        <CardContent>
          <AdGrid
            actions={actions}
            ads={sponsors}
            empty="No sponsor recommendations available."
          />
        </CardContent>
      </Panel>
      <Panel>
        <CardHead
          title="Normal Recommendations"
          detail={`${normal.length}  items`}
        />
        <CardContent>
          <AdGrid
            actions={actions}
            ads={normal}
            empty="No normal recommendations available."
          />
        </CardContent>
      </Panel>
    </>
  );
}
