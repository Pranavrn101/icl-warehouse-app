"use client"

import WarehouseApp from "../warehouse-app"
import { ProtectedRoute } from "@/components/ProtectedRoute"


export default function Page() {
  return (<ProtectedRoute>
      <WarehouseApp />
    </ProtectedRoute>)
}
