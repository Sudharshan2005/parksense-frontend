"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Car, LogOut, MoreHorizontal, RefreshCw, Search, User } from "lucide-react"
// import SimplifiedParkingMap from "@/components/simple-parking-map"
import SimplifiedParkingMap from "@/components/enhanced-parking-map"
import Clock from "@/components/clock"
import LastUpdated from "@/components/last-updated"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface VehicleUser {
  name: string
  phone: string
}

interface Vehicle {
  id: number
  plateNumber: string
  slot: string
  entryTime: string
  duration: string
  status: string
  user: VehicleUser
}

const mockEntryExitData = [
  {
    id: 1,
    plateNumber: "KA01AB1234",
    slot: "L1-A3",
    entryTime: "2025-04-28T09:15:00Z",
    exitTime: "2025-04-28T11:00:00Z",
    duration: "1h 45m",
  },
  {
    id: 2,
    plateNumber: "MH02CD5678",
    slot: "L2-B7",
    entryTime: "2025-04-28T10:30:00Z",
    exitTime: "2025-04-28T12:45:00Z",
    duration: "2h 15m",
  },
  {
    id: 3,
    plateNumber: "DL03EF9012",
    slot: "L3-C12",
    entryTime: "2025-04-29T08:00:00Z",
    exitTime: "2025-04-29T09:30:00Z",
    duration: "1h 30m",
  },
  {
    id: 4,
    plateNumber: "GJ04GH3456",
    slot: "L4-D5",
    entryTime: "2025-04-29T14:00:00Z",
    exitTime: null,
    duration: "Ongoing",
  },
]

const mockRoverData = [
  {
    id: "Rover-001",
    batteryHealth: 85,
    lastCharged: "2025-04-29T18:00:00Z",
    distanceRoamed: 3200, // meters
    platesScanned: 45,
    recentActivity: [
      "2025-04-29T17:45:00Z: Scanned plate KA01AB1234 at L1-A3",
      "2025-04-29T17:30:00Z: Moved to L2-B section",
      "2025-04-29T17:15:00Z: Scanned plate MH02CD5678 at L2-B7",
      "2025-04-29T17:00:00Z: Detected obstacle at L3-C12",
      "2025-04-29T16:45:00Z: Scanned plate DL03EF9012 at L3-C12",
    ],
  },
  {
    id: "Rover-002",
    batteryHealth: 92,
    lastCharged: "2025-04-29T20:00:00Z",
    distanceRoamed: 2800, // meters
    platesScanned: 38,
    recentActivity: [
      "2025-04-29T19:50:00Z: Scanned plate GJ04GH3456 at L4-D5",
      "2025-04-29T19:40:00Z: Moved to L1-A section",
      "2025-04-29T19:30:00Z: Scanned plate KA01AB1234 at L1-A3",
      "2025-04-29T19:20:00Z: Detected low battery warning",
      "2025-04-29T19:10:00Z: Scanned plate MH02CD5678 at L2-B7",
    ],
  },
]

export default function AdminDashboard() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [parkingData, setParkingData] = useState<Vehicle[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [showVehicleDetails, setShowVehicleDetails] = useState(false)
  const [fromDate, setFromDate] = useState<string>("2025-04-28")
  const [toDate, setToDate] = useState<string>("2025-04-29")


  // useEffect(() => {
  //   const reloadInterval = setInterval(() => {
  //     window.location.reload();
  //   }, 20000);

  //   return () => clearInterval(reloadInterval);
  // }, []);

  // Mock data - in a real app, this would come from an API
  useEffect(() => {
    // Simulate API call
    setIsLoading(true)
    setTimeout(() => {
      const mockData: Vehicle[] = [
        {
          id: 1,
          plateNumber: "KA01AB1234",
          slot: "L1-A3",
          entryTime: "09:15 AM",
          duration: "1h 45m",
          status: "active",
          user: {
            name: "John Doe",
            phone: "+1 (555) 123-4567",
          },
        },
        {
          id: 2,
          plateNumber: "MH02CD5678",
          slot: "L1-B2",
          entryTime: "10:30 AM",
          duration: "0h 30m",
          status: "active",
          user: {
            name: "Jane Smith",
            phone: "+1 (555) 987-6543",
          },
        },
        {
          id: 3,
          plateNumber: "DL03EF9012",
          slot: "L1-A4",
          entryTime: "08:45 AM",
          duration: "2h 15m",
          status: "active",
          user: {
            name: "Robert Johnson",
            phone: "+1 (555) 456-7890",
          },
        },
        {
          id: 4,
          plateNumber: "TN04GH3456",
          slot: "L4-B5",
          entryTime: "11:00 AM",
          duration: "0h 05m",
          status: "active",
          user: {
            name: "Emily Davis",
            phone: "+1 (555) 234-5678",
          },
        },
      ]

      setParkingData(mockData)
      setIsLoading(false)
    }, 1500)
  }, [])

  const handleRefresh = () => {
    setIsLoading(true)
    setTimeout(() => {
      toast({
        title: "Data Refreshed",
        description: "Parking data has been updated.",
      })
      setIsLoading(false)
    }, 1000)
  }

  const handleLogout = () => {
    toast({
      title: "Logged Out",
      description: "You have been logged out successfully.",
    })
    router.push("/admin/login")
  }

  const handleVehicleClick = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle)
    setShowVehicleDetails(true)
  }

  const downloadCSV = () => {
    const filteredData = mockEntryExitData.filter((entry) => {
      const entryDate = new Date(entry.entryTime).toISOString().split("T")[0]
      return entryDate >= fromDate && entryDate <= toDate
    })

    const headers = ["ID,Plate Number,Slot,Entry Time,Exit Time,Duration"]
    const rows = filteredData.map((entry) =>
      `${entry.id},${entry.plateNumber},${entry.slot},${entry.entryTime},${entry.exitTime || "Ongoing"},${entry.duration}`
    )
    const csvContent = [...headers, ...rows].join("\n")
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
    const link = document.createElement("a")
    link.href = URL.createObjectURL(blob)
    link.setAttribute("download", `parking_entries_exits_${fromDate}_to_${toDate}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const filteredEntries = mockEntryExitData.filter((entry) => {
    const entryDate = new Date(entry.entryTime).toISOString().split("T")[0]
    return entryDate >= fromDate && entryDate <= toDate
  })
  const totalEntries = filteredEntries.length
  const totalExits = filteredEntries.filter((entry) => entry.exitTime !== null).length
  const avgDuration =
    filteredEntries
      .filter((entry) => entry.exitTime)
      .reduce((sum, entry) => {
        const [hours, minutes] = entry.duration.split("h ")
        return sum + parseInt(hours) * 60 + parseInt(minutes)
      }, 0) /
    totalExits || 0
  const peakHours = filteredEntries
    .map((entry) => new Date(entry.entryTime).getHours())
    .reduce((acc, hour) => {
      acc[hour] = (acc[hour] || 0) + 1
      return acc
    }, {} as Record<number, number>)
  const peakHour = Object.entries(peakHours).reduce(
    (max, [hour, count]) => (count > max.count ? { hour: parseInt(hour), count } : max),
    { hour: 0, count: 0 }
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-gray-800 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <Car className="h-6 w-6" />
            <h1 className="text-xl font-bold">ParkSense Admin</h1>
          </motion.div>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <div className="grid gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h2 className="text-2xl font-bold">Parking Overview</h2>
                <p className="text-gray-400">Monitor and manage all parking activities</p>
              </div>

              <div className="flex items-center gap-2">
                <div className="bg-gray-900 rounded-md p-2 flex items-center gap-2">
                  <Badge variant="outline">4/20</Badge>
                  <span className="text-sm">Spots Occupied</span>
                </div>

                <Button variant="outline" size="sm">
                  <Search className="h-4 w-4 mr-2" />
                  Find Vehicle
                </Button>
              </div>
            </div>

            <Tabs defaultValue="map">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="map">Parking Map</TabsTrigger>
                <TabsTrigger value="vehicles">Vehicles</TabsTrigger>
                <TabsTrigger value="reports">Reports</TabsTrigger>
              </TabsList>

              <TabsContent value="map" className="mt-4">
                <Card>
                  <CardHeader>
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle>Live Parking Map</CardTitle>
                      <CardDescription className="mt-1">Real-time view of all parking spots and their current status.</CardDescription>
                    </div>
                    <div className="flex flex-col items-end">
                      <Clock />
                      <LastUpdated />
                    </div>
                  </div>
                  </CardHeader>
                  <CardContent>
                    <div className="aspect-video w-full">
                      <SimplifiedParkingMap suggestedSlot={null} isAdminView={true} vehicles={parkingData} onOccupiedSlotClick={handleVehicleClick} />
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="vehicles" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Active Vehicles</CardTitle>
                    <CardDescription>List of all vehicles currently in the parking lot.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {isLoading ? (
                      <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                      </div>
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Plate Number</TableHead>
                            <TableHead>Slot</TableHead>
                            <TableHead>Entry Time</TableHead>
                            <TableHead>Duration</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {parkingData.map((vehicle) => (
                            <TableRow
                              key={vehicle.id}
                              className="cursor-pointer hover:bg-gray-900"
                              onClick={() => handleVehicleClick(vehicle)}
                            >
                              <TableCell className="font-medium">{vehicle.plateNumber}</TableCell>
                              <TableCell>{vehicle.slot}</TableCell>
                              <TableCell>{vehicle.entryTime}</TableCell>
                              <TableCell>{vehicle.duration}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="capitalize">
                                  {vehicle.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                                    <Button variant="ghost" size="icon">
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleVehicleClick(vehicle)
                                      }}
                                    >
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        toast({
                                          title: "Manual Exit",
                                          description: `Vehicle ${vehicle.plateNumber} has been marked as exited.`,
                                        })
                                      }}
                                    >
                                      Mark as Exited
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="reports" className="mt-4">
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Download Entry/Exit Reports</CardTitle>
              <CardDescription>Select a date range to download vehicle entry and exit data as CSV.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="fromDate">From Date</Label>
                  <Input
                    id="fromDate"
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="toDate">To Date</Label>
                  <Input
                    id="toDate"
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={downloadCSV} className="w-full">
                    Download CSV
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automated Parking System Reports</CardTitle>
              <CardDescription>Summary of parking activity based on selected date range.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border border-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Total Entries</h3>
                  <p className="text-2xl font-bold">{totalEntries}</p>
                </div>
                <div className="p-4 border border-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Total Exits</h3>
                  <p className="text-2xl font-bold">{totalExits}</p>
                </div>
                <div className="p-4 border border-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Average Parking Duration</h3>
                  <p className="text-2xl font-bold">
                    {Math.floor(avgDuration / 60)}h {avgDuration % 60}m
                  </p>
                </div>
                <div className="p-4 border border-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">Peak Parking Hour</h3>
                  <p className="text-2xl font-bold">
                    {peakHour.hour}:00 - {peakHour.hour + 1}:00 ({peakHour.count} entries)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Rover Reports</CardTitle>
              <CardDescription>Status and activity of autonomous rovers in the parking facility.</CardDescription>
            </CardHeader>
            <CardContent>
              {mockRoverData.map((rover) => (
                <div key={rover.id} className="mb-6 p-4 border border-gray-800 rounded-lg">
                  <h3 className="text-lg font-medium mb-2">{rover.id}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Battery Health</p>
                      <p className="text-xl font-bold">{rover.batteryHealth}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Last Charged</p>
                      <p className="text-xl font-bold">
                        {new Date(rover.lastCharged).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Distance Roamed</p>
                      <p className="text-xl font-bold">{rover.distanceRoamed} meters</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Number Plates Scanned</p>
                      <p className="text-xl font-bold">{rover.platesScanned}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm text-gray-400">Recent Activity</p>
                    <ul className="list-disc pl-5 mt-2 space-y-1 text-sm text-gray-400">
                      {rover.recentActivity.map((activity, index) => (
                        <li key={index}>{activity}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </TabsContent>

            </Tabs>
          </div>

          {/* Vehicle Details Dialog */}
          {selectedVehicle && (
            <Dialog open={showVehicleDetails} onOpenChange={setShowVehicleDetails}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Vehicle Details</DialogTitle>
                  <DialogDescription>Detailed information about the selected vehicle.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col items-center gap-4 p-4 border border-gray-800 rounded-lg bg-gray-900">
                    <Car className="h-12 w-12" />
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {selectedVehicle.plateNumber}
                    </Badge>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Parking Slot</p>
                      <p className="text-lg font-medium">{selectedVehicle.slot}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Entry Time</p>
                      <p className="text-lg font-medium">{selectedVehicle.entryTime}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Duration</p>
                      <p className="text-lg font-medium">{selectedVehicle.duration}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-gray-400">Status</p>
                      <Badge variant="outline" className="capitalize">
                        {selectedVehicle.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-4">
                    <h4 className="text-sm font-medium mb-2">Driver Information</h4>
                    <div className="flex items-center gap-4 p-2 border border-gray-800 rounded-lg">
                      <User className="h-8 w-8 text-gray-400" />
                      <div>
                        <p className="font-medium">{selectedVehicle.user.name}</p>
                        <p className="text-sm text-gray-400">{selectedVehicle.user.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowVehicleDetails(false)}>
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      toast({
                        title: "Manual Exit",
                        description: `Vehicle ${selectedVehicle.plateNumber} has been marked as exited.`,
                      })
                      setShowVehicleDetails(false)
                    }}
                  >
                    Mark as Exited
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </motion.div>
      </main>
    </div>
  )
}
