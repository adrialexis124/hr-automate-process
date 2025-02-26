"use client";

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/src/presentation/components/Sidebar"
import { ThemeProvider } from "@/src/presentation/components/theme-provider"

import { Amplify } from "aws-amplify";
import { Authenticator } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      
        <body className={inter.className}>
        <Authenticator>
          <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
            <div className="flex h-screen bg-background">
              <Sidebar />
              <main className="flex-1 overflow-y-auto p-8">{children}</main>
            </div>
          </ThemeProvider>
        </Authenticator>
      </body>
    </html>
  )
}



import './globals.css'