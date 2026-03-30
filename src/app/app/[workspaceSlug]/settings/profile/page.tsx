"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AlertTriangle } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Required"),
  newPassword: z.string().min(8, "Must be at least 8 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.newPassword === d.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileInput = z.infer<typeof profileSchema>;
type PasswordInput = z.infer<typeof passwordSchema>;

export default function ProfilePage() {
  const { data: session } = useSession();
  const user = session?.user;
  const initials = user?.name?.split(" ").map((n) => n[0]).join("").toUpperCase() ?? "U";
  const [deleteConfirm, setDeleteConfirm] = useState("");

  const { register: regProfile, handleSubmit: handleProfile, formState: { isSubmitting: savingProfile } } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name ?? "" },
  });

  const { register: regPwd, handleSubmit: handlePwd, formState: { isSubmitting: savingPwd, errors: pwdErrors } } = useForm<PasswordInput>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSave = async (data: ProfileInput) => {
    toast.success("Profile updated");
  };

  const onPasswordChange = async (data: PasswordInput) => {
    toast.success("Password changed");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">Profile Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Update your personal information.</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base">Personal Information</CardTitle></CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <Avatar className="w-16 h-16">
              <AvatarImage src={user?.image ?? undefined} />
              <AvatarFallback className="bg-blue-600 text-white text-xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm">Change Photo</Button>
          </div>
          <form onSubmit={handleProfile(onProfileSave)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Full Name</Label>
              <Input {...regProfile("name")} />
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input value={user?.email ?? ""} disabled className="bg-slate-50 text-slate-400" />
              <p className="text-xs text-slate-400">Email cannot be changed.</p>
            </div>
            <Button type="submit" disabled={savingProfile} className="bg-blue-600 hover:bg-blue-700">
              {savingProfile ? "Saving…" : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader><CardTitle className="text-base">Change Password</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handlePwd(onPasswordChange)} className="space-y-4">
            <div className="space-y-1.5">
              <Label>Current Password</Label>
              <Input type="password" {...regPwd("currentPassword")} />
            </div>
            <div className="space-y-1.5">
              <Label>New Password</Label>
              <Input type="password" {...regPwd("newPassword")} />
              {pwdErrors.newPassword && <p className="text-xs text-red-500">{pwdErrors.newPassword.message}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Confirm New Password</Label>
              <Input type="password" {...regPwd("confirmPassword")} />
              {pwdErrors.confirmPassword && <p className="text-xs text-red-500">{pwdErrors.confirmPassword.message}</p>}
            </div>
            <Button type="submit" disabled={savingPwd} variant="outline">
              {savingPwd ? "Changing…" : "Change Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600 flex items-center gap-2">
            <AlertTriangle size={16} /> Delete Account
          </CardTitle>
          <CardDescription>Permanently delete your account. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Type <strong>delete my account</strong> to confirm</Label>
            <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder="delete my account" />
          </div>
          <Button variant="destructive" disabled={deleteConfirm !== "delete my account"} onClick={() => toast.error("Account deletion coming soon")}>
            Delete Account
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
