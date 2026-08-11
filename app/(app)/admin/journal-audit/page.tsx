import { ScrollText } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "@/components/empty-state";

const colonnes = ["Date", "Materiel", "Champ modifie", "Ancienne valeur", "Nouvelle valeur", "Compte"];

export default function JournalAuditPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Journal d&apos;audit</h1>
        <p className="text-muted-foreground">
          Traçabilité des créations, modifications et suppressions (section 5.3), consultable par
          l&apos;administrateur uniquement.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historique des modifications</CardTitle>
          <CardDescription>Qui, quoi, quand — toutes fiches confondues.</CardDescription>
        </CardHeader>
        <CardContent>
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
                      icon={ScrollText}
                      title="Aucune entree"
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
