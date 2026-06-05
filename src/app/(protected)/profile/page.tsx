import { type FC } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import { api } from "~/trpc/server";
import { TRIP_DURATIONS, type TripDuration } from "~/types/types";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { appRoutes } from "~/shared/app-routes";
import { PackingList } from "~/features/packing-lists/components/packing-list";
import { CreateList } from "~/features/packing-lists/components/create-list";

type UserProfile = {
  userId: number;
  displayName: string | null;
  homeRegion: string | null;
  experienceLevel: string | null;
  preferredTripDuration: string | null;
  maxDailyKm: number | null;
};

function initials(name: string | null | undefined, fallback: string) {
  const s = (name ?? "").trim();
  if (!s) return fallback;
  const parts = s.split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase()).join("") || fallback;
}

function avatarUrlPlaceholder(_profile: UserProfile) {
  return "";
}

const isTripDuration = (value: string): value is TripDuration =>
  (TRIP_DURATIONS as readonly string[]).includes(value);

const Profile: FC = async () => {
  const tProfile = await getTranslations("profile");
  const profile = await api.profile.me();

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{tProfile("title")}</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground text-sm">
          {tProfile.rich("noProfileData", {
            settingsLink: (chunks) => (
              <Link href={appRoutes.settings} className="text-blue-500">
                {chunks}
              </Link>
            ),
          })}
        </CardContent>
      </Card>
    );
  }

  const preferredTripDuration = profile.preferredTripDuration
    ? isTripDuration(profile.preferredTripDuration)
      ? tProfile(`tripDurations.${profile.preferredTripDuration}`)
      : profile.preferredTripDuration
    : tProfile("notSet");

  return (
    <div className="grid gap-3">
      <Card>
        <CardContent className="py-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-14 w-14">
                <AvatarImage
                  src={avatarUrlPlaceholder(profile)}
                  alt={tProfile("avatarAlt")}
                />
                <AvatarFallback>
                  {initials(profile.displayName, tProfile("fallbackInitial"))}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-xl leading-none font-semibold">
                    {profile.displayName ?? tProfile("unnamedUser")}
                  </h1>

                  {profile.experienceLevel ? (
                    <Badge variant="secondary">{profile.experienceLevel}</Badge>
                  ) : null}
                </div>

                <div className="text-muted-foreground text-sm">
                  {profile.homeRegion ? (
                    <span>{profile.homeRegion}</span>
                  ) : (
                    <span>{tProfile("homeRegionNotSet")}</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 lg:grid-cols-12">
        <Card className="lg:col-span-8">
          <CardHeader>
            <CardTitle>{tProfile("packingLists")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <CreateList />
            <PackingList />
          </CardContent>
        </Card>
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>{tProfile("tripPreferences")}</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4">
              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">
                  {tProfile("preferredTripDuration")}
                </div>
                <div className="text-sm font-medium">
                  {preferredTripDuration}
                </div>
              </div>

              <div className="space-y-1">
                <div className="text-muted-foreground text-sm">
                  {tProfile("maxDailyDistance")}
                </div>
                <div className="text-sm font-medium">
                  {profile.maxDailyKm != null
                    ? tProfile("dailyDistance", {
                        distance: profile.maxDailyKm,
                      })
                    : tProfile("notSet")}
                </div>
              </div>
            </div>

            <Separator />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
