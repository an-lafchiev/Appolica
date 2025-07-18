"use client";
import Link from "next/link";
import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "../components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";

import { signIn } from "@/auth/actions/sign-in";
import { EMPTY_FORM_STATE } from "@/auth/validations/formState";
import FormField from "../components/ui/formField";
import SubmitButton from "../components/SubmitButton";

export default function SignIn() {
  const [{ fieldErrors, status, timestamp }, action] = useActionState(
    signIn,
    EMPTY_FORM_STATE
  );
  const router = useRouter();

  useEffect(() => {
    if (status === "SUCCESS") {
      router.push("/dashboard");
    }
  }, [status, timestamp, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              asChild
              className="absolute left-4 top-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Welcome
          </CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to your account
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={action} className="space-y-4">
            <FormField
              id="email"
              inputName="email"
              inputType="email"
              label="Email"
              fieldErrors={fieldErrors}
              placeholder="email@example.com"
            />

            <FormField
              id="password"
              inputName="password"
              inputType="password"
              label="Password"
              fieldErrors={fieldErrors}
              placeholder="••••••••"
            />

            <SubmitButton
              label="Sign In"
              loading="Signing in..."
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-11 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            />
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Don&apos;t have an account?
              <button className="text-blue-600 hover:text-blue-700 font-medium hover:underline ml-2">
                <Link href="/sign-up">Sign Up</Link>
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
