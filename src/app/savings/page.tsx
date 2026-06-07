import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PiggyBank, Sparkles, Activity, Target, Fingerprint, Cpu, ShieldCheck } from "lucide-react";

export default function SavingsPage() {
  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-indigo-500">
          <Target className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.5em]">Wealth Protocol</span>
        </div>
        <h1 className="text-5xl font-black tracking-tighter text-slate-900 leading-none">Savings</h1>
        <p className="text-slate-400 font-medium italic text-lg max-w-lg">Strategic accumulation of capital nodes for future resource deployment.</p>
      </div>
      
      <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
        <Card className="border-none shadow-[0_50px_120px_rgba(0,0,0,0.08)] bg-white rounded-[4rem] overflow-hidden relative group p-12 sm:p-20">
          <div className="absolute top-0 right-0 p-16 opacity-5 group-hover:scale-110 transition-transform duration-1000">
             <PiggyBank className="w-96 h-96 text-indigo-900" />
          </div>
          <CardHeader className="text-center pb-12 relative z-10 space-y-10">
            <div className="mx-auto w-32 h-32 bg-slate-900 rounded-[2.5rem] flex items-center justify-center shadow-2xl transform -rotate-6 group-hover:rotate-0 transition-transform duration-700">
              <Cpu className="w-14 h-14 text-indigo-400 animate-pulse" />
            </div>
            <div className="space-y-4">
              <CardTitle className="text-5xl font-black text-slate-900 tracking-tighter">System Offline</CardTitle>
              <CardDescription className="text-xl text-slate-400 font-medium italic max-w-md mx-auto">Wealth module is currently undergoing architectural synthesis. Encryption keys pending.</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="text-center relative z-10">
            <div className="inline-flex items-center justify-center gap-4 font-black text-indigo-600 bg-indigo-50/50 backdrop-blur-md px-10 py-4 rounded-full text-[10px] uppercase tracking-[0.3em] border border-indigo-100">
              <Sparkles className="w-4 h-4 animate-spin-slow" />
              <span>Synthesis in progress</span>
              <Sparkles className="w-4 h-4 animate-spin-slow" />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-8">
           <div className="p-10 bg-slate-900 rounded-[3rem] shadow-2xl space-y-6 relative overflow-hidden group border border-white/5">
              <Fingerprint className="absolute -right-4 -top-4 w-24 h-24 text-white/5 group-hover:scale-110 transition-transform" />
              <div className="flex items-center gap-3 text-indigo-400 relative z-10">
                 <ShieldCheck className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Access Status</span>
              </div>
              <p className="text-slate-400 font-medium italic leading-relaxed relative z-10">
                 Wealth management protocols are restricted during active synthesis. Please maintain current fiscal parameters until authorization is granted.
              </p>
           </div>

           <div className="p-10 bg-white border border-slate-100 rounded-[3rem] shadow-sm space-y-6 group hover:border-slate-200 transition-all">
              <div className="flex items-center gap-3 text-slate-400 group-hover:text-indigo-500 transition-colors">
                 <Activity className="w-5 h-5" />
                 <span className="text-[10px] font-black uppercase tracking-[0.3em]">Node Queue</span>
              </div>
              <div className="space-y-4">
                 {[
                    { label: "Target Synchronization", status: "PENDING" },
                    { label: "Compound Interest Logic", status: "ENCRYPTED" },
                    { label: "Asset Allocation Engine", status: "QUEUED" }
                 ].map((node) => (
                    <div key={node.label} className="flex justify-between items-center px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100/50">
                       <span className="text-[9px] font-black uppercase text-slate-500 tracking-widest">{node.label}</span>
                       <span className="text-[8px] font-black text-indigo-400 tracking-tighter">{node.status}</span>
                    </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}
