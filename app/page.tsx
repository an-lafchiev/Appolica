import Image from "next/image";
import Link from "next/link";
import { Button } from "./components/ui/button";
import { getAuth } from "@/auth/cookie";
import { redirect } from "next/navigation";
export default async function Home() {
  const { user } = await getAuth();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="mb-1">
          <Image
            src="/logo.webp"
            width={290}
            height={120}
            alt="appolica"
            style={{ margin: "0 auto" }}
          />
        </div>

        <div className="space-y-4">
          <Button
            asChild
            className="w-64 h-12 mr-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/sign-up">Sign up</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            className="w-64 h-12 ml-2 border-2 border-gray-300 hover:border-gray-400 text-gray-700 font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <Link href="/sign-in">Sign in</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
