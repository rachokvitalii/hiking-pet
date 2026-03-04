import { Card, CardHeader, CardTitle, CardContent } from "../ui/card";

export const FormWrapper = ({ title, children }: { title: string, children: React.ReactNode }) => {
  return (
    <main className="flex justify-center items-center min-h-screen">
      <Card className="w-[350px]">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>
        <CardContent>
          {children}
        </CardContent>
      </Card>
    </main>
  )
};