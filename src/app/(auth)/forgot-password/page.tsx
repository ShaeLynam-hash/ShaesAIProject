"use client";
import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));
    setSubmitted(true);
    setLoading(false);
    toast.success("Reset link sent!");
  };

  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold">Reset your password</CardTitle>
        <CardDescription>
          {submitted ? "Check your inbox for the reset link." : "Enter your email and we'll send you a reset link."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {submitted ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <span className="text-3xl">✉️</span>
            </div>
            <p className="text-sm text-slate-600">We've sent a password reset link to <strong>{email}</strong>.</p>
            <Link href="/login" className="text-blue-600 text-sm hover:underline">Back to sign in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" required />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? "Sending…" : "Send Reset Link"}
            </Button>
            <p className="text-center text-sm text-slate-500">
              <Link href="/login" className="text-blue-600 hover:underline">Back to sign in</Link>
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
