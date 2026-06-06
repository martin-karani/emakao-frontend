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
import { Plus, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

// Sample data for demonstration
const SAMPLE_UNITS = [
  { id: "1", number: "101", property: "Greenwood Apartments", type: "2BHK", status: "occupied", rent: 45000 },
  { id: "2", number: "102", property: "Greenwood Apartments", type: "1BHK", status: "vacant", rent: 30000 },
  { id: "3", number: "A1", property: "City Heights", type: "Office", status: "occupied", rent: 120000 },
  { id: "4", number: "B2", property: "City Heights", type: "Retail", status: "maintenance", rent: 85000 },
];

export default function UnitsPage() {
  const { workspaceMode, activeProperty } = useWorkspace([]);
  
  const filteredUnits = workspaceMode === "property" 
    ? SAMPLE_UNITS.filter(u => u.property === activeProperty?.name)
    : SAMPLE_UNITS;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            {workspaceMode === "property" ? `${activeProperty?.name} Units` : "Portfolio Units"}
          </h2>
          <p className="text-muted-foreground">
            {workspaceMode === "property" 
              ? `Manage units specifically for ${activeProperty?.name}.` 
              : "Overview of all units across your properties."}
          </p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Unit
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search units..."
            className="pl-8"
          />
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
              <TableHead>Unit Number</TableHead>
              {workspaceMode === "agency" && <TableHead>Property</TableHead>}
              <TableHead>Type</TableHead>
              <TableHead>Rent</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUnits.map((unit) => (
              <TableRow key={unit.id}>
                <TableCell className="font-medium">{unit.number}</TableCell>
                {workspaceMode === "agency" && <TableCell>{unit.property}</TableCell>}
                <TableCell>{unit.type}</TableCell>
                <TableCell>{formatKES(unit.rent)}</TableCell>
                <TableCell className="text-center">
                  <Badge 
                    variant={unit.status === "occupied" ? "default" : unit.status === "vacant" ? "secondary" : "outline"}
                  >
                    {unit.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm">Edit</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
