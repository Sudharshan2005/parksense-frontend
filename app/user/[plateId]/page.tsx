"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
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

interface UserInfo {
  phone: string
}

interface FeedbackData {
  rating: number
  comment: string
}

export default function UserDashboard() {
  const params = useParams<{ plateId: string }>()
  const router = useRouter()
  const { toast } = useToast()

  // States
  const [showConfirmation, setShowConfirmation] = useState(true)
  const [userInfo, setUserInfo] = useState<UserInfo>({ phone: "" })
  const [parkingStarted, setParkingStarted] = useState(false)
  const [suggestedSlot, setSuggestedSlot] = useState("L1-A5")
  const [showFeedback, setShowFeedback] = useState(false)
  const [showDirectionsDialog, setShowDirectionsDialog] = useState(false)
  const [feedback, setFeedback] = useState<FeedbackData>({ rating: 5, comment: "" })
  const [activeTab, setActiveTab] = useState("park")
  const [isConfirmed, setIsConfirmed] = useState(false)

  // Mock data - in a real app, this would come from an API
  const plateNumber = params.plateId || "KA01AB1234"

  useEffect(() => {
    // In a real app, we would fetch data based on the plateId
    // For now, we'll just simulate a suggested parking slot
    setSuggestedSlot("L1-A5")
  }, [params.plateId])

  const handleUserInfoSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!userInfo.phone) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setShowConfirmation(false)
    toast({
      title: "Welcome to ParkSense",
      description: `Hello Sir/Madam, we've suggested a parking spot for you.`,
    })
  }

  const startParking = () => {
    setParkingStarted(true)
    setActiveTab("status")
    toast({
      title: "Parking Started",
      description: "Your parking session has begun. The timer is now running.",
    })
  }

  const handleFeedbackSubmit = () => {
    toast({
      title: "Thank You!",
      description: "Your feedback has been submitted successfully.",
    })
    setShowFeedback(false)
    // In a real app, we would send this feedback to the server
  }

  const handleExit = () => {
    setShowFeedback(true)
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
          {parkingStarted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-2"
            >
              <TimerIcon className="h-6 w-6" />
            </motion.div>
          )}
        </div>
      </header>

      <main className="container mx-auto p-4 md:p-6">
        <AnimatePresence>
          {/* User Confirmation Dialog */}
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

          {/* Feedback Dialog */}
          {showFeedback && (
            <Dialog open={showFeedback} onOpenChange={setShowFeedback}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Share Your Experience</DialogTitle>
                  <DialogDescription>How was your parking experience with ParkSense today?</DialogDescription>
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
                          <RadioGroupItem value={rating.toString()} id={`rating-${rating}`} className="sr-only" />
                          <Label
                            htmlFor={`rating-${rating}`}
                            className={`cursor-pointer p-2 rounded-full hover:bg-gray-800 ${
                              feedback.rating === rating ? "bg-gray-800" : ""
                            }`}
                          >
                            <ThumbsUp
                              className={`h-6 w-6 ${feedback.rating === rating ? "text-primary" : "text-gray-500"}`}
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

          {/* Directions Dialog */}
          {showDirectionsDialog && (
            <Dialog open={showDirectionsDialog} onOpenChange={setShowDirectionsDialog}>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Directions to Your Car</DialogTitle>
                  <DialogDescription>
                    Follow these steps to find your car at {suggestedSlot} and exit the parking garage.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">From Entrance to {suggestedSlot}</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                      <li>Enter the parking garage at the main entrance on {suggestedSlot.split('-')[0]}.</li>
                      <li>Proceed straight along the main driving lane.</li>
                      {(() => {
                        const slotParts = suggestedSlot.split('-')[1].match(/([A-D])(\d+)/)
                        if (!slotParts) return null
                        const section = slotParts[1]
                        const slotNumber = parseInt(slotParts[2], 10)
                        const isTopSection = ['A', 'B'].includes(section)
                        const row = isTopSection ? (section === 'A' ? '1st' : '2nd') : (section === 'C' ? '3rd' : '4th')
                        const side = slotNumber <= 6 ? 'left' : 'right'
                        const pillar = slotNumber <= 6 ? slotNumber : slotNumber - 6
                        return (
                          <>
                            <li>Turn {side} into the {row} row after pillar number {pillar}.</li>
                            <li>Find your car in slot {suggestedSlot} on your {side}.</li>
                          </>
                        )
                      })()}
                    </ul>
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-medium">From {suggestedSlot} to Exit</h3>
                    <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                      <li>Exit slot {suggestedSlot} and turn {(suggestedSlot.split('-')[1].match(/\d+/)?.[0] && parseInt(suggestedSlot.split('-')[1].match(/\d+/)![0], 10) <= 6) ? 'right' : 'left'} to rejoin the main driving lane.</li>
                      <li>Proceed straight along the main driving lane.</li>
                      <li>Follow the exit signs to the exit on {suggestedSlot.split('-')[0]}.</li>
                      <li>Scan your QR code at the exit barrier to leave.</li>
                    </ul>
                  </div>
                </div>
                <DialogFooter>
                  <Button onClick={() => setShowDirectionsDialog(false)}>Close</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </AnimatePresence>

        {/* Main Content */}
        {!showConfirmation && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="park">Park</TabsTrigger>
                <TabsTrigger value="status">Status</TabsTrigger>
                <TabsTrigger value="exit">Exit</TabsTrigger>
              </TabsList>

              {/* Park Tab */}
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
                        />
                      </div>
                      <div className="flex-1 space-y-4 order-1 md:order-2">
                        <div className="p-4 border border-gray-800 rounded-lg">
                          <h3 className="text-lg font-medium mb-2">Suggested Spot</h3>
                          <div className="flex items-center gap-2 mb-4">
                            <Badge variant="secondary" className="text-xl px-4 py-2">
                              {suggestedSlot}
                            </Badge>
                            <span className="text-sm text-gray-400">{suggestedSlot ? `Level ${suggestedSlot.split('-')[0]}` : 'Level 1'}</span>
                          </div>
                          <p className="text-sm text-gray-400 mb-4">
                            This spot is closest to the entrance and currently available.
                          </p>
                          <Button className="w-full" onClick={startParking} disabled={parkingStarted}>
                            {parkingStarted ? "Parking Active" : "Park Here"}
                          </Button>
                        </div>

                        {suggestedSlot && (
                          <div className="p-4 border border-gray-800 rounded-lg order-2 md:order-3">
                            <h3 className="text-lg font-medium mb-2">Directions to {suggestedSlot}</h3>
                            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
                              <li>Enter the parking garage at the main entrance on {suggestedSlot.split('-')[0]}.</li>
                              <li>Proceed straight along the main driving lane.</li>
                              {(() => {
                                const slotParts = suggestedSlot.split('-')[1].match(/([A-D])(\d+)/)
                                if (!slotParts) return null
                                const section = slotParts[1]
                                const slotNumber = parseInt(slotParts[2], 10)
                                const isTopSection = ['A', 'B'].includes(section)
                                const row = isTopSection ? (section === 'A' ? '1st' : '2nd') : (section === 'C' ? '3rd' : '4th')
                                const side = slotNumber <= 6 ? 'left' : 'right'
                                const pillar = slotNumber <= 6 ? slotNumber : slotNumber - 6
                                return (
                                  <>
                                    <li>Turn {side} into the {row} row after pillar number {pillar}.</li>
                                    <li>Park in slot {suggestedSlot} on your {side}.</li>
                                  </>
                                )
                              })()}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Status Tab */}
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
                            <p className="text-lg font-medium">{suggestedSlot ? suggestedSlot.split('-')[0] : '1'}</p>
                          </div>
                          <div className="space-y-1">
                            <p className="text-sm text-gray-400">Entry Time</p>
                            <p className="text-lg font-medium">
                              {new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                          <Clock className="h-6 w-6 text-gray-400" />
                          <div className="flex-1">
                            <Timer isRunning={parkingStarted} />
                            <Progress value={45} className="h-2 mt-2" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full" onClick={() => setActiveTab("exit")}>
                      Find My Car
                    </Button>
                  </CardFooter>
                </Card>
              </TabsContent>

              {/* Exit Tab */}
              <TabsContent value="exit" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Ready to Leave?</CardTitle>
                    <CardDescription>Follow these steps to exit the parking area.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid gap-4">
                      <div className="p-4 border border-gray-800 rounded-lg">
                        <h3 className="text-lg font-medium mb-4">Find Your Car</h3>
                        <div className="flex items-center gap-4 mb-4">
                          <div className="bg-gray-800 rounded-full p-2">
                            <Car className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-medium">Your car is parked at spot {suggestedSlot}</p>
                            <p className="text-sm text-gray-400">{suggestedSlot ? `Level ${suggestedSlot.split('-')[0]}` : 'Level 1'}</p>
                          </div>
                        </div>
                        <Button className="w-full" onClick={() => setShowDirectionsDialog(true)}>
                          <MapPin className="mr-2 h-4 w-4" /> Get Directions to Your Car
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
                              <p className="text-sm text-gray-400">Follow the directions to find your car</p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                              2
                            </div>
                            <div>
                              <p className="font-medium">Drive to the exit</p>
                              <p className="text-sm text-gray-400">Follow the exit signs to the nearest exit point</p>
                            </div>
                          </li>
                          <li className="flex gap-4">
                            <div className="bg-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                              3
                            </div>
                            <div>
                              <p className="font-medium">Scan your QR code at the exit</p>
                              <p className="text-sm text-gray-400">Your parking session will be automatically closed</p>
                            </div>
                          </li>
                        </ol>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="destructive" className="w-full" onClick={handleExit}>
                      <LogOut className="mr-2 h-4 w-4" /> End Parking Session
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