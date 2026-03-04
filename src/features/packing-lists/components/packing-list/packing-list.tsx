"use client"

import { api } from "~/trpc/react"
import { CreateList } from "../create-list"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Button } from "~/components/ui/button"
import { DeleteList } from "../delete-list"
import { Skeleton } from "~/components/ui/skeleton"

export const PackingList = () => {
  const { data: packingLists, isLoading, error } = api.packingLists.getAll.useQuery()

  if (isLoading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-32" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-destructive">
          {error.message}
        </CardContent>
      </Card>
    )
  }

  return (
    <div>
      <CreateList />
      {packingLists && packingLists.length > 0 ? (
        <div className="space-y-4">
          {packingLists.map((item) => (
            <Card key={item.id} className="transition hover:bg-muted/30 ">
              <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-base">{item.title}</CardTitle>
                <Badge variant="secondary">{item.type}</Badge>
              </CardHeader>
    
              <CardContent className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground">
                  Created: {new Date(item.createdAt).toLocaleDateString()}
                </div>
    
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" disabled>
                    Open
                  </Button>
                  <DeleteList id={item.id} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-10 text-center text-muted-foreground">No packing lists found.</div>
      )}
    </div>
  )
}