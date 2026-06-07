import { getExpenses } from "./actions";
import { ExpenseManager } from "./expense-manager";
import { getIncomeProfile } from "../income/actions";

export default async function ExpensesPage() {
  const expenses = await getExpenses();
  const profile = await getIncomeProfile();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">Expenses & Deductions</h1>
        <p className="text-muted-foreground">Track your recurring and one-time expenses.</p>
      </div>
      <ExpenseManager initialExpenses={expenses} initialProfile={profile} />
    </div>
  );
}
