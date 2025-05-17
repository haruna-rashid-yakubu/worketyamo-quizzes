import { FetchUser } from "./(user)/actions/FetchUser";
import { redirect } from "next/navigation";


export default async function Home() {
  const userid = await FetchUser();

  if (!userid) {
    return redirect("/login");
  }

  return <div className="flex flex-col max-w-lg space-y-3">Ok lets go ${userid}</div>;
}
