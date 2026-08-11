import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default async function MaterielDetailPage(
  props: PageProps<"/materiels/[id]">
) {
  const { id } = await props.params;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Fiche materiel {id}</h1>
        <p className="text-muted-foreground">
          Caracteristiques, affectations et historique des modifications (sections 5.2 et 5.3).
        </p>
      </div>

      <Tabs defaultValue="fiche">
        <TabsList>
          <TabsTrigger value="fiche">Fiche</TabsTrigger>
          <TabsTrigger value="affectations">Affectations</TabsTrigger>
          <TabsTrigger value="historique">Historique</TabsTrigger>
        </TabsList>
        <TabsContent value="fiche">
          <Card>
            <CardHeader>
              <CardTitle>Caracteristiques</CardTitle>
              <CardDescription>A charger depuis l&apos;API Laravel.</CardDescription>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              Type, marque/modele, numero de serie, RAM, DD, date d&apos;achat, age calcule,
              date de renouvellement, statut, site/emplacement, observation.
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="affectations">
          <Card>
            <CardHeader>
              <CardTitle>Affectations</CardTitle>
              <CardDescription>
                Utilisateur courant et historique des affectations (changement d&apos;agent, de site).
              </CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
        <TabsContent value="historique">
          <Card>
            <CardHeader>
              <CardTitle>Historique des modifications</CardTitle>
              <CardDescription>Qui, quoi, quand — journal d&apos;audit de cette fiche.</CardDescription>
            </CardHeader>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
