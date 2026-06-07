import { getIncomeProfile } from "./actions";
import { IncomeForm } from "./income-form";

export default async function IncomePage() {
  const profile = await getIncomeProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Income Tracking</h1>
        <p className="text-muted-foreground">Manage your salary, benefits, and deductions.</p>
      </div>
      <IncomeForm initialData={profile} />
    </div>
  );
}
