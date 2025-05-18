
import { EnhancedQuizCreatorClient } from "./QuizzComponent";
// Now create the async server component that will fetch the user ID
export default async function EnhancedQuizCreator() {
    // Fetch user data from server
    const userId = await import("@/app/(user)/actions/FetchUser").then(
      (module) => module.FetchUser()
    );
    
    // Pass user ID to client component
    return <EnhancedQuizCreatorClient userId={userId} />;
  }