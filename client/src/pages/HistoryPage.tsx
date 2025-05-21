import { useState } from "react";
import {
  BarChart3,
  Calendar,
  ChevronDown,
  Clock,
  Download,
  Filter,
  Wind,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "../components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "../components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Legend,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";

export function HistoryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [timeRange, setTimeRange] = useState("week");

  const sessions = [
    {
      id: 1,
      patientId: 1,
      patientName: "John Doe",
      date: "Jun 5, 2024",
      time: "10:30 AM",
      duration: "15 min",
      maxLevel: 25,
      avgLevel: 18,
      respiratoryRate: 16,
      oxygenLevel: 98,
      notes: "Normal breathing patterns observed"
    },
    {
      id: 2,
      patientId: 2,
      patientName: "Sarah Smith",
      date: "Jun 4, 2024",
      time: "2:15 PM",
      duration: "20 min",
      maxLevel: 15,
      avgLevel: 12,
      respiratoryRate: 14,
      oxygenLevel: 99,
      notes: "Patient showing improvement"
    },
    {
      id: 3,
      patientId: 3,
      patientName: "Robert Johnson",
      date: "Jun 2, 2024",
      time: "9:45 AM",
      duration: "10 min",
      maxLevel: 65,
      avgLevel: 48,
      respiratoryRate: 22,
      oxygenLevel: 92,
      notes: "Increased wheezing detected, follow-up recommended"
    },
    {
      id: 4,
      patientId: 1,
      patientName: "John Doe",
      date: "May 30, 2024",
      time: "11:00 AM",
      duration: "12 min",
      maxLevel: 30,
      avgLevel: 22,
      respiratoryRate: 17,
      oxygenLevel: 97,
      notes: "Slight improvement from previous session"
    },
    {
      id: 5,
      patientId: 4,
      patientName: "Emily Wilson",
      date: "May 29, 2024",
      time: "3:30 PM",
      duration: "18 min",
      maxLevel: 20,
      avgLevel: 15,
      respiratoryRate: 15,
      oxygenLevel: 98,
      notes: "Normal breathing patterns"
    },
  ];

  const filteredSessions = sessions.filter(session => {
    // Filter by search query
    if (searchQuery && !session.patientName.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }

    return true;
  });

  // Data for trend chart
  const trendData = [
    { date: "May 1", avgWheezing: 35, maxWheezing: 52, sessions: 5 },
    { date: "May 8", avgWheezing: 32, maxWheezing: 48, sessions: 7 },
    { date: "May 15", avgWheezing: 30, maxWheezing: 45, sessions: 6 },
    { date: "May 22", avgWheezing: 28, maxWheezing: 42, sessions: 8 },
    { date: "May 29", avgWheezing: 25, maxWheezing: 40, sessions: 9 },
    { date: "Jun 5", avgWheezing: 22, maxWheezing: 38, sessions: 6 },
  ];

  // Data for patient distribution
  const patientDistributionData = [
    { name: "Normal (0-20%)", value: 15, fill: "#22c55e" },
    { name: "Mild (21-40%)", value: 8, fill: "#84cc16" },
    { name: "Moderate (41-60%)", value: 5, fill: "#eab308" },
    { name: "Severe (61-80%)", value: 3, fill: "#f97316" },
    { name: "Critical (81-100%)", value: 1, fill: "#ef4444" },
  ];

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Session History</h1>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export Data
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Total Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Calendar className="h-8 w-8 mr-3 text-primary opacity-80" />
              <div>
                <div className="text-3xl font-bold">32</div>
                <p className="text-muted-foreground text-sm">This month</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Average Duration</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Clock className="h-8 w-8 mr-3 text-primary opacity-80" />
              <div>
                <div className="text-3xl font-bold">15m</div>
                <p className="text-muted-foreground text-sm">Per session</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Avg. Wheezing Level</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <Wind className="h-8 w-8 mr-3 text-primary opacity-80" />
              <div>
                <div className="text-3xl font-bold">28%</div>
                <p className="text-muted-foreground text-sm">Across all patients</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card className="md:col-span-2 border-0 shadow-lg">
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Wheezing Trends</CardTitle>
                <CardDescription>Average and maximum wheezing levels over time</CardDescription>
              </div>
              <Select defaultValue={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Select range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                  <SelectItem value="year">Last Year</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis dataKey="date" />
                  <YAxis yAxisId="left" orientation="left" domain={[0, 100]} />
                  <YAxis yAxisId="right" orientation="right" domain={[0, 15]} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Legend />
                  <Area
                    yAxisId="left"
                    type="monotone"
                    dataKey="avgWheezing"
                    name="Avg Wheezing %"
                    fill="rgba(59, 130, 246, 0.2)"
                    stroke="#3b82f6"
                    strokeWidth={2}
                  />
                  <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="maxWheezing"
                    name="Max Wheezing %"
                    stroke="#ef4444"
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="sessions"
                    name="Sessions"
                    fill="#8884d8"
                    radius={[4, 4, 0, 0]}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Patient Distribution</CardTitle>
            <CardDescription>By wheezing severity level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={patientDistributionData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" />
                  <YAxis dataKey="name" type="category" width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1f2937', border: 'none', borderRadius: '0.5rem' }}
                    labelStyle={{ color: '#e5e7eb' }}
                  />
                  <Bar dataKey="value" name="Patients" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-lg mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row justify-between md:items-center">
            <div>
              <CardTitle>Recent Sessions</CardTitle>
              <CardDescription>Detailed view of recent monitoring sessions</CardDescription>
            </div>
            <div className="flex flex-col md:flex-row gap-4 mt-4 md:mt-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Search sessions..."
                  className="pl-10 md:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="flex items-center">
                    <Filter className="mr-2 h-4 w-4" />
                    Filter
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem>All Sessions</DropdownMenuItem>
                  <DropdownMenuItem>High Wheezing</DropdownMenuItem>
                  <DropdownMenuItem>Last Week</DropdownMenuItem>
                  <DropdownMenuItem>Last Month</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Patient</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Wheezing Level</TableHead>
                <TableHead>Respiratory Rate</TableHead>
                <TableHead>Oxygen Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSessions.map((session) => (
                <TableRow key={session.id} className="hover:bg-accent/10">
                  <TableCell>
                    <div className="flex items-center">
                      <Avatar className="h-8 w-8 mr-2">
                        <AvatarImage src={`/avatars/0${session.patientId}.png`} alt={session.patientName} />
                        <AvatarFallback>{session.patientName.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                      </Avatar>
                      <span>{session.patientName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span>{session.date}</span>
                      <span className="text-muted-foreground text-xs">{session.time}</span>
                    </div>
                  </TableCell>
                  <TableCell>{session.duration}</TableCell>
                  <TableCell>
                    <div className="flex items-center">
                      <span className={`inline-block w-2 h-2 rounded-full mr-2 ${
                        session.maxLevel > 60 ? 'bg-red-500' :
                        session.maxLevel > 40 ? 'bg-amber-500' :
                        'bg-green-500'
                      }`}></span>
                      <span>
                        {session.maxLevel}% max
                        <span className="text-muted-foreground text-xs ml-1">({session.avgLevel}% avg)</span>
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>{session.respiratoryRate} bpm</TableCell>
                  <TableCell>{session.oxygenLevel}%</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="h-8 px-2">
                      <BarChart3 className="h-4 w-4 mr-1" />
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {filteredSessions.length} of {sessions.length} sessions
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>Previous</Button>
            <Button variant="outline" size="sm" disabled>Next</Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
