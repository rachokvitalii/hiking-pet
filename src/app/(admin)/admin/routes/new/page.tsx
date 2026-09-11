import Link from "next/link";

import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { RouteForm } from "~/features/routes-admin/components/route-form";
import { appRoutes } from "~/shared/app-routes";

export default function NewAdminRoutePage() {
  return (
    <div className="flex flex-col gap-6">
      <Button asChild variant="outline" className="w-fit">
        <Link href={appRoutes.adminRoutes}>Back to routes</Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>New route</CardTitle>
          <CardDescription>
            Add route content first. Embedding runs automatically after save.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RouteForm mode="create" />
        </CardContent>
      </Card>
    </div>
  );
}
