import ProfileData from "@/components/profile/ProfileData";
import { redirect } from "next/navigation";
import { FetchUser } from "../actions/FetchUser";

export default async function ProfilePage() {
  const userid = await FetchUser();

  if (!userid) {
    return redirect("/login");
  }

  return <ProfileData userid={userid} />;
}
