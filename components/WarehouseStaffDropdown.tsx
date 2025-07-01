"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"

interface StaffMember {
  id: number
  name: string
}

interface Props {
  selected: string
  onChange: (value: string) => void
}

export function WarehouseStaffDropdown({ selected, onChange }: Props) {
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const response = await fetch("http://localhost:3001/api/warehouse-staff")
        const data = await response.json()
        setStaffList(data)
      } catch (error) {
        console.error("Failed to fetch warehouse staff:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStaff()
  }, [])

  return (
    <div className="mt-6">
      <Label className="block text-base font-semibold text-gray-700 mb-2">Warehouse Staff</Label>
      <Select value={selected} onValueChange={onChange}>
        <SelectTrigger className="w-full h-12 text-base border-gray-300 rounded-lg shadow-sm">
          <SelectValue placeholder={loading ? "Loading staff..." : "Select staff"} />
        </SelectTrigger>
        <SelectContent>
          {staffList.map((staff) => (
            <SelectItem key={staff.id} value={staff.name}>
              {staff.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
