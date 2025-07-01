// Updated WarehouseApp.tsx - full implementation

"use client"
import { useEffect, useState, useRef } from "react"
import { SignatureSection } from "@/components/SignatureSection"
import SignaturePad from "signature_pad"
import { Search, Eye, Plus, Upload, Send, LayoutDashboard, Settings, HelpCircle, CheckCircle, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { WarehouseStaffDropdown } from "@/components/WarehouseStaffDropdown"
import { toast } from "../../components/ui/use-toast"
import { RefreshCcw } from "lucide-react"
import { ProtectedRoute } from "@/components/ProtectedRoute";



// Define the JobCard type
// interface JobCard {
//   id: number
//   mawb_number: string
//   hawb_number: string
//   importer: string
//   exporter: string
//   origin: string
//   eta: string
//   number_of_pieces: string
//   defra_required: boolean
//   created_date: string
//   status: string
// }



interface StaffMember {
  id: number
  name: string
}


const warehouseStaff = ["John Smith", "Sarah Johnson", "Mike Wilson", "Emma Davis", "David Brown", "Lisa Anderson"]

const SidebarIcon = ({ icon: Icon, label, active = false }: { icon: any; label: string; active?: boolean }) => (
  <div
    className={`flex items-center gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 shadow-sm ${
      active
        ? "bg-white text-[#142d6a] shadow-md border border-gray-100"
        : "text-gray-600 hover:bg-white hover:shadow-sm"
    }`}
  >
    <Icon size={24} />
    <span className="font-semibold text-lg">{label}</span>
  </div>
)


////Staff dropdown

export default function WarehouseApp() {
  const [jobCards, setJobCards] = useState<JobCard[]>([])
  const [selectedJobCard, setSelectedJobCard] = useState<JobCard | null>(null)
  const [actualArrivalDate, setActualArrivalDate] = useState("")
  const [warehouseArrivalTime, setWarehouseArrivalTime] = useState("")
  const [vehicleTemperature, setVehicleTemperature] = useState("")
  const [trailerClean, setTrailerClean] = useState("")
  const [freeFromPests, setFreeFromPests] = useState("")
  const [organicGoods, setOrganicGoods] = useState("")
  const [palletCount, setPalletCount] = useState(0)
  const [pieceCount, setPieceCount] = useState(0)
  const [items, setItems] = useState([{ id: 1, product: "", pieces: 0, topTemp: "", midTemp: "", bottomTemp: "" }])
  const [shortages, setShortages] = useState("")
  const [damages, setDamages] = useState("")
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [selectedStaff, setSelectedStaff] = useState("")
  const [signature, setSignature] = useState("")
  const [images, setImages] = useState<File[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("recently-added")
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted">("idle");
  const [isSubmitted, setIsSubmitted] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const sigPadRef = useRef<SignaturePad | null>(null)


function trimCanvas(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d")
  if (!ctx) return canvas

  const width = canvas.width
  const height = canvas.height
  const imageData = ctx.getImageData(0, 0, width, height)

  let top = null, bottom = null, left = null, right = null

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4
      if (imageData.data[i + 3] > 0) {
        if (top === null) top = y
        bottom = y
        if (left === null || x < left) left = x
        if (right === null || x > right) right = x
      }
    }
  }

  if (top === null) return canvas

  const trimmedWidth = right! - left! + 1
  const trimmedHeight = bottom! - top! + 1
  const trimmedData = ctx.getImageData(left!, top!, trimmedWidth, trimmedHeight)

  const trimmedCanvas = document.createElement("canvas")
  trimmedCanvas.width = trimmedWidth
  trimmedCanvas.height = trimmedHeight
  trimmedCanvas.getContext("2d")?.putImageData(trimmedData, 0, 0)

  return trimmedCanvas
}


  type JobCard = {
  id: number
  mawb_number: string
  hawb_number: string
  importer: string
  exporter: string
  origin: string
  eta: string
  created: string
  number_of_pieces: string
  defra: boolean
  status: "Unattended" | "Opened" | "Completed"
}


useEffect(() => {
  if (canvasRef.current) {
    const canvas = canvasRef.current;

    // Set actual pixel size to match displayed size
    const ratio = window.devicePixelRatio || 1;
    const width = canvas.offsetWidth;
    const height = canvas.offsetHeight;

    canvas.width = width * ratio;
    canvas.height = height * ratio;
    canvas.getContext("2d")?.scale(ratio, ratio);

    sigPadRef.current = new SignaturePad(canvas, {
      penColor: "black",
      backgroundColor: "white"
    });
  }
}, []);



  useEffect(() => {
    const fetchJobCards = async () => {
      const response = await fetch("http://localhost:3001/api/job-cards")
      const data = await response.json()
      setJobCards(data)
      if (data.length > 0) setSelectedJobCard(data[0])
    }
    fetchJobCards()
  }, [])


  //status update
//   useEffect(() => {
//   if (selectedJobCard) {
//     fetch(`http://localhost:3001/api/job-cards/${selectedJobCard.mawb_number}/status`, {
//       method: "PATCH",
//       headers: {
//         "Content-Type": "application/json",
//       },
//       body: JSON.stringify({ status: "Attended" }),
//     }).catch(err => console.error("Failed to update status:", err));
//   }
// }, [selectedJobCard])


  const addItem = () => {
    setItems([
      ...items,
      {
        id: Date.now(),
        product: "",
        pieces: 0,
        topTemp: "",
        midTemp: "",
        bottomTemp: "",
      },
    ])
  }
  
  const removeItem = (id: number) => {
    setItems(items.filter((item) => item.id !== id))
  }

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  const StatusBadge = ({ status }: { status: string }) => {
  const variants = {
    Unattended: "bg-yellow-500 text-white shadow-sm",
    Opened: "bg-blue-500 text-white shadow-sm",
    Completed: "bg-green-500 text-white shadow-sm",
  }

  return (
    <Badge className={`${variants[status as keyof typeof variants]} font-semibold px-2 py-1 rounded-md text-xs`}>
      {status}
    </Badge>
  )
}
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files)
      setImages(selectedFiles)
      const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file))
      setImageUrls(previewUrls)
    }
  }

  const fetchJobCards = async () => {
  const res = await fetch("http://localhost:3001/api/job-cards");
  const data = await res.json();
  setJobCards(data);
};

  const uploadImages = async () => {
    const formData = new FormData()
    images.forEach((img) => formData.append("images", img))

    const res = await fetch("http://localhost:3001/api/upload-images", {
      method: "POST",
      body: formData,
    })

    const data = await res.json()
    return data.urls // Array of uploaded image URLs
  }

  // const saveSignature = () => {
  //   if (sigCanvas.current) {
  //     const dataURL = sigCanvas.current.getTrimmedCanvas().toDataURL("image/png");
  //     setSignature(dataURL)
  //   }
  // }

  const handleSubmit = async () => {
  if (!selectedJobCard) return toast({ title: "Missing Job Card", description: "Please select a job card." });
  if (!signature) return toast({ title: "Missing Signature", description: "Please save your signature before submitting." });

  try {
    const imageUrls = await uploadImages();

    const reportData = {
      mawbNumber: selectedJobCard.mawb_number,
      actualArrivalDate,
      warehouseArrivalTime,
      vehicleTemperature,
      trailerClean,
      freeFromPests,
      organicGoods,
      palletCount,
      pieceCount,
      items,
      shortages,
      damages,
      imageUrls,
      warehouseStaff: selectedStaff,
      signature
    };

    const response = await fetch("http://localhost:3001/api/warehouse-report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reportData)
    });

    if (response.ok) {
      toast({
        title: "Report Submitted",
        description: "The warehouse report has been saved successfully."
      });
      setStatus("submitted");
      setIsSubmitted(true);
     
     
    } else {
      toast({
        title: "Submission Failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive"
      });
    }
  } catch (error) {
    console.error("Submission error:", error);
    toast({
      title: "Error",
      description: "A network or server error occurred.",
      variant: "destructive"
    });
  }
  setIsSubmitted(true)
};

const filteredJobCards = jobCards
  .filter((card) =>
    (card.mawb_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
     card.hawb_number?.toLowerCase().includes(searchTerm.toLowerCase()))
  )

    .sort((a, b) => {
      if (sortBy === "unattended") {
        // Sort by status, putting "Unattended" first
        if (a.status === "Unattended" && b.status !== "Unattended") return -1
        if (a.status !== "Unattended" && b.status === "Unattended") return 1
        // If both are unattended or both are not unattended, sort by date (newest first)
        return new Date(b.created).getTime() - new Date(a.created).getTime()
      } else {
        // "recently-added" - sort by date (newest first)
        return new Date(b.created).getTime() - new Date(a.created).getTime()
      }
    })

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-gray-50 font-sans" style={{ fontFamily: "Inter, system-ui, sans-serif" }}>
      {/* Top App Bar */}
      <div className="text-white p-6 flex items-center gap-4 shadow-lg" style={{ backgroundColor: "#142d6a" }}>
        <div className="h-10">
          <Image
            src="/images/icl-logo.png"
            alt="ICL International Cargo Logistics"
            width={240}
            height={40}
            className="h-full w-auto"
          />
        </div>
        <div className="ml-auto flex items-center gap-4"></div>
      </div>

      <div className="flex h-[calc(100vh-88px)] max-w-[1920px] mx-auto">
        {/* Left Sidebar */}
        <div className="w-80 bg-gray-100 p-8 space-y-3 shadow-sm">
          <div className="mb-10">
            <h2 className="text-gray-500 font-bold text-sm uppercase tracking-wider mb-6">MAIN MENU</h2>
            <div className="space-y-3">
              <SidebarIcon icon={LayoutDashboard} label="Dashboard" />
              <SidebarIcon icon={CheckCircle} label="Job Cards" active />
              <SidebarIcon icon={Upload} label="Uploads" />
              <SidebarIcon icon={Settings} label="Settings" />
              <SidebarIcon icon={HelpCircle} label="Help & Support" />
            </div>
          </div>
        </div>

        {/* Center Section - Job Cards List */}
        <div className="flex-1 p-8 max-w-[60%] bg-white overflow-y-auto">
          <div className="mb-8">
            <h2 className="text-3xl font-bold mb-8 text-gray-900">Warehouse Job Cardssss</h2>
            <Button
            
  variant="outline"
  size="sm"
  className="mb-2 flex items-center gap-1"
  onClick={async () => {
  toast({ title: "Refreshing job cards..." });
  await fetchJobCards();
  toast({ title: "Job cards updated!" });
}}
>
  <RefreshCcw className="w-4 h-4" />
  Fetch New Jobcards
</Button>

            {/* Search and Sort */}
            <div className="flex gap-6 mb-6">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={22} />
                <Input
                  placeholder="Search by MAWB or Shipping Number"
                  className="pl-12 h-14 text-lg rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-shadow"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-56 h-14 text-lg rounded-xl border-gray-200 shadow-sm">
                  <SelectValue placeholder="Recently Added" />
                </SelectTrigger>
                <SelectContent className="rounded-xl shadow-lg">
                  <SelectItem value="recently-added" className="text-lg">
                    Recently Added
                  </SelectItem>
                  {/* <SelectItem value="unattended" className="text-lg">
                    Unattended
                  </SelectItem> */}
                </SelectContent>
              </Select>
            </div>

            {/* Job Cards - Compact Design */}
            <div className="space-y-3">
              {filteredJobCards.map((card) => (
                <Card
                  key={card.id}
                  className={`cursor-pointer transition-all duration-200 hover:shadow-lg rounded-lg border-gray-200 ${
                    selectedJobCard?.id === card.id ? "ring-2 ring-[#142d6a] shadow-lg" : "shadow-sm"
                  }`}
                  onClick={() => setSelectedJobCard(card)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">MAWB: {card.mawb_number}</h3>
                          {/* <StatusBadge status={card.status} /> */}
                          {card.defra && (
                            <Badge className="bg-[#142d6a] text-white px-2 py-1 rounded-md text-xs">DEFRA</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600">Created: {card.created}</p>
                      </div>
                      <Eye className="text-gray-400 cursor-pointer hover:text-gray-600 transition-colors" size={20} />
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="space-y-1">
                        <p>
                          <span className="font-semibold text-gray-700">Importer:</span>
                        </p>
                        <p className="text-gray-900 truncate">{card.importer}</p>
                        <p>
                          <span className="font-semibold text-gray-700">Exporter:</span>
                        </p>
                        <p className="text-gray-900 truncate">{card.exporter}</p>
                      </div>
                      <div className="space-y-1">
                        <p>
                          <span className="font-semibold text-gray-700">ETA:</span>
                        </p>
                        <p className="text-gray-900">{card.eta}</p>
                        <p>
                          <span className="font-semibold text-gray-700">HAWB:</span>
                        </p>
                        <p className="text-gray-900">{card.hawb_number}</p>
                      </div>
                      <div className="space-y-1">
                        <p>
                          <span className="font-semibold text-gray-700">Origin:</span>
                        </p>
                        <p className="text-gray-900">{card.origin}</p>
                        <p>
                          <span className="font-semibold text-gray-700">Pieces:</span>
                        </p>
                        <p className="text-gray-900">{card.number_of_pieces}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Right Section - Job Card Form */}
        <div className="w-[40%] bg-gray-50 border-l border-gray-200 p-8 overflow-y-auto">
          {selectedJobCard ? (
            <div>
              <h2 className="text-3xl font-bold mb-8 text-gray-900">Warehouse Processing</h2>

              {/* Pre-filled Information */}
              <Card className="mb-8 rounded-xl shadow-sm border-gray-200">
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl font-bold text-gray-900">Shipment Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid grid-cols-2 gap-6 text-lg">
                    <div>
                      <Label className="font-semibold text-gray-700 text-base">MAWB</Label>
                      <p className="text-gray-900 mt-1 font-medium">{selectedJobCard.mawb_number}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-700 text-base">HAWB</Label>
                      <p className="text-gray-900 mt-1 font-medium">{selectedJobCard.hawb_number}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-700 text-base">Importer</Label>
                      <p className="text-gray-900 mt-1 font-medium">{selectedJobCard.importer}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-700 text-base">Exporter</Label>
                      <p className="text-gray-900 mt-1 font-medium">{selectedJobCard.exporter}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-700 text-base">Origin</Label>
                      <p className="text-gray-900 mt-1 font-medium">{selectedJobCard.origin}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-700 text-base">ETA</Label>
                      <p className="text-gray-900 mt-1 font-medium">{selectedJobCard.eta}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-700 text-base">Number of Pieces</Label>
                      <p className="text-gray-900 mt-1 font-medium">{selectedJobCard.number_of_pieces}</p>
                    </div>
                    <div>
                      <Label className="font-semibold text-gray-700 text-base">DEFRA</Label>
                      <p className="text-gray-900 mt-1 font-medium">
                        {selectedJobCard.defra ? "Required" : "Not Required"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Warehouse Fields */}
              <div className="space-y-8">
                {/* Arrival Information */}
                <Card className="rounded-xl shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Arrival Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="arrival-date" className="text-lg font-semibold text-gray-700">
                          Actual Arrival Date
                        </Label>
                        <Input type="date" value={actualArrivalDate} onChange={(e) => setActualArrivalDate(e.target.value)} />

                      </div>
                      <div>
                        <Label htmlFor="arrival-time" className="text-lg font-semibold text-gray-700">
                          Warehouse Arrival Time
                        </Label>
                        <Input type="time" value={warehouseArrivalTime} onChange={(e) => setWarehouseArrivalTime(e.target.value)} />

                      </div>
                    </div>
                    <div>
                      <Label htmlFor="vehicle-temp" className="text-lg font-semibold text-gray-700">
                        Vehicle Temperature (°C)
                      </Label>
                      <Input value={vehicleTemperature} onChange={(e) => setVehicleTemperature(e.target.value)} />
                    </div>
                  </CardContent>
                </Card>

                {/* Inspection Checks */}
                <Card className="rounded-xl shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Inspection Checks</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-8">
                    <div>
                      <Label className="text-lg font-semibold mb-4 block text-gray-700">Trailer Clean</Label>
                      <RadioGroup value={trailerClean} onValueChange={setTrailerClean} className="flex gap-8">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="yes" id="trailer-clean-yes" className="w-6 h-6 border-2" />
                          <Label htmlFor="trailer-clean-yes" className="text-lg font-medium text-gray-700">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="no" id="trailer-clean-no" className="w-6 h-6 border-2" />
                          <Label htmlFor="trailer-clean-no" className="text-lg font-medium text-gray-700">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-lg font-semibold mb-4 block text-gray-700">Free from Pests</Label>
                      <RadioGroup value={freeFromPests} onValueChange={setFreeFromPests} className="flex gap-8">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="yes" id="pests-yes" className="w-6 h-6 border-2" />
                          <Label htmlFor="pests-yes" className="text-lg font-medium text-gray-700">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="no" id="pests-no" className="w-6 h-6 border-2" />
                          <Label htmlFor="pests-no" className="text-lg font-medium text-gray-700">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>

                    <div>
                      <Label className="text-lg font-semibold mb-4 block text-gray-700">Organic Goods</Label>
                      <RadioGroup value={organicGoods} onValueChange={setOrganicGoods} className="flex gap-8">
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="yes" id="organic-yes" className="w-6 h-6 border-2" />
                          <Label htmlFor="organic-yes" className="text-lg font-medium text-gray-700">
                            Yes
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3">
                          <RadioGroupItem value="no" id="organic-no" className="w-6 h-6 border-2" />
                          <Label htmlFor="organic-no" className="text-lg font-medium text-gray-700">
                            No
                          </Label>
                        </div>
                      </RadioGroup>
                    </div>
                  </CardContent>
                </Card>

                {/* Counts */}
                <Card className="rounded-xl shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Counts</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                      <div>
                        <Label htmlFor="pallet-count" className="text-lg font-semibold text-gray-700">
                          Pallet Count
                        </Label>
                        <Input
                          type="number"
                          id="pallet-count"
                          placeholder="0"
                          className="h-14 text-lg mt-2 rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-shadow"
                          value={palletCount} onChange={(e) => setPalletCount(Number(e.target.value))} 
                        />
                      </div>
                      <div>
                        <Label htmlFor="piece-count" className="text-lg font-semibold text-gray-700">
                          Piece Count
                        </Label>
                        <Input
                          type="number"
                          id="piece-count"
                          placeholder="0"
                          className="h-14 text-lg mt-2 rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-shadow"
                          value={pieceCount} onChange={(e) => setPieceCount(Number(e.target.value))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Items Table */}
                <Card className="rounded-xl shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900 flex items-center justify-between">
                      Items
                      <Button
                        onClick={addItem}
                        className="h-12 px-6 bg-[#142d6a] hover:bg-[#0f2557] rounded-xl shadow-sm"
                      >
                        <Plus size={18} className="mr-2" />
                        Add Item
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      {items.map((item) => (
                        <div
                          key={item.id}
                          className="border border-gray-200 rounded-xl p-6 space-y-6 bg-white shadow-sm"
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1 grid grid-cols-2 gap-6">
                              <div>
                                <Label className="text-base font-semibold text-gray-700">Product/Variety</Label>
                                <Input
                                  value={item.product}
                                  onChange={(e) => updateItem(item.id, "product", e.target.value)}
                                  className="h-12 mt-2 rounded-xl border-gray-200 shadow-sm"
                                />
                              </div>
                              <div>
                                <Label className="text-base font-semibold text-gray-700">Piece Count</Label>
                                <Input
                                  type="number"
                                  value={item.pieces}
                                  onChange={(e) => updateItem(item.id, "pieces", Number.parseInt(e.target.value))}
                                  className="h-12 mt-2 rounded-xl border-gray-200 shadow-sm"
                                />
                              </div>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                              className="ml-6 h-12 w-12 rounded-xl border-gray-200 hover:bg-red-50 hover:border-red-200"
                            >
                              <Trash2 size={18} className="text-red-500" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-3 gap-6">
                            <div>
                              <Label className="text-base font-semibold text-gray-700">Top Temp (°C)</Label>
                              <Input
                                value={item.topTemp}
                                onChange={(e) => updateItem(item.id, "topTemp", e.target.value)}
                                className="h-12 mt-2 rounded-xl border-gray-200 shadow-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-base font-semibold text-gray-700">Mid Temp (°C)</Label>
                              <Input
                                value={item.midTemp}
                                onChange={(e) => updateItem(item.id, "midTemp", e.target.value)}
                                className="h-12 mt-2 rounded-xl border-gray-200 shadow-sm"
                              />
                            </div>
                            <div>
                              <Label className="text-base font-semibold text-gray-700">Bottom Temp (°C)</Label>
                              <Input
                                value={item.bottomTemp}
                                onChange={(e) => updateItem(item.id, "bottomTemp", e.target.value)}
                                className="h-12 mt-2 rounded-xl border-gray-200 shadow-sm"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Issues */}
                <Card className="rounded-xl shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Issues & Notes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div>
                      <Label htmlFor="shortages" className="text-lg font-semibold text-gray-700">
                        Shortages
                      </Label>
                      <Textarea
                        id="shortages"
                        placeholder="Describe any shortages..."
                        className="min-h-28 text-lg mt-2 rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-shadow"
                        value={shortages} onChange={(e) => setShortages(e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="damages" className="text-lg font-semibold text-gray-700">
                        Damages
                      </Label>
                      <Textarea
                        id="damages"
                        placeholder="Describe any damages..."
                        className="min-h-28 text-lg mt-2 rounded-xl border-gray-200 shadow-sm focus:shadow-md transition-shadow"
                        value={damages} onChange={(e) => setDamages(e.target.value)}
                        required
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Photo Upload */}
                <Card className="rounded-xl shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Cargo Photos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="border-2 border-dashed border-gray-300 rounded-xl p-10 text-center bg-gray-50 hover:bg-gray-100 transition-colors">
                      <Input type="file" accept="image/*" multiple onChange={handleImageUpload} />
            <div className="flex gap-2 mt-2">
              {imageUrls.map((url, idx) => (
                <img key={idx} src={url} alt={`img-${idx}`} className="w-20 h-20 rounded object-cover" />
              ))}
            </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Staff Selection and Signature */}
                <Card className="rounded-xl shadow-sm border-gray-200">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-xl font-bold text-gray-900">Warehouse Staff Signature</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    
                    <div>
            <WarehouseStaffDropdown
  selected={selectedStaff}
  onChange={setSelectedStaff}
/>
          </div>
          <div className="w-full max-w-md overflow-hidden">
  {/* <Label className="mb-2 block">Signature</Label> */}
  <SignatureSection setSignature={setSignature} />

</div>
            {/* <div className="flex gap-4 mt-2">
  <Button
  type="button"
  onClick={() => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      const trimmed = trimCanvas(canvasRef.current!)
      const dataURL = trimmed.toDataURL("image/png")
      setSignature(dataURL)
    }
  }}
  className="bg-black text-white"
>
  Save Signature
</Button>

  <Button
  type="button"
  variant="outline"
  onClick={() => sigPadRef.current?.clear()}
  className="text-black border border-gray-300"
>
  Clear Signature
</Button>

</div> */}
                  </CardContent>
                </Card>

                {/* Action Buttons */}
                <div className="space-y-4 pt-8">
  <Button
    onClick={handleSubmit}
    className="w-full h-16 text-lg font-semibold bg-black hover:bg-gray-800 rounded-xl shadow-md"
  >
    Submit Data
  </Button>

  <Button
    className="w-full h-16 text-lg font-semibold bg-black hover:bg-gray-800 rounded-xl shadow-md"
    disabled={!isSubmitted}
    onClick={async () => {
      toast({
        title: "Sending...",
        description: "Please wait while we send the report.",
        duration: 3000,
      });

      try {
        const res = await fetch(`http://localhost:3001/api/report/send-email/${selectedJobCard.mawb_number}`, {
          method: "POST",
        });

        if (res.ok) {
          toast({
            title: "Success",
            description: "Email sent successfully!",
          });

          // ✅ Reset form after a short delay
          setTimeout(() => {
            setActualArrivalDate("");
            setWarehouseArrivalTime("");
            setVehicleTemperature("");
            setTrailerClean("");
            setFreeFromPests("");
            setOrganicGoods("");
            setPalletCount(0);
            setPieceCount(0);
            setItems([]);
            setImages([]);
            setImageUrls([]);
            setShortages("");
            setDamages("");
            setSelectedStaff("");
            setSignature("");
            sigPadRef.current?.clear();
            setSelectedJobCard(null);
            setStatus("idle");
            setIsSubmitted(false); // ✅ Reset send button after use
          }, 2000);
        } else {
          toast({
            title: "Error",
            description: "Failed to send email.",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("❌ Email send error:", error);
        toast({
          title: "Error",
          description: "An unexpected error occurred while sending email.",
          variant: "destructive",
        });
      }
    }}
  >
    <Send className="mr-3" size={22} />
    Send Email
  </Button>
</div>

              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-2xl text-gray-500 font-medium">Select a job card to view details</p>
            </div>
          )}
        </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}

