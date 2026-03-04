import { type FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { api } from "~/trpc/server"
import { HIKE_TYPE_LABEL } from "~/types/types";
import Link from "next/link"
import { routes } from "~/shared/routes"
import { PackingList } from "~/features/packing-lists/components/packing-list"

type UserProfile = {
  userId: number
  displayName: string | null
  homeRegion: string | null
  experienceLevel: string | null
  preferredHikeType: string | null
  maxDailyKm: number | null
  gear: string[] | null
}

function initials(name?: string | null) {
  const s = (name ?? "").trim()
  if (!s) return "U"
  const parts = s.split(/\s+/).slice(0, 2)
  return parts.map((p) => p[0]?.toUpperCase()).join("") || "U"
}

function avatarUrlPlaceholder(_profile: UserProfile) {
  return ""
}

const preferredHikeType = (value: string | null) => {
  if (!value) return "Not set"

  const label = HIKE_TYPE_LABEL[value] ?? value;
  return label
}

const Profile: FC = async () => {
  const profile = await api.profile.me()

  if (!profile) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-10">
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            No profile data, but you can create one <Link href={routes.settings} className="text-blue-500">here.</Link>
          </CardContent>
        </Card>
      </main>
    )
  }

  const gear = profile.gear ?? []

  return (
    <main className="mx-auto w-full max-w-5xl px-6 pb-10">
      <div className="grid gap-3">
        {/* Header */}
        <Card>
          <CardContent className="py-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="h-14 w-14">
                  <AvatarImage src={avatarUrlPlaceholder(profile)} alt="Avatar" />
                  <AvatarFallback>{initials(profile.displayName)}</AvatarFallback>
                </Avatar>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-xl font-semibold leading-none">
                      {profile.displayName ?? "Unnamed user"}
                    </h1>

                    {profile.experienceLevel ? (
                      <Badge variant="secondary">{profile.experienceLevel}</Badge>
                    ) : null}
                  </div>

                  <div className="text-sm text-muted-foreground">
                    {profile.homeRegion ? (
                      <span>{profile.homeRegion}</span>
                    ) : (
                      <span>Home region not set</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-3 lg:grid-cols-12">
          <Card className="lg:col-span-9">
            <CardHeader>
              <CardTitle>Packing list</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <PackingList />
            </CardContent>
          </Card>
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>Hiking preferences</CardTitle>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="grid gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Preferred hike type</div>
                  <div className="text-sm font-medium">
                    {preferredHikeType(profile.preferredHikeType)}
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">Max daily distance</div>
                  <div className="text-sm font-medium">
                    {profile.maxDailyKm != null ? `${profile.maxDailyKm} km/day` : "Not set"}
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Gear</div>

                {gear.length ? (
                  <div className="flex flex-wrap gap-2">
                    {gear.map((g) => (
                      <Badge key={g} variant="outline">
                        {g}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm">No gear added yet.</div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  )
}

export default Profile