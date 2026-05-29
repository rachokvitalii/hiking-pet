import { type FC } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Separator } from "~/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { api } from "~/trpc/server"
import { TRIP_DURATIONS, TRIP_DURATIONS_LABEL, type TripDuration } from "~/types/types"
import Link from "next/link"
import { routes } from "~/shared/routes"
import { PackingList } from "~/features/packing-lists/components/packing-list"
import { CreateList } from "~/features/packing-lists/components/create-list"

type UserProfile = {
  userId: number
  displayName: string | null
  homeRegion: string | null
  experienceLevel: string | null
  preferredTripDuration: string | null
  maxDailyKm: number | null
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

const isTripDuration = (value: string): value is TripDuration =>
  (TRIP_DURATIONS as readonly string[]).includes(value)

const preferredTripDuration = (value: string | null) => {
  if (!value) return "Not set"
  return isTripDuration(value) ? TRIP_DURATIONS_LABEL[value] : value
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

  return (
    <div className="grid gap-3">
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
            <CardTitle>Packing lists</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <CreateList />
            <PackingList />
          </CardContent>
        </Card>
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Trip preferences</CardTitle>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="grid gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground">Preferred trip duration</div>
                <div className="text-sm font-medium">
                  {preferredTripDuration(profile.preferredTripDuration)}
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
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Profile