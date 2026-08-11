import Link from "next/link";
import { Laptop, Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";

const colonnes = [
  "Code poste",
  "Type",
  "Marque / Modele",
  "Utilisateur",
  "Site",
  "Statut",
  "Age",
];

export default function MaterielsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Materiel</h1>
          <p className="text-muted-foreground">
            Recherche multicritere (site, type, statut, utilisateur, marque, age) — section 5.2.
          </p>
        </div>
        <Button render={<Link href="/materiels/nouveau"><Plus />Nouvelle fiche</Link>} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Liste du parc</CardTitle>
          <CardDescription>Vue consolidee, filtrable par site, type et statut.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative min-w-[240px] flex-1">
              <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Code poste, numero de serie, utilisateur..."
                className="pl-8"
              />
            </div>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Site" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="abidjan">Abidjan-Plateau</SelectItem>
                <SelectItem value="ndy">Yamoussoukro (NDY)</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="service">En service</SelectItem>
                <SelectItem value="stock">En stock</SelectItem>
                <SelectItem value="debranche">Debranche</SelectItem>
                <SelectItem value="amorti">Amorti</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  {colonnes.map((colonne) => (
                    <TableHead key={colonne}>{colonne}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="hover:bg-transparent">
                  <TableCell colSpan={colonnes.length} className="p-0">
                    <EmptyState
                      icon={Laptop}
                      title="Aucun materiel"
                      description="A brancher sur l'API Laravel une fois disponible."
                    />
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
