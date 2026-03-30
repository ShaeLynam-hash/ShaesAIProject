"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Building2, Palette, Users, CreditCard, CheckCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { z } from "zod";
import { createWorkspaceSchema, type CreateWorkspaceInput } from "@/lib/validators/workspace";

type CreateWorkspaceFormInput = z.input<typeof createWorkspaceSchema>;
import { slugify } from "@/lib/workspace";

const STEPS = [
  { id: 1, label: "Workspace", icon: Building2 },
  { id: 2, label: "Personalize", icon: Palette },
  { id: 3, label: "Team", icon: Users },
  { id: 4, label: "Plan", icon: CreditCard },
  { id: 5, label: "Done", icon: CheckCircle },
];

const INDUSTRIES = ["Technology", "Healthcare", "Finance", "Retail", "Education", "Real Estate", "Marketing", "Legal", "Other"];
const COMPANY_SIZES = ["Just me", "2–10", "11–50", "51–200", "201–1000", "1000+"];
const TIMEZONES = ["America/New_York", "America/Chicago", "America/Denver", "America/Los_Angeles", "Europe/London", "Europe/Paris", "Asia/Tokyo", "Asia/Singapore"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [workspaceSlug, setWorkspaceSlug] = useState("");
  const [inviteEmails, setInviteEmails] = useState(["", ""]);

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm<CreateWorkspaceFormInput>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: { timezone: "America/New_York" },
  });

  const watchName = watch("name", "") as string;

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const slug = slugify(e.target.value);
    setWorkspaceSlug(slug);
  };

  const onSubmit = async (data: CreateWorkspaceFormInput) => {
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      toast.error(err.error ?? "Failed to create workspace");
      return;
    }
    const { workspace } = await res.json();
    setWorkspaceSlug(workspace.slug);
    setStep(5);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-slate-900">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">S</span>
            </div>
            <span className="font-bold text-xl">SaaS Platform</span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                step === s.id ? "bg-blue-600 text-white" :
                step > s.id ? "bg-green-100 text-green-700" :
                "bg-slate-200 text-slate-400"
              }`}>
                <s.icon size={12} />
                {s.label}
              </div>
              {i < STEPS.length - 1 && <div className={`w-4 h-px ${step > s.id ? "bg-green-400" : "bg-slate-300"}`} />}
            </div>
          ))}
        </div>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-6">
            {/* Step 1: Create Workspace */}
            {step === 1 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Create your workspace</h2>
                  <p className="text-slate-500 text-sm mt-1">Your workspace is your team's home base.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Workspace Name *</Label>
                  <Input {...register("name")} onChange={(e) => { register("name").onChange(e); handleNameChange(e); }} placeholder="Acme Inc." />
                  {errors.name && <p className="text-xs text-red-500">{errors.name.message}</p>}
                  {workspaceSlug && <p className="text-xs text-slate-400">URL: /app/<strong>{workspaceSlug}</strong>/dashboard</p>}
                </div>
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
                  <Label>Company Size</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="How big is your team?" /></SelectTrigger>
                    <SelectContent>
                      {COMPANY_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <Button onClick={() => { if (watchName?.length >= 2) setStep(2); else toast.error("Enter a workspace name"); }} className="w-full bg-blue-600 hover:bg-blue-700">
                  Continue →
                </Button>
              </div>
            )}

            {/* Step 2: Personalize */}
            {step === 2 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Personalize your workspace</h2>
                  <p className="text-slate-500 text-sm mt-1">Add a few details to make it yours. All optional.</p>
                </div>
                <div className="space-y-1.5">
                  <Label>Website URL</Label>
                  <Input {...register("website")} placeholder="https://yourcompany.com" />
                </div>
                <div className="space-y-1.5">
                  <Label>Timezone</Label>
                  <Select defaultValue="America/New_York" onValueChange={(v) => setValue("timezone", v as string)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1">← Back</Button>
                  <Button onClick={() => setStep(3)} className="flex-1 bg-blue-600 hover:bg-blue-700">Continue →</Button>
                </div>
              </div>
            )}

            {/* Step 3: Invite Team */}
            {step === 3 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Invite your team</h2>
                  <p className="text-slate-500 text-sm mt-1">Optional — you can always do this later from Settings.</p>
                </div>
                {inviteEmails.map((email, i) => (
                  <div key={i} className="space-y-1.5">
                    <Label>Team Member {i + 1}</Label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        const updated = [...inviteEmails];
                        updated[i] = e.target.value;
                        setInviteEmails(updated);
                      }}
                      placeholder="colleague@company.com"
                    />
                  </div>
                ))}
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(2)} className="flex-1">← Back</Button>
                  <Button onClick={() => setStep(4)} className="flex-1 bg-blue-600 hover:bg-blue-700">Continue →</Button>
                </div>
                <button onClick={() => setStep(4)} className="w-full text-center text-sm text-slate-400 hover:text-slate-600">
                  Skip for now
                </button>
              </div>
            )}

            {/* Step 4: Choose Plan */}
            {step === 4 && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">Choose your plan</h2>
                  <p className="text-slate-500 text-sm mt-1">Start free — upgrade anytime.</p>
                </div>
                <div className="space-y-3">
                  {[
                    { name: "Starter", price: "$49/mo", desc: "Perfect for small teams", color: "border-slate-200" },
                    { name: "Pro", price: "$99/mo", desc: "For growing businesses", color: "border-blue-500 bg-blue-50" },
                    { name: "Agency", price: "$249/mo", desc: "For agencies & enterprises", color: "border-slate-200" },
                  ].map((plan) => (
                    <div key={plan.name} className={`border-2 ${plan.color} rounded-xl p-4 flex items-center justify-between cursor-pointer hover:border-blue-400 transition-colors`}>
                      <div>
                        <p className="font-semibold text-slate-900">{plan.name}</p>
                        <p className="text-xs text-slate-500">{plan.desc}</p>
                      </div>
                      <span className="text-sm font-bold text-slate-900">{plan.price}</span>
                    </div>
                  ))}
                </div>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
                  <Button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700">
                    {isSubmitting ? "Creating workspace…" : "Start Free Trial →"}
                  </Button>
                </form>
                <div className="flex gap-3">
                  <Button variant="outline" onClick={() => setStep(3)} className="flex-1">← Back</Button>
                </div>
              </div>
            )}

            {/* Step 5: Done */}
            {step === 5 && (
              <div className="text-center space-y-5 py-4">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle size={40} className="text-green-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">You're all set! 🎉</h2>
                  <p className="text-slate-500 text-sm mt-2">Your workspace is ready. Let's get to work.</p>
                </div>
                <Button
                  className="bg-blue-600 hover:bg-blue-700 px-8"
                  onClick={() => router.push(`/app/${workspaceSlug}/dashboard`)}
                >
                  Go to Dashboard →
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
