import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const referentiels = [
  { value: "types", label: "Types de materiel" },
  { value: "statuts", label: "Statuts" },
  { value: "sites", label: "Sites / emplacements" },
];

export default function ReferentielsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Referentiels et parametrage</h1>
        <p className="text-muted-foreground">
          Listes normalisees + duree de vie standard par type et delai d&apos;anticipation des
          alertes (section 5.7).
        </p>
      </div>

      <Tabs defaultValue="types">
        <TabsList>
          {referentiels.map((r) => (
            <TabsTrigger key={r.value} value={r.value}>
              {r.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {referentiels.map((r) => (
          <TabsContent key={r.value} value={r.value}>
            <Card>
              <CardHeader>
                <CardTitle>{r.label}</CardTitle>
                <CardDescription>A brancher sur l&apos;API Laravel.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
