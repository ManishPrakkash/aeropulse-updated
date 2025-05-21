import { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Calendar, Clock, Headphones, Mic, Plus, User, Users } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";

export function MonitorPage() {
  const [patients, setPatients] = useState([
    { id: 1, name: "John Doe", age: 45, lastSession: "Today, 10:30 AM", status: "Stable", wheezingLevel: 25 },
    { id: 2, name: "Sarah Smith", age: 32, lastSession: "Yesterday", status: "Improving", wheezingLevel: 15 },
    { id: 3, name: "Robert Johnson", age: 58, lastSession: "3 days ago", status: "Needs attention", wheezingLevel: 65 },
  ]);

  const recentSessions = [
    { id: 1, patientName: "John Doe", date: "Today", time: "10:30 AM", duration: "15 min", maxLevel: 25 },
    { id: 2, name: "Sarah Smith", date: "Yesterday", time: "2:15 PM", duration: "20 min", maxLevel: 15 },
    { id: 3, name: "Robert Johnson", date: "3 days ago", time: "9:45 AM", duration: "10 min", maxLevel: 65 },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Patient
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Patients</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Users className="h-8 w-8 mr-3 opacity-80" />
              <div>
                <div className="text-3xl font-bold">24</div>
                <p className="text-blue-100 text-sm">+3 this month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Sessions Today</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Activity className="h-8 w-8 mr-3 opacity-80" />
              <div>
                <div className="text-3xl font-bold">8</div>
                <p className="text-emerald-100 text-sm">2 scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Avg. Session Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 mr-3 opacity-80" />
              <div>
                <div className="text-3xl font-bold">12m</div>
                <p className="text-amber-100 text-sm">+2m from last week</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Headphones className="h-8 w-8 mr-3 opacity-80" />
              <div>
                <div className="text-3xl font-bold">3</div>
                <p className="text-purple-100 text-sm">Needs attention</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="md:col-span-2 border-0 shadow-lg hover:shadow-xl transition-all duration-200">
          <CardHeader>
            <CardTitle>Recent Monitoring Sessions</CardTitle>
            <CardDescription>Overview of the latest breathing monitoring sessions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                  <div className="mr-4 p-2 bg-primary/10 rounded-full">
                    <Calendar className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{session.patientName || session.name}</h4>
                    <p className="text-sm text-muted-foreground">{session.date} at {session.time}</p>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{session.duration}</div>
                    <div className="text-sm text-muted-foreground">Max: {session.maxLevel}%</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Sessions</Button>
          </CardFooter>
        </Card>

        <Link to="/live-monitor" className="block">
          <Card className="h-full border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mic className="mr-2 h-5 w-5" />
                Live Monitor
              </CardTitle>
              <CardDescription className="text-slate-300">Start a new breathing monitoring session</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center space-y-4">
              <div className="w-32 h-32 rounded-full bg-slate-700 flex items-center justify-center">
                <Mic className="h-16 w-16 text-primary" />
              </div>
              <p className="text-center text-slate-300">
                Click to start a new live monitoring session to analyze breathing patterns in real-time
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full bg-primary hover:bg-primary/90">Start Monitoring</Button>
            </CardFooter>
          </Card>
        </Link>
      </div>

      <div className="mb-6">
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Patient Overview</CardTitle>
            <CardDescription>Quick status of patients requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {patients.map((patient) => (
                <div key={patient.id} className="flex items-center p-3 rounded-lg border bg-card hover:bg-accent/10 transition-colors">
                  <div className="mr-4 p-2 bg-primary/10 rounded-full">
                    <User className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-medium">{patient.name}</h4>
                    <p className="text-sm text-muted-foreground">Age: {patient.age} • Last session: {patient.lastSession}</p>
                  </div>
                  <div className="w-32">
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Status: {patient.status}</span>
                      <span>{patient.wheezingLevel}%</span>
                    </div>
                    <Progress
                      value={patient.wheezingLevel}
                      className="h-1.5"
                      style={{
                        background: 'linear-gradient(to right, #22c55e, #eab308, #ef4444)',
                        maskImage: `linear-gradient(to right, #000 ${patient.wheezingLevel}%, transparent ${patient.wheezingLevel}%)`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full">View All Patients</Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
