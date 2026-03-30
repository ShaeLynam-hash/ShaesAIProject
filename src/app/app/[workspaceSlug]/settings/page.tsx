"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateWorkspaceSchema, type UpdateWorkspaceInput } from "@/lib/validators/workspace";
import { AlertTriangle } from "lucide-react";

const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Retail", "Education", "Real Estate", "Marketing", "Legal", "Other"];
const TIMEZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore"];

export default function SettingsGeneralPage() {
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState("");
  const [workspaceName] = useState("My Workspace");

  const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm<UpdateWorkspaceInput>({
    resolver: zodResolver(updateWorkspaceSchema),
  });

  const onSubmit = async (data: UpdateWorkspaceInput) => {
    toast.success("Workspace settings saved");
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h2 className="text-xl font-bold text-slate-900">General Settings</h2>
        <p className="text-slate-500 text-sm mt-1">Manage your workspace details and preferences.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Workspace Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Workspace Name</Label>
              <Input id="name" {...register("name")} placeholder="Acme Inc." />
              {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="slug">Workspace Slug</Label>
              <Input id="slug" {...register("slug")} placeholder="acme-inc" />
              <p className="text-xs text-amber-600">⚠️ Changing your slug will break existing URLs.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="website">Website</Label>
              <Input id="website" {...register("website")} placeholder="https://yourdomain.com" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Industry</Label>
                <Select onValueChange={(v) => setValue("industry", v as string)}>
                  <SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger>
                  <SelectContent>
                    {INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Timezone</Label>
                <Select onValueChange={(v) => setValue("timezone", v as string)}>
                  <SelectTrigger><SelectValue placeholder="Select timezone" /></SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" disabled={isSubmitting} className="bg-blue-600 hover:bg-blue-700">
              {isSubmitting ? "Saving…" : "Save Changes"}
            </Button>
          </CardContent>
        </Card>
      </form>

      {/* Danger Zone */}
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-base text-red-600 flex items-center gap-2">
            <AlertTriangle size={16} /> Danger Zone
          </CardTitle>
          <CardDescription>Permanently delete this workspace and all its data. This cannot be undone.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Type <strong>{workspaceName}</strong> to confirm</Label>
            <Input value={deleteConfirm} onChange={(e) => setDeleteConfirm(e.target.value)} placeholder={workspaceName} />
          </div>
          <Button
            variant="destructive"
            disabled={deleteConfirm !== workspaceName}
            onClick={() => toast.error("Delete workspace coming soon")}
          >
            Delete Workspace
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
