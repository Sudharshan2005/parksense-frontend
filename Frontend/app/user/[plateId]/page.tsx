"use client"

import type React from "react"
import { useState, useEffect } from "react"
import axios from "axios"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Clock, Car, MapPin, LogOut, TimerIcon, ThumbsUp } from "lucide-react"
import SimplifiedParkingMap from "@/components/enhanced-parking-map"
import Timer from "@/components/timer"
import { QRCodeSVG } from "qrcode.react"

interface UserInfo {
  phone: string
}

interface FeedbackData {
  rating: number
  comment: string
}

interface Vehicle {
  _id: string
  plateNumber: string
  slot: string
  entryTime: string
  duration: string
  status: string
  user: { name?: string; phone: string }
}

interface Direction {
  slot: string
  fromEntrance: string[]
  toExit: string[]
}

export default function UserDashboard() {
  const params = useParams<{ plateId: string }>()
  const router = useRouter()
  const { toast } = useToast()

  const [showConfirmation, setShowConfirmation] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo>({ phone: "" })
  const [parkingStarted, setParkingStarted] = useState(true)
  const [entryTime, setEntryTime] = useState(new Date().toISOString())
  const [suggestedSlot, setSuggestedSlot] = useState("L1-A1")
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDirectionsDialog, setShowDirectionsDialog] = useState(false)
  const [showQRDialog, setShowQRDialog] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({ rating: 5, comment: "" })
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("park")
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [slot, setSlot] = useState(suggestedSlot)
  const [direction, setDirection] = useState<Direction | null>(null)
  const [isLoadingDirections, setIsLoadingDirections] = useState(false)
  const [exitTime, setExitTime] = useState<string | null>(null)
  const [parkingDuration, setParkingDuration] = useState<string | null>(null)
  const [qrCodeUrl, setQrCodeUrl] = useState("")
  const [elapsedTime, setElapsedTime] = useState(0)

  const plateNumber = params.plateId || "KA01AB1234"
  const phoneNumber = userInfo.phone || "Error"

  // Set QR code URL client-side
  useEffect(() => {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/exit-confirmation/${plateNumber}`
      setQrCodeUrl(url)
    }
  }, [plateNumber])

  useEffect(() => {
    const fetchVehicle = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/vehicles/get/${plateNumber}`)
        if (!response.ok) {
          throw new Error('Failed to fetch vehicle')
        }
        const vehicle: Vehicle = await response.json()
        setEntryTime(vehicle.entryTime)
        setParkingStarted(vehicle.status === 'Active')
        setSlot(vehicle.slot)
        setSuggestedSlot(vehicle.slot)
        if (vehicle.status === 'Exited') {
          setExitTime(vehicle.duration)
          setParkingDuration(vehicle.duration)
        }
      } catch (error) {
        console.error('Error fetching vehicle:', error)
        toast({
          title: 'Error',
          description: 'Failed to load vehicle data. Please try again.',
          variant: 'destructive',
        })
        // Fallback to show confirmation dialog if vehicle not found
        setEntryTime(new Date().toISOString())
        setShowConfirmation(true)
      }
    }
    fetchVehicle()
  }, [plateNumber, toast])

  // Function to pick a suggested slot nearest to the entrance
  const pickSuggestedSlot = (vehicles: Vehicle[]): string => {
    const levels = ["L1", "L2", "L3", "L4"]
    const rows = 4
    const columns = 12
    const sections = ["A", "B", "C", "D"]

    const availableSlots: { id: string; level: string; section: string; slotNumber: number }[] = []

    levels.forEach((level) => {
      for (let row = 0; row < rows; row++) {
        const sectionIndex = Math.floor(row / 2)
        const section = sections[sectionIndex]
        for (let col = 0; col < columns; col++) {
          const slotNumber = (row % 2) * columns + col + 1
          const slotId = `${level}-${section}${slotNumber}`
          const isOccupied = vehicles.some((vehicle) => vehicle.slot === slotId)
          if (!isOccupied) {
            availableSlots.push({ id: slotId, level, section, slotNumber })
          }
        }
      }
    })

    availableSlots.sort((a, b) => {
      const levelOrder = levels.indexOf(a.level) - levels.indexOf(b.level)
      if (levelOrder !== 0) return levelOrder
      const sectionOrder = sections.indexOf(a.section) - sections.indexOf(b.section)
      if (sectionOrder !== 0) return sectionOrder
      return a.slotNumber - b.slotNumber
    })

    if (availableSlots.length === 0) {
      toast({
        title: "No Available Slots",
        description: "All parking slots are occupied. Please contact support.",
        variant: "destructive",
      })
      return "L1-A1"
    }
    const selectedSlot = availableSlots[0].id
    setSlot(selectedSlot)
    return selectedSlot
  }

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/vehicles')
        if (!response.ok) {
          throw new Error('Failed to fetch vehicles')
        }
        const data: Vehicle[] = await response.json()
        setVehicles(data)
        const suggested = pickSuggestedSlot(data.filter((entry) => entry.status !== "Exited"))
        setSuggestedSlot(suggested)
      } catch (error) {
        console.error('Error fetching vehicles:', error)
        toast({
          title: 'Error',
          description: 'Failed to load vehicle data.',
          variant: 'destructive',
        })
      }
    }
    fetchVehicles()
  }, [params.plateId])

  useEffect(() => {
    
  })
  const fetchDirections = async () => {
    setIsLoadingDirections(true)
    try {
      const res = await axios.get(`http://localhost:5001/api/directions/${slot}`)
      setDirection(res.data)
    } catch (err) {
      console.error('Error fetching directions:', err)
      toast({
        title: 'Error',
        description: 'Failed to fetch directions. Please try again.',
        variant: 'destructive',
      })
      setDirection({
        slot,
        fromEntrance: ["Directions not available for this slot."],
        toExit: ["Directions not available for this slot."],
      })
    } finally {
      setIsLoadingDirections(false)
    }
  }

  const handleUserInfoSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInfo.phone) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`http://localhost:5001/api/vehicles/${plateNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          slot: suggestedSlot,
          phone: phoneNumber,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to create vehicle')
      }

      const newVehicle: Vehicle = await response.json()
      setVehicles((prev) => [...prev, newVehicle])
      setEntryTime(newVehicle.entryTime)
      setShowConfirmation(false)
      setActiveTab("park")
      toast({
        title: "Welcome to ParkSense",
        description: `Hello, we've suggested a parking spot for you: ${suggestedSlot}.`,
      })
      // Fetch directions for the confirmed slot
      setSlot(suggestedSlot)
      fetchDirections()
    } catch (error) {
      console.error('Error creating vehicle:', error)
      toast({
        title: "Error",
        description: "Failed to start parking session.",
        variant: "destructive",
      })
    }
  }

  const handleFeedbackSubmit = async () => {
    try {
      setError(null)
      const response = await fetch('http://localhost:5001/api/feedback', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plateNumber, phoneNumber, ...feedback }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit feedback')
      }

      const data = await response.json()
      setShowFeedback(false)
      setFeedback({ rating: 5, comment: '' })
      toast({
        title: "Thank You!",
        description: "Your feedback has been submitted successfully.",
      })
    } catch (error: any) {
      console.error('Error submitting feedback:', error)
      setError(error.message || 'An error occurred while submitting feedback')
      toast({
        title: "Error",
        description: error.message || "Failed to submit feedback.",
        variant: "destructive",
      })
    }
  }

  const handleExit = async () => {
    try {
      const start = new Date(entryTime)
      const end = new Date()
      const durationMs = end.getTime() - start.getTime()

      const hours = Math.floor(durationMs / (1000 * 60 * 60))
      const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60))
      const formattedDuration = (hours > 0 ? `${hours}h ` : '') + `${minutes}m`

      const response = await fetch(`http://localhost:5001/api/vehicles/${plateNumber}/exit`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exitTime: end.toISOString(),
          duration: formattedDuration,
          status: "Exited",
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to update vehicle status')
      }

      setParkingStarted(false)
      setExitTime(end.toISOString())
      setParkingDuration(formattedDuration)

      toast({
        title: "Parking Session Ended",
        description: `Your parking duration: ${formattedDuration}`,
      })

      setShowFeedback(true)
    } catch (error) {
      console.error('Error ending parking session:', error)
      toast({
        title: "Error",
        description: "Failed to end parking session. Please try again.",
        variant: "destructive",
      })
    }
  }

  const currentDirections = direction || {
    slot: suggestedSlot,
    fromEntrance: ["Directions not available. Please fetch directions."],
    toExit: ["Directions not available. Please fetch directions."],
  }

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
            <h1 className="text-xl font-bold">ParkSense</h1>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="flex items-center gap-2"
          >
            <TimerIcon className="h-6 w-6" />
          </motion.div>
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <AnimatePresence>
          {showConfirmation && (
            <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Confirm Your Vehicle</DialogTitle>
                  <DialogDescription>
                    We've detected your vehicle. Please confirm and provide your details.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="flex flex-col items-center gap-4 p-4 border border-gray-800 rounded-lg bg-gray-900">
                    <Car className="h-12 w-12" />
                    <Badge variant="outline" className="text-lg px-4 py-2">
                      {plateNumber}
                    </Badge>
                    <p className="text-sm text-gray-400">Is this your vehicle?</p>
                  </div>

                  <form onSubmit={handleUserInfoSubmit} className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="phone">Phone Number</Label>
                      <Input
                        id="phone"
                        value={userInfo.phone}
                        onChange={(e) => setUserInfo({ ...userInfo, phone: e.target.value })}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </form>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleUserInfoSubmit} disabled={!userInfo.phone}>
                    Confirm & Continue
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {showFeedback && (
            <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Your Experience</DialogTitle>
                  <DialogDescription>
                    How was your parking experience with ParkSense today?
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label>Rate your experience</Label>
                    <RadioGroup
                      defaultValue="5"
                      onValueChange={(value) => setFeedback({ ...feedback, rating: Number.parseInt(value) })}
                      className="flex justify-between"
                    >
                      {[1, 2, 3, 4, 5].map((rating) => (
                        <div key={rating} className="flex flex-col items-center gap-1">
                          <RadioGroupItem
                            value={rating.toString()}
                            id={`rating-${rating}`}
                            className="sr-only"
                          />
                          <Label
                            htmlFor={`rating-${rating}`}
                            className={`cursor-pointer p-2 rounded-full hover:bg-gray-800 ${
                              feedback.rating === rating ? "bg-gray-800" : ""
                            }`}
                          >
                            <ThumbsUp
                              className={`h-6 w-6 ${
                                feedback.rating === rating ? "text-primary" : "text-gray-500"
                              }`}
                            />
                          </Label>
                          <span className="text-xs">{rating}</span>
                        </div>
                      ))}
                    </RadioGroup>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="comment">Additional comments</Label>
                    <Textarea
                      id="comment"
                      placeholder="Tell us about your experience..."
                      value={feedback.comment}
                      onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                    />
                  </div>
                  {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowFeedback(false)}>
                    Skip
                  </Button>
                  <Button onClick={handleFeedbackSubmit}>Submit Feedback</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {showDirectionsDialog && (
            <Dialog open={showDirectionsDialog} onOpenChange={setShowDirectionsDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Directions to Your Car/Exit</DialogTitle>
                  <DialogDescription>
                    Follow these steps to find your car at {suggestedSlot} and exit the parking garage.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {isLoadingDirections ? (
                    <p className="text-sm text-gray-400">Loading directions...</p>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">From Entrance to {suggestedSlot}</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                          {currentDirections.fromEntrance.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-medium">From {suggestedSlot} to Exit</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                          {currentDirections.toExit.map((step, index) => (
                            <li key={index}>{step}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowDirectionsDialog(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}

          {showQRDialog && (
            <Dialog open={showQRDialog} onOpenChange={setShowQRDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Scan QR Code to Exit</DialogTitle>
                  <DialogDescription>
                    Scan this QR code at the exit gate to confirm your parking session.
                  </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col items-center py-4">
                  {qrCodeUrl ? (
                    <>
                      <div className="bg-white p-4 rounded-lg">
                        <QRCodeSVG value={qrCodeUrl} size={250} />
                      </div>
                      <p className="text-sm text-gray-400 mt-4 text-center">
                        URL: {qrCodeUrl}
                      </p>
                    </>
                  ) : (
                    <p className="text-sm text-gray-400">Loading QR code...</p>
                  )}
                </div>
                <DialogFooter>
                  <Button onClick={() => { setShowQRDialog(false); setShowFeedback(true); }}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {!showConfirmation && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="park">Park</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="exit">Exit</TabsTrigger>
              </TabsList>

              <TabsContent value="park" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Find Your Spot</CardTitle>
                    <CardDescription>We've suggested the best parking spot for you.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                      <div className="flex-1 order-3 md:order-1">
                        <SimplifiedParkingMap
                          suggestedSlot={suggestedSlot}
                          vehicles={vehicles.filter((entry) => entry.status !== "Exited")}
                        />
                      </div>
                      <div className="flex-1 space-y-4 order-1 md:order-2">
                        <div className="p-4 border border-gray-800 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Suggested Spot</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary" className="text-xl px-4 py-2">
                              {suggestedSlot}
                            </Badge>
                            <span className="text-sm text-gray-400">
                              {suggestedSlot ? `Level ${suggestedSlot.split('-')[0]}` : 'Level 1'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            This spot is closest to the entrance and currently available.
                          </p>
                          <Button className="w-full" onClick={() => setActiveTab("status")}>
                            Details
                          </Button>
                        </div>

                        {suggestedSlot && (
                          <div className="p-4 border border-gray-800 rounded-lg order-2 md:order-3">
                            <h3 className="text-lg font-medium mb-2">Directions to {suggestedSlot}</h3>
                            {isLoadingDirections ? (
                              <p className="text-sm text-gray-400">Loading directions...</p>
                            ) : (
                              <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                                {currentDirections.fromEntrance.map((step, index) => (
                                  <li key={index}>{step}</li>
                                ))}
                              </ul>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="status" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Parking Status</CardTitle>
                    <CardDescription>Your current parking information.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="p-4 border border-gray-800 rounded-lg">
                        <div className="flex justify-between items-center mb-2">
                          <h3 className="text-lg font-medium">Your Vehicle</h3>
                          <Badge variant="outline">{plateNumber}</Badge>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Parking Spot</p>
                            <p className="text-lg font-medium">{suggestedSlot}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Level</p>
                            <p className="text-lg font-medium">
                              {suggestedSlot ? suggestedSlot.split('-')[0] : '1'}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Entry Time</p>
                            <p className="text-lg font-medium">
                              {new Date(entryTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Status</p>
                            <Badge variant="secondary" className="text-sm">
                              Active
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <div className="p-4 border border-gray-800 rounded-lg">
                        <h3 className="text-lg font-medium mb-2">Parking Duration</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex-1">
                            <Timer isRunning={parkingStarted} startTime={entryTime} />
                            <Progress value={45} className="h-2 mt-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setActiveTab("exit")}
                    >
                      Find My Car
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="exit" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ready to Leave?</CardTitle>
                    <CardDescription>Follow these steps to exit the parking area.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      {parkingDuration && (
                        <div className="p-4 border border-gray-800 rounded-lg bg-gray-900">
                          <h3 className="text-lg font-medium mb-2">Parking Summary</h3>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">Entry Time</p>
                              <p className="text-lg font-medium">
                                {new Date(entryTime).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">Exit Time</p>
                              <p className="text-lg font-medium">
                                {exitTime
                                  ? new Date(exitTime).toLocaleTimeString([], {
                                      hour: "2-digit",
                                      minute: "2-digit",
                                    })
                                  : '-'}
                              </p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">Duration</p>
                              <p className="text-lg font-medium">{parkingDuration}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-sm text-gray-400">Status</p>
                              <Badge variant="secondary" className="text-sm">
                                {parkingStarted ? "Active" : "Exited"}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="p-4 border border-gray-800 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Find Your Car</h3>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-gray-800 rounded-full p-2">
                            <Car className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">Your car is parked at spot {suggestedSlot}</p>
                            <p className="text-sm text-gray-400">
                              {suggestedSlot ? `Level ${suggestedSlot.split('-')[0]}` : 'Level 1'}
                            </p>
                          </div>
                        </div>
                        <Button
                          className="w-full"
                          onClick={() => {
                            setShowDirectionsDialog(true)
                            fetchDirections()
                          }}
                        >
                          <MapPin className="mr-2 h-4 w-4" /> Get Directions
                        </Button>
                      </div>

                      <div className="p-4 border border-gray-800 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Exit Instructions</h3>
                        <ol className="space-y-4">
                          <li className="flex gap-4">
                            <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                              1
                            </div>
                            <div>
                              <p className="font-medium">Return to your vehicle</p>
                              <p className="text-sm text-gray-400">
                                Follow the directions to find your car
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                              2
                            </div>
                            <div>
                              <p className="font-medium">Drive to the exit</p>
                              <p className="text-sm text-gray-400">
                                Follow the exit signs to the nearest exit point
                              </p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                              3
                            </div>
                            <div>
                              <p className="font-medium">Scan your QR code at the exit</p>
                              <p className="text-sm text-gray-400">
                                Your parking session will be automatically closed
                              </p>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button
                      variant="destructive"
                      className="w-full"
                      onClick={() => setShowQRDialog(true)}
                      disabled={!parkingStarted}
                    >
                      <LogOut className="mr-2 h-4 w-4" /> {parkingStarted ? "End Parking Session" : "Session Ended"}
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>
            </Tabs>
          </motion.div>
        )}
      </main>
    </div>
  )
}