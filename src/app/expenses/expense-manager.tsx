"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { addExpense, deleteExpense } from "./actions";
import { Trash2, Plus, ReceiptText, Calculator, History, Zap, Calendar, Activity, TrendingDown, LayoutGrid, Sparkles } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface Expense {
  id: string;
  title: string;
  amount: number;
  type: string;
  frequency: string;
  date: Date;
  createdAt: Date;
}

const expenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().min(0.01, "Amount must be greater than 0"),
  type: z.enum(["EXPENSE", "DEDUCTION"]),
  frequency: z.enum(["ONCE", "MONTHLY", "PER CUTOFF"]),
  date: z.string().optional(),
}).refine((data) => {
  if (data.frequency === "ONCE" && !data.date) {
    return false;
  }
  return true;
}, {
  message: "Date is required for one-time expenses",
  path: ["date"],
});

type ExpenseFormValues = z.infer<typeof expenseSchema>;

export function ExpenseManager({ 
  initialExpenses, 
  initialProfile 
}: { 
  initialExpenses: Expense[];
  initialProfile: any | null;
}) {
  const [isPending, startTransition] = useTransition();

  const form = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseSchema),
    defaultValues: {
      title: "",
      amount: undefined as any,
      type: "EXPENSE",
      frequency: "MONTHLY",
      date: "",
    },
  });

  const watchFrequency = form.watch("frequency");
  const watchType = form.watch("type");

  const calculateBudget = () => {
    if (!initialProfile) return { cutoffNet: 0, constantCutoff: 0, remaining: 0 };
    const basicPay = initialProfile.basicPay || 0;
    const nightDiff = initialProfile.nightDiff || 0;
    const nightDiffHours = initialProfile.nightDiffHours || 0;
    const allowances = initialProfile.allowances?.reduce((sum: number, a: any) => sum + (a.amount || 0), 0) || 0;
    const hourlyRate = basicPay / 22 / 8;
    const nightDiffAmount = (hourlyRate * (nightDiff / 100)) * nightDiffHours;
    const gross = basicPay + allowances + nightDiffAmount;
    const deductions = (initialProfile.sss || 0) + (initialProfile.pagibig || 0) + (initialProfile.philhealth || 0) + (initialProfile.tax || 0);
    const net = gross - deductions;
    const cutoffNet = net / 2;
    const constantCutoff = initialExpenses.reduce((sum, exp) => {
      if (exp.frequency === "MONTHLY") return sum + (exp.amount / 2);
      if (exp.frequency === "PER CUTOFF") return sum + exp.amount;
      return sum;
    }, 0);
    return { cutoffNet, constantCutoff, remaining: cutoffNet - constantCutoff };
  };

  const { cutoffNet, constantCutoff, remaining } = calculateBudget();

  function onSubmit(values: ExpenseFormValues) {
    startTransition(async () => {
      await addExpense({
        ...values as any,
        date: values.date ? new Date(values.date) : new Date(),
      });
      form.reset({
        ...form.getValues(),
        title: "",
        amount: undefined as any,
        date: "",
      });
    });
  }

  const constantExpenses = initialExpenses.filter(e => e.frequency !== "ONCE");
  const unprecedentedExpenses = initialExpenses.filter(e => e.frequency === "ONCE");

  const ExpenseTable = ({ expenses, emptyMessage, showDate = true }: { expenses: Expense[], emptyMessage: string, showDate?: boolean }) => (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader className="bg-slate-50/50">
          <TableRow className="hover:bg-transparent border-slate-100">
            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 py-3 pl-3">Description</TableHead>
            <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 py-3">Frequency</TableHead>
            {showDate && <TableHead className="font-black text-[9px] uppercase tracking-widest text-slate-400 py-3">Date</TableHead>}
            <TableHead className="text-right font-black text-[9px] uppercase tracking-widest text-slate-400 py-3 pr-3">Amount</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {expenses.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showDate ? 5 : 4} className="text-center py-12 text-slate-300 font-medium italic text-xs">
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            expenses.map((item) => (
              <TableRow key={item.id} className="hover:bg-slate-50/40 transition-colors group border-slate-50">
                <TableCell className="py-2.5 pl-3">
                  <div className="flex flex-col gap-0.5">
                    <span className="font-bold text-slate-900 tracking-tight text-xs">{item.title}</span>
                    <span className={cn(
                      "text-[7px] font-black tracking-[0.2em] uppercase px-1.5 py-0.5 rounded-sm border w-fit",
                      item.type === "EXPENSE" ? "bg-orange-50 text-orange-600 border-orange-100" : "bg-indigo-50 text-indigo-600 border-indigo-100"
                    )}>
                      {item.type}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-2.5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter bg-slate-100 px-1.5 py-0.5 rounded-sm">
                    {item.frequency === "PER CUTOFF" ? "Cutoff" : item.frequency.replace("_", " ")}
                  </span>
                </TableCell>
                {showDate && (
                  <TableCell className="py-2.5">
                    <div className="flex items-center gap-1.5 text-slate-500 font-mono text-[10px] font-bold">
                      <Calendar className="w-3 h-3 text-slate-300" />
                      {format(new Date(item.date), "dd MMM yyyy")}
                    </div>
                  </TableCell>
                )}
                <TableCell className="text-right py-2.5 pr-3">
                  <span className="text-xs font-black text-slate-900 font-mono tracking-tighter tabular-nums">
                    ₱ {item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </TableCell>
                <TableCell className="py-2.5 pr-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-slate-200 hover:text-red-500 hover:bg-red-50 transition-all rounded-md opacity-100 sm:opacity-0 group-hover:opacity-100 active:scale-90"
                    onClick={() => {
                      if (confirm("Delete this transaction?")) {
                        startTransition(() => deleteExpense(item.id));
                      }
                    }}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* High-Density Budget Monitoring */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-full">
        <div className="p-4 sm:p-5 rounded-2xl md:rounded-xl border border-slate-200/60 dark:border-white/[0.05] bg-white/50 backdrop-blur-md space-y-2 group hover:border-indigo-100 transition-all duration-300">
          <div className="flex items-center gap-3 text-slate-400">
            <Calculator className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Monthly Net</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums text-slate-900">₱ {cutoffNet.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
        
        <div className="p-4 sm:p-5 rounded-2xl md:rounded-xl border border-slate-200/60 dark:border-white/[0.05] bg-white/50 backdrop-blur-md space-y-2 group hover:border-red-100 transition-all duration-300">
          <div className="flex items-center gap-3 text-slate-400">
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em]">Fixed Costs</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums text-red-500">₱ {constantCutoff.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>

        <div className="p-4 sm:p-5 rounded-2xl md:rounded-xl border border-slate-200/60 dark:border-white/[0.05] bg-slate-900 shadow-sm space-y-2 relative overflow-hidden group">
          <Activity className="absolute -right-4 -top-4 w-20 h-20 text-white/5 transition-transform duration-700" />
          <div className="flex items-center gap-3 relative z-10">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-500">Remaining Budget</span>
          </div>
          <div className="text-2xl sm:text-3xl font-black font-mono tracking-tight tabular-nums text-white relative z-10">₱ {remaining.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
        </div>
      </div>

      {/* Transaction Entry Module */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-500">
          <LayoutGrid className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Add Transaction</span>
        </div>

        <Card className="rounded-2xl border border-slate-200/50 bg-white/40 p-4 sm:p-6 backdrop-blur-md overflow-hidden w-fit max-w-full">
          <CardContent className="p-0">
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid grid-cols-1 gap-3 sm:grid-cols-12 items-end">
              <div className="sm:col-span-4 space-y-1.5 min-w-[140px] sm:min-w-[200px]">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Description</Label>
                <Input {...form.register("title")} placeholder="Rent, Netflix, etc..." className="h-9 rounded-lg border-slate-200 focus:border-slate-900 transition-all font-bold bg-white text-xs px-3 w-full" />
              </div>
              <div className="sm:col-span-3 space-y-1.5 w-[120px] sm:w-[140px]">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Amount</Label>
                <div className="relative group">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300 font-black text-[10px] pointer-events-none select-none">
                    ₱
                  </span>
                  <Input 
                    {...form.register("amount", { valueAsNumber: true })} 
                    type="number" 
                    step="0.01" 
                    placeholder="0.00" 
                    className="pl-7 sm:pl-8 pr-3 h-9 rounded-lg border-slate-200 focus:border-slate-900 transition-all font-mono font-bold bg-white text-xs tabular-nums w-full" 
                  />
                </div>
              </div>
              <div className="sm:col-span-3 space-y-1.5 w-[140px] sm:w-[160px]">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Classification</Label>
                <Select onValueChange={(v) => form.setValue("type", v as any)} value={watchType}>
                  <SelectTrigger className="h-9 rounded-lg border-slate-200 focus:ring-0 focus:border-slate-900 font-bold bg-white text-xs px-3 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl p-1.5">
                    <SelectItem value="EXPENSE" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Expense</SelectItem>
                    <SelectItem value="DEDUCTION" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Deduction</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-2 space-y-1.5 w-[120px] sm:w-[140px]">
                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">Frequency</Label>
                <Select onValueChange={(v) => form.setValue("frequency", v as any)} value={watchFrequency}>
                  <SelectTrigger className="h-9 rounded-lg border-slate-200 focus:ring-0 focus:border-slate-900 font-bold bg-white text-xs px-3 w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-100 shadow-xl p-1.5">
                    <SelectItem value="ONCE" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">One-time</SelectItem>
                    <SelectItem value="MONTHLY" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Monthly</SelectItem>
                    <SelectItem value="PER CUTOFF" className="rounded-lg font-bold text-[10px] uppercase tracking-widest">Cutoff</SelectItem>
                  </SelectContent>
                </Select>
              </div>


              <div className="sm:col-span-12 flex flex-col sm:flex-row gap-3 items-end mt-2">
                {watchFrequency === "ONCE" && (
                  <div className="flex-1 space-y-1 w-full sm:max-w-xs">
                    <Label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Temporal Node</Label>
                    <Input {...form.register("date")} type="date" className="h-9 rounded-lg text-xs px-3" />
                  </div>
                )}
                <div className="w-full flex justify-start">
                  <Button 
                    type="submit" 
                    className="h-10 bg-slate-900 hover:bg-black text-white rounded-lg text-xs font-bold uppercase tracking-widest px-10 relative overflow-hidden transition-all w-fit"
                    disabled={isPending}
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-2" />
                    {isPending ? "Adding..." : "Add Transaction"}
                  </Button>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </section>

      {/* Compact History Module */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 text-indigo-500">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em]">Transaction History</span>
        </div>

        <Tabs defaultValue="constant" className="w-full">
          <TabsList className="h-9 p-1 rounded-lg bg-slate-100/80 inline-flex w-auto mb-4 border border-slate-200/50">
            <TabsTrigger value="constant" className="px-4 font-bold text-[10px] tracking-wider rounded-md h-full data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all uppercase">
              Constant Obligations
            </TabsTrigger>
            <TabsTrigger value="unprecedented" className="px-4 font-bold text-[10px] tracking-wider rounded-md h-full data-[state=active]:bg-white data-[state=active]:shadow-sm transition-all uppercase">
              Unprecedented Costs
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="constant" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="rounded-xl border border-slate-200/60 bg-white/50 overflow-hidden shadow-xs">
              <ExpenseTable 
                expenses={constantExpenses} 
                emptyMessage="No constant obligations recorded." 
                showDate={false}
              />
            </Card>
          </TabsContent>

          <TabsContent value="unprecedented" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <Card className="rounded-xl border border-slate-200/60 bg-white/50 overflow-hidden shadow-xs">
              <ExpenseTable 
                expenses={unprecedentedExpenses} 
                emptyMessage="No unprecedented cost nodes detected." 
              />
            </Card>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}
