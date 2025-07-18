"use client";
import React, { useActionState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { signUp } from "@/auth/actions/sign-up";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { EMPTY_FORM_STATE } from "@/auth/validations/formState";
import FormField from "../components/ui/formField";
import SubmitButton from "../components/SubmitButton";

export default function SignUp() {
  const [{ fieldErrors, status, timestamp }, action] = useActionState(
    signUp,
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
              asChild
              variant="ghost"
              size="sm"
              className="absolute left-4 top-4 p-2 hover:bg-gray-100 rounded-full"
            >
              <Link href="/">
                <ArrowLeft className="w-4 h-4" />
              </Link>
            </Button>
          </div>
          <CardTitle className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Create Account
          </CardTitle>
          <CardDescription className="text-gray-600">
            Join us today and get started
          </CardDescription>
        </CardHeader>

        <CardContent>
          <form action={action} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                id="firstName"
                inputName="firstName"
                inputType="text"
                label="First Name"
                fieldErrors={fieldErrors}
                placeholder="First Name"
              />
              <FormField
                id="lastName"
                inputName="lastName"
                inputType="text"
                label="Last Name"
                fieldErrors={fieldErrors}
                placeholder="Last Name"
              />
            </div>

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

            <FormField
              id="confirmPassword"
              inputName="confirmPassword"
              inputType="password"
              label="Confirm Password"
              fieldErrors={fieldErrors}
              placeholder="••••••••"
            />

            <SubmitButton
              label="Create Account"
              loading="Creating Account..."
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold h-11 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            />
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              Already have an account?{" "}
              <button className="text-blue-600 hover:text-blue-700 font-medium hover:underline">
                <Link href="/sign-in">Sign In</Link>
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
