"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { 
  getSavingsGoals, 
  addSavingsGoal, 
  updateSavingsBalance, 
  deleteSavingsGoal 
} from "./actions";
import { getIncomeProfile } from "../income/actions";
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  TrendingUp, 
  Zap, 
  Target, 
  Activity, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Sparkles,
  LayoutGrid,
  ShieldCheck,
  Info
} from "lucide-react";
import { cn } from "@/lib/utils";

const goalSchema = z.object({
  title: z.string().min(1, "Title is required"),
  target: z.number().min(0.01, "Target must be greater than 0"),
  priority: z.enum(["CRITICAL", "STRATEGIC", "DISCRETIONARY"]),
});

type GoalFormValues = z.infer<typeof goalSchema>;

export default function SavingsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [isPending, startTransition] = useTransition();

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalSchema),
    defaultValues: {
      title: "",
      target: undefined as any,
      priority: "STRATEGIC",
    },
  });

  const loadData = async () => {
    const [goalsData, profileData] = await Promise.all([
      getSavingsGoals(),
      getIncomeProfile()
    ]);
    setGoals(goalsData);
    setProfile(profileData);
  };

  useEffect(() => {
    loadData();
  }, []);

  const calculateMonthlyNet = () => {
    if (!profile) return 0;
    const basicPay = profile.basicPay || 0;
    const totalAllowances = profile.allowances?.reduce((sum: number, a: any) => sum + a.amount, 0) || 0;
    const nightDiff = profile.nightDiff || 0;
    const nightDiffHours = profile.nightDiffHours || 0;
    const hourlyRate = basicPay / 22 / 8;
    const nightDiffAmount = (hourlyRate * (nightDiff / 100)) * nightDiffHours;
    const monthlyGross = basicPay + totalAllowances + nightDiffAmount;
    const totalGovtDeductions = (profile.sss || 0) + (profile.pagibig || 0) + (profile.philhealth || 0) + (profile.tax || 0);
    return monthlyGross - totalGovtDeductions;
  };

  const monthlyNet = calculateMonthlyNet();
  const suggestedNeeds = monthlyNet * 0.5;
  const suggestedEmergency = suggestedNeeds * 6;
  const suggestedCutoffSavings = (monthlyNet / 2) * 0.2; // 20% of semi-monthly pay

  const totals = goals.reduce((acc, goal) => ({
    current: acc.current + goal.current,
    target: acc.target + goal.target
  }), { current: 0, target: 0 });

  const aggregateRate = totals.target > 0 ? (totals.current / totals.target) * 100 : 0;

  function onSubmit(values: GoalFormValues) {
    startTransition(async () => {
      await addSavingsGoal(values);
      form.reset();
      loadData();
    });
  }

  const handleAutoInitialize = () => {
    form.setValue("title", "Emergency Buffer Runway");
    form.setValue("target", Math.round(suggestedEmergency));
    form.setValue("priority", "CRITICAL");
  };

  const handleUpdateBalance = (id: string, type: "DEPOSIT" | "WITHDRAWAL") => {
    const amount = parseFloat(prompt(`Enter amount to ${type.toLowerCase()}:`) || "0");
    if (isNaN(amount) || amount <= 0) return;

    startTransition(async () => {
      await updateSavingsBalance(id, amount, type);
      loadData();
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* System Overview Header */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-indigo-500">
          <Target className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">Wealth Protocol</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900 leading-none">Savings</h1>
      </div>

      {/* Top System Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-full">
        <div className="p-4 sm:p-5 rounded-2xl md:rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-md space-y-2 group hover:border-indigo-100 transition-all duration-300">
          <div className="flex items-center gap-3 text-slate-400">
            <PiggyBank className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Stashed Capital</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums text-slate-900">₱ {totals.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        
        <div className="p-4 sm:p-5 rounded-2xl md:rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-md space-y-2 group hover:border-blue-100 transition-all duration-300">
          <div className="flex items-center gap-3 text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Suggested Needs</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums text-indigo-600">₱ {suggestedNeeds.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-tight">50% OF NET PAY</p>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl md:rounded-xl border border-slate-200/60 bg-white/50 backdrop-blur-md space-y-2 group hover:border-blue-100 transition-all duration-300">
          <div className="flex items-center gap-3 text-slate-400">
            <LayoutGrid className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Target Nodes</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums text-slate-900">{goals.length} <span className="text-[10px] text-slate-400 font-bold uppercase ml-1">Active</span></div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl md:rounded-xl border border-slate-200/60 bg-slate-900 shadow-sm space-y-2 relative overflow-hidden group">
          <Activity className="absolute -right-4 -top-4 w-20 h-20 text-white/5 transition-transform duration-700" />
          <div className="flex items-center gap-3 relative z-10">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Aggregate Progress</span>
          </div>
          <div className="text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums text-white relative z-10">{aggregateRate.toFixed(1)}%</div>
        </div>
      </div>

      {/* Logical Scalar: Target Allocation Card */}
      <Card className="rounded-xl border border-slate-200/60 bg-white/50 p-4 backdrop-blur-md shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-3.5 h-3.5 text-indigo-500" />
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Logical Scalar: Target Allocation</span>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Monthly Operational Needs (50%)</span>
            <div className="text-lg font-black font-mono tracking-tight text-slate-900 tabular-nums">₱ {suggestedNeeds.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Suggested Cutoff Allocation (20%)</span>
            <div className="text-lg font-black font-mono tracking-tight text-indigo-600 tabular-nums">₱ {suggestedCutoffSavings.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
          <div className="space-y-1">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight">Target Emergency Runway (6-Mo)</span>
            <div className="text-lg font-black font-mono tracking-tight text-slate-900 tabular-nums">₱ {suggestedEmergency.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
          </div>
        </div>

        <span className="text-[10px] text-slate-400 font-medium italic mt-4 block">
          System suggestion: Allocate 50% to essentials and 20% to savings per semi-monthly cycle to securely build your 6-cycle buffer track.
        </span>

        <Button
          onClick={handleAutoInitialize}
          variant="outline"
          size="sm"
          className="mt-4 text-[9px] font-black uppercase tracking-widest h-7 px-4 rounded-md border-slate-200 hover:bg-slate-900 hover:text-white transition-all w-fit"
        >
          <Plus className="w-3 h-3 mr-1.5" />
          Auto-Initialize Emergency Node
        </Button>
      </Card>

      {/* Goal Initialization Module */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-500">
          <Plus className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Goal Initialization</span>
        </div>

        <Card className="rounded-xl border border-slate-200/50 bg-white/40 p-4 sm:p-5 backdrop-blur-md overflow-hidden">
          <CardContent className="p-0">
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
              <div className="sm:col-span-5 space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Title Descriptor</Label>
                <Input {...form.register("title")} placeholder="e.g., Emergency Fund Runway" className="h-9 rounded-lg border-slate-200 focus:border-slate-900 transition-all font-bold bg-white text-xs px-3" />
              </div>
              <div className="sm:col-span-4 space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Target Amount</Label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[10px] pointer-events-none select-none">₱</span>
                  <Input {...form.register("target", { valueAsNumber: true })} type="number" step="0.01" placeholder="0.00" className="pl-7 pr-3 h-9 rounded-lg border-slate-200 focus:border-slate-900 transition-all font-mono font-bold bg-white text-xs tabular-nums" />
                </div>
              </div>
              <div className="sm:col-span-3 space-y-1.5">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Priority Tier</Label>
                <Select onValueChange={(v) => form.setValue("priority", v as any)} value={form.watch("priority")}>
                  <SelectTrigger className="h-9 rounded-lg border-slate-200 focus:ring-0 focus:border-slate-900 font-bold bg-white text-xs px-3">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl p-1.5">
                    <SelectItem value="CRITICAL" className="rounded-lg font-bold text-[10px] uppercase tracking-widest text-red-600">Critical</SelectItem>
                    <SelectItem value="STRATEGIC" className="rounded-lg font-bold text-[10px] uppercase tracking-widest text-indigo-600">Strategic</SelectItem>
                    <SelectItem value="DISCRETIONARY" className="rounded-lg font-bold text-[10px] uppercase tracking-widest text-slate-600">Discretionary</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="sm:col-span-12 flex justify-start mt-2">
                <Button 
                  type="submit" 
                  className="h-9 bg-slate-900 hover:bg-black text-white rounded-lg text-[10px] font-bold uppercase tracking-widest px-6 relative overflow-hidden transition-all w-fit"
                  disabled={isPending}
                >
                  <Sparkles className="w-3 h-3 mr-2" />
                  {isPending ? "Initializing..." : "Initialize Goal"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Savings Matrix Grid */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-500">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Savings Matrix</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {goals.length === 0 ? (
            <div className="sm:col-span-full py-12 text-center text-slate-300 font-medium italic text-xs">
              No capital accumulation targets defined.
            </div>
          ) : (
            goals.map((goal) => {
              const progress = (goal.current / goal.target) * 100;
              return (
                <Card key={goal.id} className="rounded-xl border border-slate-200/60 bg-white/50 hover:border-indigo-100 transition-all duration-300 shadow-xs overflow-hidden flex flex-col group">
                  <CardHeader className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className={cn(
                        "text-[7px] font-black tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-sm border",
                        goal.priority === "CRITICAL" ? "bg-red-50 text-red-600 border-red-100" :
                        goal.priority === "STRATEGIC" ? "bg-indigo-50 text-indigo-600 border-indigo-100" :
                        "bg-slate-50 text-slate-600 border-slate-100"
                      )}>
                        {goal.priority}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-slate-200 hover:text-red-500 transition-all rounded-md opacity-0 group-hover:opacity-100"
                        onClick={() => {
                          if (confirm("Delete this target?")) {
                            startTransition(async () => {
                              await deleteSavingsGoal(goal.id);
                              loadGoals();
                            });
                          }
                        }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <CardTitle className="text-xs font-bold text-slate-900 tracking-tight leading-tight">{goal.title}</CardTitle>
                  </CardHeader>
                  <CardContent className="p-4 pt-0 space-y-4 flex-1 flex flex-col justify-end">
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] font-mono font-bold text-slate-500 tabular-nums">
                        <span>₱ {goal.current.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                        <span>₱ {goal.target.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                      </div>
                      <Progress value={progress} className="h-1 bg-slate-100" />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 rounded-md text-[9px] font-black uppercase tracking-widest border-slate-200 hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-200 transition-all"
                        onClick={() => handleUpdateBalance(goal.id, "DEPOSIT")}
                      >
                        <ArrowUpCircle className="w-3 h-3 mr-1.5" />
                        Deposit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 h-7 rounded-md text-[9px] font-black uppercase tracking-widest border-slate-200 hover:bg-orange-50 hover:text-orange-600 hover:border-orange-200 transition-all"
                        onClick={() => handleUpdateBalance(goal.id, "WITHDRAWAL")}
                      >
                        <ArrowDownCircle className="w-3 h-3 mr-1.5" />
                        Withdraw
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
}
