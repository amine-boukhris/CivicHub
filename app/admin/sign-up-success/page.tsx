import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Mail } from "lucide-react";
import {motion} from 'motion/react'
import AppLogo from "@/components/app-logo";

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-secondary/30 flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <AppLogo />
        </div>
      </header>

      {/* Success Message */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl">Check Your Email</CardTitle>
              <CardDescription>
                We&apos;ve sent you a confirmation email. Please click the link in the email to
                verify your account.
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-sm text-muted-foreground mb-6">
                After confirming your email, you&apos;ll be able to log in to the admin dashboard.
              </p>
              <Link href="/admin/login">
                <Button className="bg-[#2E5BFF] hover:bg-[#1E3A8A]">Go to Login</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
