import { UserOptions } from "./UserOptions";
import Logo from "./Logo";
import AuthOptions from "./AuthOptions";
import { FetchUser } from "@/app/(user)/actions/FetchUser";

export default async function Header() {
  const userid = await FetchUser();

  return (
    <div className="">
      <header className="border-b flex justify-between p-3 items-center">
        <Logo />
        {userid ? <UserOptions /> : <AuthOptions />}
      </header>
      {userid ? (
        <div className="text-white flex justify-center p-2 text-sm font-medium bg-green-600">
          You are logged in
        </div>
      ) : (
        <div className="text-white flex justify-center p-2 text-sm font-medium bg-orange-600">
          You are not logged in
        </div>
      )}
    </div>
  );
}
