"use client";
import { HomeComponent } from "./components/home/home.componet";
import { Dashboard } from "./components/dashboard/dashboard.component";
import { useDashboard } from "./hooks/dashboard/useDashboard.hook";

export default function Home() {
  const { user, isLoading } = useDashboard();
  return isLoading ? !user ? <HomeComponent /> : <Dashboard /> : null;
}
