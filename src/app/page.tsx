import prisma from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Wallet, ReceiptText, TrendingDown, TrendingUp, Info, Activity, ArrowUpRight, ArrowDownRight, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export default async function Dashboard() {
  const profile = await prisma.incomeProfile.findFirst({
    include: {
      allowances: true,
    },
  });
  const expenses = await prisma.expense.findMany();

  const basicPay = profile?.basicPay || 0;
  const totalAllowances = profile?.allowances?.reduce((sum, a) => sum + a.amount, 0) || 0;
  const nightDiff = profile?.nightDiff || 0;
  const nightDiffHours = profile?.nightDiffHours || 0;
  const sss = profile?.sss || 0;
  const pagibig = profile?.pagibig || 0;
  const philhealth = profile?.philhealth || 0;
  const tax = profile?.tax || 0;

  const hourlyRate = basicPay / 22 / 8;
  const nightDiffAmount = (hourlyRate * (nightDiff / 100)) * nightDiffHours;
  const monthlyGross = basicPay + totalAllowances + nightDiffAmount;
  const totalGovtDeductions = sss + pagibig + philhealth + tax;
  const monthlyNet = monthlyGross - totalGovtDeductions;
  const cutoffNet = monthlyNet / 2;

  // Calculate Monthly and Cutoff Expenses
  let monthlyExpenses = 0;
  let cutoffExpenses = 0;

  expenses.forEach((exp) => {
    if (exp.frequency === "MONTHLY") {
      monthlyExpenses += exp.amount;
      cutoffExpenses += exp.amount / 2;
    } else if (exp.frequency === "PER CUTOFF") {
      monthlyExpenses += exp.amount * 2;
      cutoffExpenses += exp.amount;
    } else {
      // ONE-TIME: Fully subtract from the current month. 
      // For cutoff, we subtract the full amount if it happened in this cycle.
      // (Simplified for now: subtract full amount from cutoff as well)
      monthlyExpenses += exp.amount;
      cutoffExpenses += exp.amount; 
    }
  });

  const leftoverMonthly = monthlyNet - monthlyExpenses;
  const leftoverCutoff = cutoffNet - cutoffExpenses;

  const StatsCard = ({ title, value, sub, icon: Icon, trend, color }: any) => (
    <Card className="rounded-xl border border-slate-200/60 bg-white/50 p-4 shadow-xs backdrop-blur-md overflow-hidden group">
      <CardHeader className="flex flex-row items-center justify-between pb-2 p-0">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">{title}</span>
        <div className={cn("p-1.5 rounded-lg bg-slate-50 group-hover:scale-110 transition-transform duration-500", color)}>
          <Icon className="w-3.5 h-3.5" />
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-1">
        <div className="flex items-baseline gap-2">
          <span className="text-xl sm:text-2xl font-black font-mono tracking-tight tabular-nums text-slate-900">₱ {value.toLocaleString()}</span>
          {trend && (
            <span className={cn("flex items-center text-[8px] font-bold px-1 py-0.5 rounded-full", 
              trend > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
            )}>
              {trend > 0 ? <ArrowUpRight className="w-2.5 h-2.5 mr-0.5" /> : <ArrowDownRight className="w-2.5 h-2.5 mr-0.5" />}
              {Math.abs(trend)}%
            </span>
          )}
        </div>
        <p className="text-[10px] font-medium text-slate-400">{sub}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-indigo-500">
          <Activity className="w-3.5 h-3.5" />
          <span className="text-[9px] font-black uppercase tracking-[0.3em]">System Overview</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tighter text-slate-900">Dashboard</h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard 
          title="Monthly Net" 
          value={monthlyNet} 
          sub="Take-home pay" 
          icon={Wallet} 
          color="text-indigo-600"
        />
        <StatsCard 
          title="Total Expenses" 
          value={monthlyExpenses} 
          sub="Monthly obligations" 
          icon={ReceiptText} 
          color="text-purple-600"
        />
        <StatsCard 
          title="Monthly Savings" 
          value={leftoverMonthly} 
          sub="Remaining capital" 
          icon={TrendingUp} 
          color={leftoverMonthly >= 0 ? "text-emerald-600" : "text-red-600"}
        />
        <StatsCard 
          title="Per Cut-off" 
          value={leftoverCutoff} 
          sub="Budget per cycle" 
          icon={TrendingDown} 
          color="text-blue-600"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <Card className="rounded-xl border border-slate-200/60 bg-white/50 p-4 sm:p-6 shadow-xs backdrop-blur-md">
          <CardHeader className="flex flex-row items-center justify-between p-0 pb-6">
            <div>
              <CardTitle className="text-xl font-black tracking-tighter text-slate-900">Income Allocation</CardTitle>
              <CardDescription className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">Gross earnings distribution</CardDescription>
            </div>
            <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
              <Activity className="w-5 h-5 text-slate-900" />
            </div>
          </CardHeader>
          <CardContent className="p-0 space-y-6">
            <div className="space-y-6">
              {[
                { label: "Basic Pay", value: basicPay, color: "bg-indigo-600", icon: Wallet },
                { label: "Allowances", value: totalAllowances, color: "bg-purple-500", icon: Zap },
                { label: "Night Differential", value: nightDiffAmount, color: "bg-emerald-500", icon: Activity },
                { label: "Mandatory Deductions", value: totalGovtDeductions, color: "bg-red-400", icon: ReceiptText }
              ].map((item) => (
                <div key={item.label} className="group space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-1.5 h-1.5 rounded-full", item.color)} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{item.label}</span>
                    </div>
                    <span className="font-mono text-[10px] font-black text-slate-900 tabular-nums">₱ {item.value.toLocaleString()}</span>
                  </div>
                  <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000 ease-out", item.color)} 
                      style={{ width: `${(item.value / (monthlyGross || 1)) * 100}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-xl border border-slate-200 bg-slate-900 text-white p-4 sm:p-6 shadow-xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-6 opacity-5 scale-125 -rotate-12 group-hover:rotate-0 transition-transform duration-1000">
            <CpuIcon className="w-48 h-48" />
          </div>
          <CardHeader className="p-0 pb-6">
            <div className="flex items-center gap-2 text-indigo-400 mb-2">
              <Info className="w-3.5 h-3.5" />
              <span className="text-[9px] font-black uppercase tracking-[0.3em]">AI Insight</span>
            </div>
            <CardTitle className="text-2xl font-black tracking-tight leading-none">Budget Protocol</CardTitle>
          </CardHeader>
          <CardContent className="p-0 space-y-6 relative z-10">
            <p className="text-slate-400 leading-relaxed font-medium italic text-sm">
              Post-analysis: Residual capital per cycle is <span className="text-white font-black underline decoration-indigo-500">₱ {leftoverCutoff.toLocaleString()}</span>. 
              {leftoverCutoff > 5000 
                ? " Liquidity: Optimal." 
                : leftoverCutoff > 0 
                ? " Liquidity: Stable." 
                : " Liquidity: Critical."}
            </p>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Efficiency</span>
                <div className="text-lg font-black text-white font-mono tabular-nums">{Math.round((leftoverMonthly / monthlyNet) * 100) || 0}%</div>
              </div>
              <div className="p-3 bg-white/5 rounded-lg border border-white/5 space-y-1">
                <span className="text-[8px] font-black uppercase text-slate-500 tracking-widest">Risk</span>
                <div className="text-lg font-black text-white">{leftoverCutoff < 0 ? "High" : leftoverCutoff < 2000 ? "Medium" : "Low"}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function CpuIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="16" height="16" x="4" y="4" rx="2" />
      <rect width="6" height="6" x="9" y="9" rx="1" />
      <path d="M15 2v2" />
      <path d="M15 20v2" />
      <path d="M2 15h2" />
      <path d="M2 9h2" />
      <path d="M20 15h2" />
      <path d="M20 9h2" />
      <path d="M9 2v2" />
      <path d="M9 20v2" />
    </svg>
  )
}
