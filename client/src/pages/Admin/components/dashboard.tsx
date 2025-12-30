import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Calendar, Users, UtensilsCrossed, TrendingUp, Clock, Euro, ChefHat, Star } from "lucide-react";
import { useTranslation } from "react-i18next";

export const Dashboard = () => {
  const { t } = useTranslation();

  // Mock data for restaurant dashboard
  const todayStats = {
    reservations: 18,
    covers: 52,
    tablesOccupied: 14,
    totalTables: 18,
    revenue: 2340,
    avgTicket: 45,
  };

  const upcomingReservations = [
    { id: 1, name: "Dupont", time: "19:00", covers: 4, table: "T3", status: "confirmed" },
    { id: 2, name: "Martin", time: "19:30", covers: 2, table: "T7", status: "confirmed" },
    { id: 3, name: "Bernard", time: "20:00", covers: 6, table: "T12", status: "pending" },
    { id: 4, name: "Lefebvre", time: "20:30", covers: 3, table: "T5", status: "confirmed" },
    { id: 5, name: "Moreau", time: "21:00", covers: 2, table: "T9", status: "confirmed" },
  ];

  const weeklyStats = [
    { day: "Lun", reservations: 12, revenue: 1850 },
    { day: "Mar", reservations: 15, revenue: 2100 },
    { day: "Mer", reservations: 18, revenue: 2450 },
    { day: "Jeu", reservations: 22, revenue: 2890 },
    { day: "Ven", reservations: 28, revenue: 3650 },
    { day: "Sam", reservations: 32, revenue: 4200 },
    { day: "Dim", reservations: 24, revenue: 3100 },
  ];

  const topClients = [
    { name: "Marie Dupont", visits: 12, lastVisit: "Il y a 3 jours", favorite: "Table fenêtre" },
    { name: "Jean Martin", visits: 8, lastVisit: "Il y a 1 semaine", favorite: "Menu dégustation" },
    { name: "Sophie Bernard", visits: 6, lastVisit: "Hier", favorite: "Vin rouge maison" },
  ];

  return (
    <div className="flex flex-col px-4 space-y-6 md:px-8 py-6">
      {/* Welcome Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bienvenue, Restaurant Le Gourmet</h1>
          <p className="text-muted-foreground">Voici le résumé de votre activité</p>
        </div>
        <div className="text-right text-sm text-muted-foreground">
          <div className="font-medium text-foreground">
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <div>Service du soir</div>
        </div>
      </div>

      {/* Main Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Réservations ce soir</CardTitle>
            <Calendar className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats.reservations}</div>
            <p className="text-xs text-muted-foreground">+3 par rapport à hier</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Couverts attendus</CardTitle>
            <Users className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats.covers}</div>
            <p className="text-xs text-muted-foreground">Capacité max: 72</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Tables occupées</CardTitle>
            <UtensilsCrossed className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {todayStats.tablesOccupied}/{todayStats.totalTables}
            </div>
            <div className="w-full bg-muted rounded-full h-2 mt-2">
              <div
                className="bg-accent rounded-full h-2"
                style={{ width: `${(todayStats.tablesOccupied / todayStats.totalTables) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">CA estimé ce soir</CardTitle>
            <Euro className="w-4 h-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{todayStats.revenue}€</div>
            <p className="text-xs text-muted-foreground">Ticket moyen: {todayStats.avgTicket}€</p>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Upcoming Reservations */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Prochaines réservations</CardTitle>
                <CardDescription>Ce soir à partir de 19h</CardDescription>
              </div>
              <Clock className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingReservations.map((reservation) => (
                <div
                  key={reservation.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-medium">
                      {reservation.name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-medium">{reservation.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {reservation.covers} pers. • {reservation.table}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{reservation.time}</div>
                    <div className={`text-xs ${reservation.status === "confirmed" ? "text-accent" : "text-yellow-500"}`}>
                      {reservation.status === "confirmed" ? "Confirmé" : "En attente"}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Overview */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Aperçu de la semaine</CardTitle>
                <CardDescription>Réservations et chiffre d'affaires</CardDescription>
              </div>
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {weeklyStats.map((day, index) => (
                <div key={day.day} className="flex items-center gap-4">
                  <div className="w-10 text-sm font-medium text-muted-foreground">{day.day}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div className="bg-primary rounded-full h-2" style={{ width: `${(day.reservations / 35) * 100}%` }} />
                      </div>
                      <span className="text-sm w-8 text-right">{day.reservations}</span>
                    </div>
                  </div>
                  <div className="w-20 text-right text-sm font-medium">{day.revenue}€</div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-border flex justify-between text-sm">
              <span className="text-muted-foreground">Total semaine</span>
              <span className="font-bold">{weeklyStats.reduce((acc, d) => acc + d.revenue, 0)}€</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Third Row */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Top Clients */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Clients fidèles</CardTitle>
                <CardDescription>Vos clients les plus réguliers</CardDescription>
              </div>
              <Star className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between p-3 rounded-lg border border-border">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center text-accent font-bold">
                      #{index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{client.name}</div>
                      <div className="text-sm text-muted-foreground">{client.favorite}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{client.visits} visites</div>
                    <div className="text-xs text-muted-foreground">{client.lastVisit}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Actions rapides</CardTitle>
              <ChefHat className="w-5 h-5 text-muted-foreground" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <button className="w-full p-3 rounded-lg border border-border text-left hover:bg-muted/50 transition-colors">
                <div className="font-medium">+ Nouvelle réservation</div>
                <div className="text-sm text-muted-foreground">Ajouter manuellement</div>
              </button>
              <button className="w-full p-3 rounded-lg border border-border text-left hover:bg-muted/50 transition-colors">
                <div className="font-medium">Voir le plan de salle</div>
                <div className="text-sm text-muted-foreground">Organisation des tables</div>
              </button>
              <button className="w-full p-3 rounded-lg border border-border text-left hover:bg-muted/50 transition-colors">
                <div className="font-medium">Envoyer des rappels</div>
                <div className="text-sm text-muted-foreground">3 rappels en attente</div>
              </button>
              <button className="w-full p-3 rounded-lg border border-border text-left hover:bg-muted/50 transition-colors">
                <div className="font-medium">Exporter les données</div>
                <div className="text-sm text-muted-foreground">Rapport du mois</div>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
