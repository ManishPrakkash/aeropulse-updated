import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

const sessions = [
  {
    id: 1,
    date: "2024-02-23",
    time: "14:30",
    duration: "15 min",
    maxLevel: "75%",
    status: "Completed",
  },
  {
    id: 2,
    date: "2024-02-23",
    time: "10:15",
    duration: "20 min",
    maxLevel: "45%",
    status: "Completed",
  },
  {
    id: 3,
    date: "2024-02-22",
    time: "15:45",
    duration: "10 min",
    maxLevel: "60%",
    status: "Completed",
  },
];

export function SessionHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session History</CardTitle>
        <CardDescription>View previous monitoring sessions and their results.</CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Time</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Max Level</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sessions.map((session) => (
              <TableRow key={session.id}>
                <TableCell>{session.date}</TableCell>
                <TableCell>{session.time}</TableCell>
                <TableCell>{session.duration}</TableCell>
                <TableCell>{session.maxLevel}</TableCell>
                <TableCell>{session.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
