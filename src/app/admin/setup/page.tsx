"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Loader2 } from "lucide-react";

export default function AdminSetupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSetup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      // Step 1: Create Supabase Auth user
      const signUpResponse = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const signUpData = await signUpResponse.json();

      if (!signUpResponse.ok) {
        setError(signUpData.error || "Failed to create user account");
        return;
      }

      // Step 2: Sign in the user
      const signInResponse = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!signInResponse.ok) {
        setError("Account created but failed to sign in. Please sign in manually.");
        return;
      }

      // Step 3: Register as admin
      const setupResponse = await fetch("/api/admin/setup", {
        method: "POST",
      });

      const setupData = await setupResponse.json();

      if (!setupResponse.ok) {
        setError(setupData.error || "Failed to register as admin");
        return;
      }

      setMessage(`Success! Admin account created for ${email}. You can now login at /admin/login`);
    } catch (err) {
      setError("An error occurred during setup");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <CardTitle className="text-2xl text-white" style={{ fontFamily: "Fraunces, serif" }}>
            Admin Setup
          </CardTitle>
          <CardDescription className="text-slate-400">
            Create your admin account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSetup} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                {error}
              </div>
            )}
            
            {message && (
              <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
                {message}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="fullName" className="text-slate-300">
                Full Name
              </Label>
              <Input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white"
              style={{ fontFamily: "Space Grotesk, sans-serif" }}
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Setting up...
                </>
              ) : (
                "Create Admin Account"
              )}
            </Button>

            <p className="text-xs text-slate-500 text-center mt-4">
              This creates a Supabase Auth account and registers it as an admin user.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
