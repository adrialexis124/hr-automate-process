"use client";

import type React from "react";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";
import "./globals.css";
import Sidebar from "@/src/presentation/components/Sidebar";
import { ThemeProvider } from "@/src/presentation/components/theme-provider";

import { Amplify } from "aws-amplify";
import { Authenticator, useAuthenticator, useTheme } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";

import { Button } from "@/src/presentation/components/ui/button";

Amplify.configure(outputs);

const inter = Inter({ subsets: ["latin"] });

const components = {
  Header() {
    const { tokens } = useTheme();
    return (
      <div className="text-center py-6">
        <img
          alt="Amplify logo"
          src="https://docs.amplify.aws/assets/logo-dark.svg"
          className="w-32 mx-auto"
        />
      </div>
    );
  },

  Footer() {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          &copy; {new Date().getFullYear()} All Rights Reserved
        </p>
      </div>
    );
  },

  SignIn: {
    Header() {
      return <h3 className="text-xl font-semibold text-center">Sign in to your account</h3>;
    },
    Footer() {
      const { toForgotPassword } = useAuthenticator();
      return (
        <div className="text-center">
          <Button variant="link" onClick={toForgotPassword}>
            Reset Password
          </Button>
        </div>
      );
    },
  },

  SignUp: {
    Header() {
      return <h3 className="text-xl font-semibold text-center">Create a new account</h3>;
    },
    Footer() {
      const { toSignIn } = useAuthenticator();
      return (
        <div className="text-center">
          <Button variant="link" onClick={toSignIn}>
            Back to Sign In
          </Button>
        </div>
      );
    },
  },
};

const formFields = {
  signIn: {
    username: {
      placeholder: "Enter your email",
    },
  },
  signUp: {
    password: {
      label: "Password:",
      placeholder: "Enter your Password:",
      isRequired: false,
      order: 2,
    },
    confirm_password: {
      label: "Confirm Password:",
      order: 1,
    },
  },
  forgotPassword: {
    username: {
      placeholder: "Enter your email:",
    },
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={cn(inter.className, "bg-white dark:bg-black text-black dark:text-white")}>
        <Authenticator formFields={formFields} components={components}>
            <div className="relative flex h-screen bg-background overflow-hidden">
              {/* Parallax Background */}
              <div className="absolute inset-0 bg-fixed bg-gradient-to-b from-gray-200 to-gray-100 dark:from-gray-900 dark:to-black" />

              {/* Main Layout */}
              <div className="relative flex h-full w-full">
                <Sidebar />
                <main className="flex-1 overflow-y-auto p-8 backdrop-blur-md">{children}</main>
              </div>
            </div>
        </Authenticator>
      </body>
    </html>
  );
}
