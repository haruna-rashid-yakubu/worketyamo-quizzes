import { AppSidebar } from "@/components/app-sidebar"
import { SiteHeader } from "@/components/site-header"
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import EnhancedQuizCreator from "@/components/common/quiz-creator/QuizzApp"
export default function Page() {
  return (
    <SidebarProvider>
      <AppSidebar variant="inset" />
      <SidebarInset>
        <SiteHeader />
        <EnhancedQuizCreator />
      </SidebarInset>
    </SidebarProvider>
  )
}
