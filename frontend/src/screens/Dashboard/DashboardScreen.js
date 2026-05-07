import React, { useEffect, useState } from "react";
import { ScrollView, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getHealth } from "../../api/healthApi";
import StatusCard from "../../components/cards/StatusCard";

export default function DashboardScreen() {
  const [health, setHealth] = useState(null);

  const loadHealth = async () => {
    try {
      const data = await getHealth();
      setHealth(data);
    } catch (error) {
      setHealth({
        backend: "failed",
        sql_server: "failed",
        payroll_mysql: "failed",
        auth_mysql: "failed",
      });
    }
  };

  useEffect(() => {
    loadHealth();
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.heading}>Dashboard</Text>
      <Text style={styles.subHeading}>API Integration Health Check</Text>

      <StatusCard title="Backend" value={health?.backend} />
      <StatusCard title="SQL Server HUMAN_2025" value={health?.sql_server} />
      <StatusCard title="MySQL payroll_2026" value={health?.payroll_mysql} />
      <StatusCard title="MySQL auth_db" value={health?.auth_mysql} />

      <TouchableOpacity style={styles.button} onPress={loadHealth}>
        <Text style={styles.buttonText}>Refresh</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    padding: 20,
  },
  heading: {
    fontSize: 32,
    fontWeight: "900",
    marginTop: 40,
  },
  subHeading: {
    color: "#64748b",
    marginBottom: 20,
  },
  button: {
    marginTop: 10,
    backgroundColor: "#0d86ff",
    padding: 16,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "800",
  },
});
