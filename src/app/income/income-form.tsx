"use client";

import { useState, useTransition } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { updateIncomeProfile } from "./actions";
import { Wallet, Info, Plus, Trash2, TrendingUp, DollarSign, Clock, ShieldCheck, PieChart, Activity, Fingerprint, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const allowanceSchema = z.object({
  label: z.string().min(1, "Label is required"),
  amount: z.number().min(0),
});

const incomeSchema = z.object({
  basicPay: z.number().min(0),
  allowances: z.array(allowanceSchema),
  nightDiff: z.number().min(0),
  nightDiffHours: z.number().min(0),
  sss: z.number().min(0),
  pagibig: z.number().min(0),
  philhealth: z.number().min(0),
  tax: z.number().min(0),
});

type IncomeFormValues = z.infer<typeof incomeSchema>;

interface IncomeFormProps {
  initialData?: any | null;
}

export function IncomeForm({ initialData }: IncomeFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const form = useForm<IncomeFormValues>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      basicPay: initialData?.basicPay || undefined,
      allowances: initialData?.allowances?.map((a: any) => ({ label: a.label, amount: a.amount })) || [],
      nightDiff: initialData?.nightDiff || undefined,
      nightDiffHours: initialData?.nightDiffHours || undefined,
      sss: initialData?.sss || undefined,
      pagibig: initialData?.pagibig || undefined,
      philhealth: initialData?.philhealth || undefined,
      tax: initialData?.tax || undefined,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "allowances",
  });

  const watchValues = form.watch();

  const calculateTotals = () => {
    const { basicPay, allowances, nightDiff, nightDiffHours, sss, pagibig, philhealth, tax } = watchValues;
    const totalAllowances = allowances?.reduce((sum, a) => sum + (a.amount || 0), 0) || 0;
    const hourlyRate = (basicPay || 0) / 22 / 8;
    const nightDiffAmount = (hourlyRate * ((nightDiff || 0) / 100)) * (nightDiffHours || 0);
    const gross = (basicPay || 0) + totalAllowances + nightDiffAmount;
    const deductions = (sss || 0) + (pagibig || 0) + (philhealth || 0) + (tax || 0);
    const net = gross - deductions;
    const cutoff = net / 2;
    return { gross, deductions, net, cutoff, totalAllowances, nightDiffAmount };
  };

  const { gross, deductions, net, cutoff, totalAllowances, nightDiffAmount } = calculateTotals();

  function onSubmit(data: IncomeFormValues) {
    setMessage(null);
    startTransition(async () => {
      try {
        await updateIncomeProfile(data);
        setMessage("Income profile updated successfully!");
      } catch (error) {
        setMessage("Failed to update income profile.");
      }
    });
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px] max-w-full mx-auto animate-in fade-in duration-500">
      <div className="space-y-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-indigo-500">
            <Fingerprint className="w-3.5 h-3.5" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Identity Profile</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900 leading-none">Income Settings</h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Base Compensation Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center shadow-sm">
                <DollarSign className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900">Base Compensation</h3>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-end">
              <div className="flex-1 w-full space-y-1.5">
                <Label htmlFor="basicPay" className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Monthly Basic Pay</Label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[10px]">₱</span>
                  <Input 
                    id="basicPay" 
                    {...form.register("basicPay", { valueAsNumber: true })} 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="pl-7 pr-3 h-9 rounded-lg border-slate-200 bg-white/50 focus:bg-white focus:ring-0 focus:border-slate-900 transition-all font-mono font-bold text-xs tabular-nums shadow-xs w-full" 
                  />
                </div>
              </div>
              <div className="w-full sm:w-24 space-y-1.5">
                <Label htmlFor="nightDiff" className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Diff %</Label>
                <Input 
                  id="nightDiff" 
                  {...form.register("nightDiff", { valueAsNumber: true })} 
                  type="number" 
                  step="0.01" 
                  placeholder="10" 
                  className="h-9 rounded-lg border-slate-200 bg-white/50 focus:bg-white focus:ring-0 focus:border-slate-900 transition-all font-mono font-bold text-xs tabular-nums text-center shadow-xs w-full" 
                />
              </div>
              <div className="w-full sm:w-28 space-y-1.5">
                <Label htmlFor="nightDiffHours" className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Total Hours</Label>
                <div className="relative group">
                  <Clock className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-300" />
                  <Input 
                    id="nightDiffHours" 
                    {...form.register("nightDiffHours", { valueAsNumber: true })} 
                    type="number" 
                    step="1" 
                    placeholder="0" 
                    className="h-9 rounded-lg border-slate-200 bg-white/50 focus:bg-white focus:ring-0 focus:border-slate-900 transition-all font-mono font-bold text-xs tabular-nums pr-8 text-center shadow-xs w-full" 
                  />
                </div>
              </div>
            </div>
          </section>

          {/* Allowances Section */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center shadow-sm">
                  <Plus className="w-4 h-4 text-white" />
                </div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900">Allowances</h3>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ label: "", amount: undefined as any })}
                className="text-[9px] font-black uppercase tracking-widest h-7 px-4 rounded-md border-slate-200 hover:bg-slate-900 hover:text-white transition-all w-fit"
              >
                + Add Allowance
              </Button>
            </div>
            
            <div className="grid gap-2">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end animate-in slide-in-from-right-2 duration-500">
                  <div className="sm:col-span-7 space-y-1.5">
                    <Input
                      placeholder="Description"
                      {...form.register(`allowances.${index}.label`)}
                      className="h-9 rounded-lg border-slate-200 bg-white focus:border-indigo-500 transition-all font-bold text-xs px-3 shadow-xs w-full"
                    />
                  </div>
                  <div className="sm:col-span-4 space-y-1.5">
                    <div className="relative group">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 text-[10px] font-black group-focus-within:text-indigo-500 transition-colors">₱ </span>
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="0.00"
                        {...form.register(`allowances.${index}.amount`, { valueAsNumber: true })}
                        className="pl-7 h-9 rounded-lg border-slate-200 bg-white focus:border-indigo-500 transition-all font-mono font-bold text-xs tabular-nums shadow-xs w-full"
                      />
                    </div>
                  </div>
                  <div className="sm:col-span-1 flex justify-end">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => remove(index)}
                      className="h-9 w-9 text-slate-200 hover:text-red-500 transition-all rounded-lg opacity-100 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {fields.length === 0 && (
                <div className="py-8 border border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-300 gap-2 w-full">
                  <Activity className="w-5 h-5 opacity-20" />
                  <p className="text-[9px] font-black uppercase tracking-widest">No allowances added</p>
                </div>
              )}
            </div>
          </section>

          {/* Mandatory Protocols Section */}
          <section className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-red-500 flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-4 h-4 text-white" />
              </div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-900">Mandatory Protocols</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full">
              {[
                { id: "sss", label: "SSS" },
                { id: "pagibig", label: "Pag-IBIG" },
                { id: "philhealth", label: "PhilHealth" },
                { id: "tax", label: "Income Tax" }
              ].map((item) => (
                <div key={item.id} className="space-y-1.5">
                  <Label htmlFor={item.id} className="text-[9px] font-black text-slate-400 uppercase tracking-[0.1em] px-1">{item.label}</Label>
                  <div className="relative group">
                    <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] text-slate-300 font-black">₱ </span>
                    <Input 
                      id={item.id} 
                      {...form.register(item.id as any, { valueAsNumber: true })} 
                      type="number" 
                      step="0.01" 
                      placeholder="0" 
                      className="pl-7 h-9 rounded-lg border-slate-200 bg-slate-50/50 focus:bg-white focus:border-indigo-500 transition-all font-mono font-bold text-xs tabular-nums shadow-xs w-full" 
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-fit h-12 bg-slate-900 hover:bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-[0.3em] shadow-md transition-all active:scale-[0.98] group relative overflow-hidden px-10" 
              disabled={isPending}
            >
              <Activity className={cn("w-3.5 h-3.5 mr-2 relative z-10", isPending && "animate-pulse")} />
              <span className="relative z-10">{isPending ? "Synchronizing..." : "Update Income"}</span>
            </Button>
            {message && (
              <div className={cn(
                "mt-6 p-4 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] text-center animate-in zoom-in-95 duration-500 border",
                message.includes("success") ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"
              )}>
                {message}
              </div>
            )}
          </div>
        </form>
      </div>

      {/* Projection Sidebar */}
      <div className="space-y-6">
        <div className="sticky top-6 space-y-6">
          <Card className="rounded-xl border border-slate-200 bg-white/50 p-4 backdrop-blur-md overflow-hidden relative group shadow-xs">
            <CardHeader className="p-0 pb-4">
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400">Monthly Projection</span>
              </div>
              <CardTitle className="text-2xl font-black font-mono tracking-tight text-slate-900 leading-none tabular-nums">
                ₱ {net.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </CardTitle>
              <CardDescription className="text-[10px] text-slate-400 font-medium italic">Estimated net income</CardDescription>
            </CardHeader>
            <CardContent className="p-0 space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Gross Total</span>
                  <span className="font-mono text-slate-900 tabular-nums">₱ {gross.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                   <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      <span>Basic Salary</span>
                      <span className="tabular-nums">₱ {(watchValues.basicPay || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      <span>Total Allowances</span>
                      <span className="tabular-nums">₱ {totalAllowances.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                   <div className="flex justify-between text-[9px] text-slate-500 font-bold uppercase tracking-tighter">
                      <span>Night Differential</span>
                      <span className="text-emerald-600 tabular-nums">+ ₱ {nightDiffAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                   </div>
                </div>
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                  <span>Total Deductions</span>
                  <span className="font-mono text-red-500 tabular-nums">- ₱ {deductions.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
              
              <div className="p-4 bg-slate-900 rounded-xl space-y-1">
                <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-400">
                  <TrendingUp className="w-3 h-3 text-indigo-400" />
                  <span>Cycle Budget</span>
                </div>
                <div className="text-xl font-black font-mono tracking-tight text-white tabular-nums">₱ {cutoff.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            </CardContent>
          </Card>

          <div className="p-4 bg-white/50 border border-slate-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-slate-400">
              <Info className="w-3.5 h-3.5" />
              <h4 className="text-[9px] font-black uppercase tracking-widest text-slate-900">Logical Scalar</h4>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed font-medium italic">
              Diff yield: (Base / 22 cycles / 8h) * Node Scalar
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
