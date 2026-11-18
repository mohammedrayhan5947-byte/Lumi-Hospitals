import { getExpenses } from "@/actions/finance"
import { AddExpenseDialog } from "@/components/finance/add-expense-dialog"
import { ExpensesTable } from "@/components/finance/expenses-table"
import { formatCurrency } from "@/lib/format"
import { PrintButton } from "@/components/shared/print-button"

export default async function ExpensesPage() {
  const expenses = await getExpenses({})
  const total = expenses.reduce((sum, e) => sum + Number(e.amount), 0)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Expenses</h1>
          <p className="text-sm text-muted-foreground">{formatCurrency(total)} total recorded</p>
        </div>
        <div className="flex items-center gap-2"><PrintButton /><AddExpenseDialog /></div>
      </div>
      <ExpensesTable expenses={expenses} />
    </div>
  )
}
