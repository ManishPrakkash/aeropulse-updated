import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

export function Settings() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Monitor Settings</CardTitle>
        <CardDescription>Configure the wheezing detection parameters and notifications.</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6">
        <div className="flex items-center justify-between space-x-2">
          <Label htmlFor="notifications" className="flex flex-col space-y-1">
            <span>Alert Notifications</span>
            <span className="font-normal text-sm text-muted-foreground">
              Receive notifications for high wheezing levels
            </span>
          </Label>
          <Switch id="notifications" />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="threshold">Alert Threshold (%)</Label>
          <Input id="threshold" placeholder="Enter threshold value" type="number" defaultValue={50} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="sample-rate">Sample Rate (Hz)</Label>
          <Input id="sample-rate" placeholder="Enter sample rate" type="number" defaultValue={44100} />
        </div>
        <div className="flex flex-col space-y-1.5">
          <Label htmlFor="buffer-size">Buffer Size</Label>
          <Input id="buffer-size" placeholder="Enter buffer size" type="number" defaultValue={2048} />
        </div>
        <Button>Save Settings</Button>
      </CardContent>
    </Card>
  );
}
