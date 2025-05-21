import { useState } from "react";
import {
  Activity,
  Calendar,
  ChevronDown,
  Clock,
  FileText,
  Filter,
  Wind,
  Plus,
  Search
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import { Progress } from "../components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";

export function PatientPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const patients = [
    {
      id: 1,
      name: "John Doe",
      age: 45,
      gender: "Male",
      email: "john.doe@example.com",
      phone: "(555) 123-4567",
      address: "123 Main St, Anytown, USA",
      medicalHistory: "Asthma, Hypertension",
      lastSession: "Today, 10:30 AM",
      nextAppointment: "Jun 15, 2024",
      status: "Stable",
      wheezingLevel: 25,
      respiratoryRate: 16,
      oxygenLevel: 98,
      medications: ["Albuterol", "Lisinopril"],
      notes: "Patient showing improvement after medication adjustment"
    },
    {
      id: 2,
      name: "Sarah Smith",
      age: 32,
      gender: "Female",
      email: "sarah.smith@example.com",
      phone: "(555) 987-6543",
      address: "456 Oak Ave, Somewhere, USA",
      medicalHistory: "Allergic Rhinitis",
      lastSession: "Yesterday",
      nextAppointment: "Jun 20, 2024",
      status: "Improving",
      wheezingLevel: 15,
      respiratoryRate: 14,
      oxygenLevel: 99,
      medications: ["Flonase", "Zyrtec"],
      notes: "Seasonal allergies well controlled with current regimen"
    },
    {
      id: 3,
      name: "Robert Johnson",
      age: 58,
      gender: "Male",
      email: "robert.johnson@example.com",
      phone: "(555) 456-7890",
      address: "789 Pine St, Elsewhere, USA",
      medicalHistory: "COPD, Diabetes",
      lastSession: "3 days ago",
      nextAppointment: "Jun 10, 2024",
      status: "Needs attention",
      wheezingLevel: 65,
      respiratoryRate: 22,
      oxygenLevel: 92,
      medications: ["Spiriva", "Metformin", "Prednisone"],
      notes: "Increased wheezing noted, may need adjustment to respiratory medications"
    },
    {
      id: 4,
      name: "Emily Wilson",
      age: 27,
      gender: "Female",
      email: "emily.wilson@example.com",
      phone: "(555) 234-5678",
      address: "321 Elm St, Nowhere, USA",
      medicalHistory: "Exercise-induced asthma",
      lastSession: "1 week ago",
      nextAppointment: "Jun 25, 2024",
      status: "Stable",
      wheezingLevel: 20,
      respiratoryRate: 15,
      oxygenLevel: 98,
      medications: ["Singulair", "Ventolin (as needed)"],
      notes: "Doing well with current management plan"
    },
  ];

  const filteredPatients = patients.filter(patient => {
    // Filter by search query
    if (searchQuery && !patient.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    // Filter by tab
    if (activeTab === "attention" && patient.wheezingLevel < 50) {
      return false;
    }

    return true;
  });

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Patients</h1>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Patient
          </Button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search patients..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                <Filter className="mr-2 h-4 w-4" />
                Filter
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>All Patients</DropdownMenuItem>
              <DropdownMenuItem>Recent Activity</DropdownMenuItem>
              <DropdownMenuItem>Upcoming Appointments</DropdownMenuItem>
              <DropdownMenuItem>High Risk</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <Tabs defaultValue="all" className="mb-6" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All Patients</TabsTrigger>
          <TabsTrigger value="attention">Needs Attention</TabsTrigger>
          <TabsTrigger value="recent">Recent Activity</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredPatients.map((patient) => (
          <Card key={patient.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <div className="flex items-center">
                  <Avatar className="h-10 w-10 mr-3">
                    <AvatarImage src={`/avatars/0${patient.id}.png`} alt={patient.name} />
                    <AvatarFallback>{patient.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{patient.name}</CardTitle>
                    <CardDescription>{patient.age} years • {patient.gender}</CardDescription>
                  </div>
                </div>
                <Button variant="ghost" size="icon">
                  <FileText className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center">
                    <Wind className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Wheezing:</span>
                  </div>
                  <div className="font-medium text-right">{patient.wheezingLevel}%</div>

                  <div className="flex items-center">
                    <Activity className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Resp. Rate:</span>
                  </div>
                  <div className="font-medium text-right">{patient.respiratoryRate} bpm</div>

                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Last Session:</span>
                  </div>
                  <div className="font-medium text-right">{patient.lastSession}</div>

                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span className="text-muted-foreground">Next Appt:</span>
                  </div>
                  <div className="font-medium text-right">{patient.nextAppointment}</div>
                </div>

                <div>
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
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" size="sm">View Profile</Button>
              <Button size="sm">Start Session</Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
