"use client";
import { useWorkspace } from "@/hooks";
import { Button } from "@/components/ui/button";
import { formatKES } from "@emakao/shared";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Receipt, Filter, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { formatShortDate } from "@/lib/date-format";

// Sample data for demonstration
const SAMPLE_EXPENSES = [
  {
    id: "EXP-001",
    description: "Plumbing repair",
    property: "Greenwood Apartments",
    amount: 5000,
    category: "Maintenance",
    date: "2024-03-02",
  },
  {
    id: "EXP-002",
    description: "Security guard salary",
    property: "City Heights",
    amount: 45000,
    category: "Operations",
    date: "2024-03-01",
  },
  {
    id: "EXP-003",
    description: "Elevator servicing",
    property: "City Heights",
    amount: 12000,
    category: "Maintenance",
    date: "2024-03-05",
  },
];

export default function ExpensesPage() {
  const { workspaceMode, activeProperty } = useWorkspace([]);

  const filteredExpenses =
    workspaceMode === "property"
      ? SAMPLE_EXPENSES.filter((e) => e.property === activeProperty?.name)
      : SAMPLE_EXPENSES;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {workspaceMode === "property"
              ? `${activeProperty?.name} Expenses`
              : "Agency Expenses"}
          </h2>
          <p className="text-muted-foreground">
            {workspaceMode === "property"
              ? `Track operational costs for ${activeProperty?.name}.`
              : "Overview of all expenses across the agency portfolio."}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Record Expense
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search expenses..." className="pl-8" />
        </div>
        <Button variant="outline" size="sm">
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      <div className="rounded-md border bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Description</TableHead>
              {workspaceMode === "agency" && <TableHead>Property</TableHead>}
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredExpenses.map((expense) => (
              <TableRow key={expense.id}>
                <TableCell>{formatShortDate(expense.date)}</TableCell>
                <TableCell className="font-medium">
                  {expense.description}
                </TableCell>
                {workspaceMode === "agency" && (
                  <TableCell>{expense.property}</TableCell>
                )}
                <TableCell>
                  <Badge variant="outline">{expense.category}</Badge>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatKES(expense.amount)}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">
                    <Receipt className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
