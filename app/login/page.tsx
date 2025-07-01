"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext"; // 👈 Import Auth hook
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

export default function WarehouseLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();
  const { login } = useAuth(); // 👈 Use login function from context

  const handleLogin = async () => {
    try {
      const res = await fetch("http://192.168.1.7:3005/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (res.ok) {
        console.log("Login successful:", username);
        login(data.token); // 👈 Use login from context (handles token + redirect)
        router.push("/"); // optional: override redirect if needed
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Network error");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-[360px] shadow-md border border-gray-200">
        <CardHeader>
          <CardTitle className="text-center text-lg">Warehouse Login</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Username" value={username} onChange={(e) => setUsername(e.target.value)} />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleLogin} className="w-full bg-[#142d6a] text-white">
            Login
          </Button>
        </CardContent>
      </Card>
    </div>
    // <div>
    //   <h2>Warehouse Login</h2>
    //   <input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" />
    //   <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" />
    //   <button onClick={handleLogin}>Login</button>
    // </div>
  );
}