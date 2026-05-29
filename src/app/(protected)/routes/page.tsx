import Link from "next/link";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "~/components/ui/card";
import { routes } from "~/data/route";

export default function RoutesPage() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {routes.map((route) => (
        <Card key={route.id}>
          <CardHeader>
            <CardTitle>{route.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{route.description}</p>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button>
              <Link href={`/routes/${route.id}`}>View</Link>
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
}