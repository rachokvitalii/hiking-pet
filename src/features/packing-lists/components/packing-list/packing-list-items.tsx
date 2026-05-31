"use client";

import { useTranslations } from "next-intl";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { RouterOutputs } from "~/trpc/react";
import { DeleteList } from "../delete-list";
import { Button } from "~/components/ui/button";
import { routes } from "~/shared/routes";
import Link from "next/link";

type PackingListItemsProps = {
  items: RouterOutputs["packingLists"]["getAll"];
};

export const PackingListItems = ({ items }: PackingListItemsProps) => {
  const t = useTranslations("actions");
  const tLists = useTranslations("packing.lists");
  const tListTypes = useTranslations("packing.listTypes");

  if (items.length === 0) {
    return (
      <div className="text-muted-foreground mt-10 text-center">
        {tLists("empty")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {items.map((item) => (
        <Card key={item.id} className="hover:bg-muted/30 relative transition">
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-base">{item.title}</CardTitle>
            <Badge
              className="absolute top-0 right-4 -translate-y-1/2"
              variant="default"
            >
              {tListTypes(item.type)}
            </Badge>
          </CardHeader>

          <CardContent className="flex items-center justify-between">
            <div className="text-muted-foreground text-xs">
              {tLists("created", {
                date: new Date(item.createdAt).toLocaleDateString(),
              })}
            </div>

            <div className="flex gap-2">
              <Button
                asChild
                size="sm"
                variant="outline"
                className="cursor-pointer"
              >
                <Link href={routes.packingList(item.id)} prefetch>
                  {t("edit")}
                </Link>
              </Button>
              <DeleteList id={item.id} />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
