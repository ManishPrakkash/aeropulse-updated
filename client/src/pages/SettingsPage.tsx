import { useState } from "react";
import {
  Bell,
  BellOff,
  Cloud,
  Database,
  HardDrive,
  Lock,
  Mail,
  Save,
  Settings as SettingsIcon,
  Smartphone,
  User,
  Volume2
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
import { Label } from "../components/ui/label";
import { Switch } from "../components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "../components/ui/select";
import { Separator } from "../components/ui/separator";

export function SettingsPage() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [smsNotifications, setSmsNotifications] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [autoSave, setAutoSave] = useState(true);
  const [cloudSync, setCloudSync] = useState(true);
  const [bluetoothEnabled, setBluetoothEnabled] = useState(false);
  const [threshold, setThreshold] = useState("50");
  const [sampleRate, setSampleRate] = useState("44100");
  const [bufferSize, setBufferSize] = useState("2048");
  const [volume, setVolume] = useState("80");
  const [dataRetention, setDataRetention] = useState("90");

  const handleSaveSettings = () => {
    // In a real app, this would save the settings to a database or local storage
    alert("Settings saved successfully!");
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button onClick={handleSaveSettings}>
            <Save className="mr-2 h-4 w-4" />
            Save Changes
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 lg:w-[600px]">
          <TabsTrigger value="general" className="flex items-center">
            <SettingsIcon className="mr-2 h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="monitoring" className="flex items-center">
            <Volume2 className="mr-2 h-4 w-4" />
            Monitoring
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center">
            <Database className="mr-2 h-4 w-4" />
            Data & Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>General Settings</CardTitle>
                <CardDescription>Configure the application's general behavior</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="dark-mode">Dark Mode</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable dark mode for the application
                    </p>
                  </div>
                  <Switch
                    id="dark-mode"
                    checked={darkMode}
                    onCheckedChange={setDarkMode}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-save">Auto Save</Label>
                    <p className="text-sm text-muted-foreground">
                      Automatically save session data
                    </p>
                  </div>
                  <Switch
                    id="auto-save"
                    checked={autoSave}
                    onCheckedChange={setAutoSave}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cloud-sync">Cloud Sync</Label>
                    <p className="text-sm text-muted-foreground">
                      Sync data with cloud storage
                    </p>
                  </div>
                  <Switch
                    id="cloud-sync"
                    checked={cloudSync}
                    onCheckedChange={setCloudSync}
                  />
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="bluetooth">Bluetooth Connectivity</Label>
                    <p className="text-sm text-muted-foreground">
                      Enable Bluetooth for external devices
                    </p>
                  </div>
                  <Switch
                    id="bluetooth"
                    checked={bluetoothEnabled}
                    onCheckedChange={setBluetoothEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account information</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" defaultValue="Dr. Smith" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" defaultValue="dr.smith@hospital.com" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input id="phone" type="tel" defaultValue="(555) 123-4567" />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="zh">Chinese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  <Lock className="mr-2 h-4 w-4" />
                  Change Password
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="monitoring">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Monitoring Settings</CardTitle>
              <CardDescription>Configure the wheezing detection parameters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="threshold">Alert Threshold (%)</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="threshold"
                      type="number"
                      value={threshold}
                      onChange={(e) => setThreshold(e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wheezing level that triggers alerts
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sample-rate">Sample Rate</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="sample-rate"
                      type="number"
                      value={sampleRate}
                      onChange={(e) => setSampleRate(e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">Hz</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Audio sampling frequency
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="buffer-size">Buffer Size</Label>
                  <Input
                    id="buffer-size"
                    type="number"
                    value={bufferSize}
                    onChange={(e) => setBufferSize(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Audio processing buffer size
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="volume">Alert Volume</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="volume"
                      type="number"
                      value={volume}
                      onChange={(e) => setVolume(e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Volume level for alert sounds
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Advanced Settings</h3>

                <div className="space-y-2">
                  <Label htmlFor="algorithm">Detection Algorithm</Label>
                  <Select defaultValue="spectral">
                    <SelectTrigger id="algorithm">
                      <SelectValue placeholder="Select algorithm" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="spectral">Spectral Analysis</SelectItem>
                      <SelectItem value="wavelet">Wavelet Transform</SelectItem>
                      <SelectItem value="ml">Machine Learning</SelectItem>
                      <SelectItem value="hybrid">Hybrid Approach</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Algorithm used for wheezing detection
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sensitivity">Detection Sensitivity</Label>
                  <Select defaultValue="medium">
                    <SelectTrigger id="sensitivity">
                      <SelectValue placeholder="Select sensitivity" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Sensitivity level for wheezing detection
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline">Reset to Defaults</Button>
              <Button>Apply Changes</Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure how you receive alerts and notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Enable Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications for important events
                  </p>
                </div>
                <Switch
                  id="notifications"
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Channels</h3>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via email
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="email-notifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                    disabled={!notificationsEnabled}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="h-4 w-4 text-muted-foreground" />
                    <div className="space-y-0.5">
                      <Label htmlFor="sms-notifications">SMS Notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive notifications via SMS
                      </p>
                    </div>
                  </div>
                  <Switch
                    id="sms-notifications"
                    checked={smsNotifications}
                    onCheckedChange={setSmsNotifications}
                    disabled={!notificationsEnabled}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h3 className="text-lg font-medium">Notification Types</h3>

                <div className="space-y-2">
                  <Label>Select events to be notified about:</Label>
                  <div className="grid gap-2">
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="high-wheezing" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="high-wheezing" className="text-sm">High wheezing levels detected</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="session-complete" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="session-complete" className="text-sm">Monitoring session completed</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="new-patient" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="new-patient" className="text-sm">New patient added</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="appointment" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="appointment" className="text-sm">Upcoming appointments</label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input type="checkbox" id="system" className="rounded border-gray-300" defaultChecked />
                      <label htmlFor="system" className="text-sm">System updates and maintenance</label>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Data Storage</CardTitle>
                <CardDescription>Configure how data is stored and managed</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Data Retention Period</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      id="data-retention"
                      type="number"
                      value={dataRetention}
                      onChange={(e) => setDataRetention(e.target.value)}
                    />
                    <span className="text-sm text-muted-foreground">days</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    How long to keep monitoring session data
                  </p>
                </div>

                <Separator />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="local-storage">Local Storage</Label>
                    <p className="text-sm text-muted-foreground">
                      Store data on local device
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <HardDrive className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">2.4 GB used</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="cloud-storage">Cloud Storage</Label>
                    <p className="text-sm text-muted-foreground">
                      Store data in secure cloud
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Cloud className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">4.7 GB used</span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Data Export Format</Label>
                  <Select defaultValue="json">
                    <SelectTrigger>
                      <SelectValue placeholder="Select format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="json">JSON</SelectItem>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xml">XML</SelectItem>
                      <SelectItem value="pdf">PDF Report</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">
                  Export All Data
                </Button>
              </CardFooter>
            </Card>

            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle>Privacy & Security</CardTitle>
                <CardDescription>Manage privacy settings and security options</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="data-sharing">Data Sharing</Label>
                    <p className="text-sm text-muted-foreground">
                      Share anonymized data for research
                    </p>
                  </div>
                  <Switch id="data-sharing" defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="analytics">Usage Analytics</Label>
                    <p className="text-sm text-muted-foreground">
                      Collect anonymous usage statistics
                    </p>
                  </div>
                  <Switch id="analytics" defaultChecked />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Session Timeout</Label>
                  <Select defaultValue="30">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timeout" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Automatically log out after inactivity
                  </p>
                </div>

                <Separator />

                <div className="space-y-2">
                  <h3 className="text-lg font-medium">Data Management</h3>
                  <div className="grid gap-2">
                    <Button variant="outline" className="justify-start">
                      <User className="mr-2 h-4 w-4" />
                      Request Account Data
                    </Button>
                    <Button variant="outline" className="justify-start text-destructive hover:text-destructive">
                      <BellOff className="mr-2 h-4 w-4" />
                      Delete All Notifications
                    </Button>
                    <Button variant="outline" className="justify-start text-destructive hover:text-destructive">
                      <Database className="mr-2 h-4 w-4" />
                      Delete All Session Data
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
