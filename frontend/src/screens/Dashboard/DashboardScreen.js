import React, { useEffect, useState } from "react";
import { ScrollView, View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { getDashboard } from "../../api/dashboardApi";

function Card({ title, value, note }) {
  return (
    <View style={styles.card}>
      <Text style={styles.cardTitle}>{title}</Text>
      <Text style={styles.cardValue}>{value}</Text>
      <Text style={styles.cardNote}>{note}</Text>
    </View>
  );
}

export default function DashboardScreen() {
  const [dashboard, setDashboard] = useState(null);

  const loadDashboard = async () => {
    const data = await getDashboard();
    setDashboard(data);
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = dashboard?.summary || {};
  const activities = dashboard?.recentActivities || [];

  return (
    <ScrollView style={styles.page}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>HR Payroll Integration System</Text>
      </View>

      <View style={styles.grid}>
        <Card title="Employees" value={summary.totalEmployees || 0} note="HUMAN_2025" />
        <Card title="Departments" value={summary.totalDepartments || 0} note="SQL Server" />
        <Card title="Positions" value={summary.totalPositions || 0} note="SQL Server" />
        <Card title="Users" value={summary.totalUsers || 0} note="auth_db" />
      </View>

      <View style={styles.payrollCard}>
        <Text style={styles.payrollLabel}>Total Payroll</Text>
        <Text style={styles.payrollValue}>
          {Number(summary.totalPayroll || 0).toLocaleString()} VND
        </Text>
        <Text style={styles.payrollNote}>Loaded from payroll_2026</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activities</Text>

        {activities.map((item, index) => (
          <View style={styles.activity} key={index}>
            <View style={styles.dot} />
            <Text style={styles.activityText}>{item}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.button} onPress={loadDashboard}>
        <Text style={styles.buttonText}>Refresh Dashboard</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    padding: 20,
  },
  header: {
    marginTop: 30,
    marginBottom: 20,
  },
  title: {
    fontSize: 34,
    fontWeight: "900",
    color: "#111827",
  },
  subtitle: {
    marginTop: 6,
    color: "#64748b",
    fontSize: 15,
  },
  grid: {
    gap: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    marginBottom: 12,
  },
  cardTitle: {
    color: "#64748b",
    fontSize: 14,
  },
  cardValue: {
    marginTop: 8,
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },
  cardNote: {
    marginTop: 6,
    color: "#0d86ff",
    fontWeight: "700",
  },
  payrollCard: {
    marginTop: 10,
    borderRadius: 22,
    padding: 24,
    backgroundColor: "#0d86ff",
  },
  payrollLabel: {
    color: "#dbeafe",
    fontSize: 15,
  },
  payrollValue: {
    color: "#ffffff",
    fontSize: 28,
    fontWeight: "900",
    marginTop: 8,
  },
  payrollNote: {
    color: "#e0f2fe",
    marginTop: 8,
  },
  section: {
    marginTop: 24,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "900",
    marginBottom: 16,
  },
  activity: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 99,
    backgroundColor: "#22c55e",
    marginRight: 12,
  },
  activityText: {
    color: "#334155",
    fontWeight: "600",
  },
  button: {
    marginTop: 20,
    marginBottom: 40,
    backgroundColor: "#111827",
    padding: 16,
    borderRadius: 16,
    alignItems: "center",
  },
  buttonText: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
