import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const echeances = [
  { value: "court", label: "Court terme (< 6 mois)" },
  { value: "moyen", label: "Moyen terme (6-18 mois)" },
  { value: "long", label: "Long terme (> 18 mois)" },
];

export default function RenouvellementsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Alertes de renouvellement</h1>
        <p className="text-muted-foreground">
          Materiel a renouveler selon la duree de vie standard par type (section 5.4).
        </p>
      </div>

      <Tabs defaultValue="court">
        <TabsList>
          {echeances.map((e) => (
            <TabsTrigger key={e.value} value={e.value}>
              {e.label}
            </TabsTrigger>
          ))}
        </TabsList>
        {echeances.map((e) => (
          <TabsContent key={e.value} value={e.value}>
            <Card>
              <CardHeader>
                <CardTitle>{e.label}</CardTitle>
                <CardDescription>Liste a brancher sur l&apos;API Laravel.</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
