import { UserPlus, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const colonnes = ["Identifiant", "Profil", "Site (si gestionnaire)"];

export default function UtilisateursApplicatifsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Utilisateurs applicatifs</h1>
          <p className="text-muted-foreground">
            Comptes et profils (Administrateur, Gestionnaire de site, Consultation) — section 5.1.
          </p>
        </div>
        <Button>
          <UserPlus />
          Nouveau compte
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Comptes</CardTitle>
          <CardDescription>Un compte est associe a un profil et, pour un gestionnaire, a un site.</CardDescription>
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
                      icon={Users}
                      title="Aucun compte applicatif"
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
