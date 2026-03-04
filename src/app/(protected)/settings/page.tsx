import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"
import { Title } from "~/components/ui/title"
import { ChangePassword } from "./components/change-password"
import { Profile } from "./components/profile"

const SettingsPage = () => {
  return (
    <div className="border rounded-sm">
      <Tabs defaultValue="profile" className="px-3 py-4 gap-6" orientation="vertical">
        <TabsList className="w-[250px]" variant="line">
          <TabsTrigger className="cursor-pointer" value="profile">Profile</TabsTrigger>
          <TabsTrigger className="cursor-pointer" value="password">Password</TabsTrigger>
        </TabsList>
        <TabsContent value="profile">
          <Title tag="h4">Make changes to your profile here</Title>
          <Profile />
        </TabsContent>
        <TabsContent value="password" className="px-3">
          <Title tag="h4">Change password</Title>
          <ChangePassword />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default SettingsPage
