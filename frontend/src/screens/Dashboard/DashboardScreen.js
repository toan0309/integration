import React, { useEffect, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
} from "react-native";
import { getDashboard } from "../../api/dashboardApi";

const menuItems = [
  "Dashboard",
  "Department",
  "Employee",
  "Attendance",
  "Salary",
  "Report",
  "Guide",
  "Messenger",
  "Settings",
];

function Sidebar() {
  return (
    <View style={styles.sidebar}>
      <View style={styles.logoRow}>
        <View style={styles.logoBox} />
        <Text style={styles.logoText}>HR System</Text>
      </View>

      {menuItems.map((item) => (
        <View
          key={item}
          style={[
            styles.menuItem,
            item === "Dashboard" && styles.menuItemActive,
          ]}
        >
          <Text style={styles.menuIcon}>
  {item === "Dashboard"
    ? "🏠"
    : item === "Department"
    ? "🏢"
    : item === "Employee"
    ? "👤"
    : item === "Attendance"
    ? "📅"
    : item === "Salary"
    ? "💰"
    : item === "Report"
    ? "📊"
    : item === "Guide"
    ? "📘"
    : item === "Messenger"
    ? "💬"
    : "⚙️"}
</Text>

          <Text
            style={[
              styles.menuText,
              item === "Dashboard" && styles.menuTextActive,
            ]}
          >
            {item}
          </Text>

          {item === "Report" && <Text style={styles.badge}>14</Text>}
          {item === "Messenger" && <Text style={styles.newBadge}>New!</Text>}
        </View>
      ))}
    </View>
  );
}

function Topbar() {
  return (
    <View style={styles.topbar}>
      <View>
        <Text style={styles.pageTitle}>Dashboard</Text>
        <Text style={styles.pageSubtitle}>
          HR and Payroll Integration Overview
        </Text>
      </View>

      <View style={styles.topRight}>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search here..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        <View style={styles.notificationGroup}>
          <Text style={styles.notification}>🔔 23</Text>
<Text style={styles.notification}>📧 68</Text>
<Text style={styles.notification}>📝 14</Text>
        </View>

        <View style={styles.profile}>
          <View>
            <Text style={styles.profileName}>Designluch</Text>
            <Text style={styles.profileRole}>Super Admin</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AD</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function StatCard({ title, value, note }) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statNote}>{note}</Text>
    </View>
  );
}

function IncomeCard({ title, value, color }) {
  return (
    <View style={[styles.incomeCard, { backgroundColor: color }]}>
      <View style={styles.circle}>
        <Text style={styles.circleText}>+5%</Text>
      </View>
      <View>
        <Text style={styles.incomeTitle}>{title}</Text>
        <Text style={styles.incomeValue}>{value}</Text>
      </View>
    </View>
  );
}

function cleanName(name) {
  return String(name || "")
    .replace("Phòng ", "")
    .replace("Phong ", "");
}

function DepartmentChart({ data }) {
  const maxValue = Math.max(...data.map((item) => item.total), 1);

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Employees by Department</Text>
        <TouchableOpacity style={styles.monthButton}>
          <Text style={styles.monthText}>This Month</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.chartArea}>
        {data.map((item) => {
          const height = 55 + (item.total / maxValue) * 100;

          return (
            <View style={styles.barItem} key={item.departmentName}>
              <View style={[styles.bar, { height }]}>
                <Text style={styles.barValue}>{item.total}</Text>
              </View>
              <Text style={styles.barLabel} numberOfLines={2}>
                {cleanName(item.departmentName)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

function RecentActivities({ activities }) {
  return (
    <View style={styles.panel}>
      <Text style={styles.panelTitle}>Recent Activities</Text>

      <View style={styles.activities}>
        {activities.map((item, index) => (
          <View key={index} style={styles.activityItem}>
            <View style={styles.activityDot} />
            <Text style={styles.activityText}>{item}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

function DividendSummary({ totalPayroll }) {
  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Dividend Summary</Text>
        <Text style={styles.tabText}>Monthly Weekly Daily</Text>
      </View>

      <View style={styles.newsRow}>
        <View>
          <Text style={styles.newsTag}>#AD-001245</Text>
          <Text style={styles.newsTitle}>Dashboard integration loaded</Text>
          <Text style={styles.newsDate}>Published on dashboard</Text>
        </View>
        <Text style={styles.newsPercent}>-2%</Text>
      </View>

      <View style={styles.newsRow}>
        <View>
          <Text style={styles.newsTag}>#PAYROLL</Text>
          <Text style={styles.newsTitle}>{totalPayroll}</Text>
          <Text style={styles.newsDate}>Loaded from payroll_2026</Text>
        </View>
        <Text style={styles.newsPercent}>+5%</Text>
      </View>
    </View>
  );
}

function PayrollTrend({ totalPayroll }) {
  const points = [70, 130, 105, 150, 80, 170, 120, 190, 90, 160, 115, 180];

  return (
    <View style={styles.panel}>
      <View style={styles.panelHeader}>
        <Text style={styles.panelTitle}>Payroll Trend</Text>
        <TouchableOpacity style={styles.downloadButton}>
          <Text style={styles.downloadText}>Download CSV</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.trendValue}>{totalPayroll}</Text>
      <Text style={styles.trendNote}>+9% from last month</Text>

      <View style={styles.trendArea}>
        {points.map((height, index) => (
          <View key={index} style={[styles.trendBar, { height }]} />
        ))}
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const [dashboard, setDashboard] = useState(null);

  const loadDashboard = async () => {
    try {
      const data = await getDashboard();
      setDashboard(data);
    } catch (error) {
      console.log("Dashboard error:", error.message);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const summary = dashboard?.summary || {};
  const chart = dashboard?.departmentChart || [];
  const activities = dashboard?.recentActivities || [];

  const money = Number(summary.totalPayroll || 0).toLocaleString("vi-VN") + " VND";

  return (
    <View style={styles.wrapper}>
      <Sidebar />

      <ScrollView style={styles.main}>
        <Topbar />

        <View style={styles.summaryRow}>
          <StatCard title="Total Employees" value={summary.totalEmployees || 0} note="+12%" />
          <StatCard title="Working Today" value={summary.activeEmployees || 0} note="+8%" />
          <StatCard title="On Leave" value={summary.leaveEmployees || 0} note="+3%" />

          <View style={styles.incomeRow}>
            <IncomeCard
  title="Total Dividend"
  value={"5,245 USD"}
  color="#0d86ff"
/>
            <IncomeCard title="Total Payroll" value={money} color="#22c55e" />
          </View>
        </View>

        <View style={styles.contentGrid}>
          <View style={styles.leftColumn}>
            <DepartmentChart data={chart} />
          </View>
          <View style={styles.rightColumn}>
            <RecentActivities activities={activities} />
          </View>
        </View>

        <View style={styles.bottomGrid}>
          <DividendSummary totalPayroll={money} />
          <PayrollTrend totalPayroll={money} />
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={loadDashboard}>
          <Text style={styles.refreshText}>Refresh Dashboard</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    flexDirection: "row",
    backgroundColor: "#f3f5fa",
  },

  sidebar: {
    width: 250,
    backgroundColor: "#ffffff",
    padding: 26,
    minHeight: "100vh",
  },
  logoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 36,
  },
  logoBox: {
    width: 24,
    height: 24,
    borderRadius: 8,
    backgroundColor: "#38a6d9",
    marginRight: 12,
  },
  logoText: {
    fontWeight: "900",
    fontSize: 18,
  },
  menuItem: {
    height: 52,
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemActive: {
    backgroundColor: "#e8f3ff",
  },
  menuIcon: {
    width: 26,
    color: "#64748b",
    fontWeight: "900",
  },
  menuText: {
    color: "#64748b",
    fontWeight: "700",
    flex: 1,
  },
  menuTextActive: {
    color: "#0d86ff",
  },
  badge: {
    backgroundColor: "#8190a8",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    fontSize: 11,
    fontWeight: "800",
  },
  newBadge: {
    backgroundColor: "#ff5368",
    color: "#fff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 99,
    fontSize: 11,
    fontWeight: "800",
  },

  main: {
    flex: 1,
    padding: 32,
  },

  topbar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 32,
  },
  pageTitle: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
  },
  pageSubtitle: {
    color: "#64748b",
    marginTop: 6,
  },
  topRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  searchBox: {
    width: 250,
    height: 46,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    outlineStyle: "none",
  },
  searchIcon: {
    color: "#64748b",
    fontSize: 12,
  },
  notificationGroup: {
    flexDirection: "row",
    gap: 8,
  },
  notification: {
    fontWeight: "800",
    color: "#334155",
  },
  profile: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  profileName: {
    fontWeight: "900",
  },
  profileRole: {
    color: "#94a3b8",
    fontSize: 12,
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "#e9d8b8",
    justifyContent: "center",
    alignItems: "center",
  },
  avatarText: {
    fontWeight: "900",
  },

  summaryRow: {
    flexDirection: "row",
    gap: 22,
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 22,
    minHeight: 110,
  },
  statTitle: {
    color: "#64748b",
    fontSize: 14,
  },
  statValue: {
    marginTop: 10,
    fontSize: 28,
    fontWeight: "900",
  },
  statNote: {
    marginTop: 6,
    color: "#00c889",
    fontWeight: "800",
  },
  incomeRow: {
    flex: 2.2,
    flexDirection: "row",
    borderRadius: 18,
    overflow: "hidden",
  },
  incomeCard: {
    flex: 1,
    padding: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  circle: {
    width: 54,
    height: 54,
    borderRadius: 99,
    borderWidth: 8,
    borderColor: "rgba(255,255,255,0.55)",
    justifyContent: "center",
    alignItems: "center",
  },
  circleText: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 11,
  },
  incomeTitle: {
    color: "#e0f2fe",
    fontSize: 14,
    fontWeight: "700",
  },
  incomeValue: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
    marginTop: 8,
  },

  contentGrid: {
    flexDirection: "row",
    gap: 26,
    marginBottom: 26,
  },
  leftColumn: {
    flex: 2.2,
  },
  rightColumn: {
    flex: 1,
  },
  bottomGrid: {
    flexDirection: "row",
    gap: 26,
  },

  panel: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 24,
    minHeight: 260,
  },
  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  panelTitle: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },
  monthButton: {
    borderWidth: 1,
    borderColor: "#0d86ff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  monthText: {
    color: "#0d86ff",
    fontWeight: "800",
  },
  chartArea: {
    marginTop: 28,
    height: 220,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    borderBottomColor: "#e5edf6",
  },
  barItem: {
    alignItems: "center",
    flex: 1,
  },
  bar: {
    width: "58%",
    backgroundColor: "#3294f6",
    borderRadius: 10,
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 6,
  },
  barValue: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 12,
  },
  barLabel: {
    marginTop: 10,
    fontSize: 11,
    color: "#64748b",
    fontWeight: "700",
    textAlign: "center",
    height: 36,
  },

  activities: {
    marginTop: 24,
  },
  activityItem: {
    backgroundColor: "#f3f6fb",
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  activityDot: {
    width: 8,
    height: 8,
    borderRadius: 99,
    backgroundColor: "#0d86ff",
    marginRight: 12,
  },
  activityText: {
    fontWeight: "700",
    color: "#334155",
  },

  tabText: {
    color: "#64748b",
    fontSize: 12,
  },
  newsRow: {
    marginTop: 22,
    padding: 18,
    borderRadius: 14,
    backgroundColor: "#f8fbff",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  newsTag: {
    color: "#0d86ff",
    fontWeight: "800",
    marginBottom: 8,
  },
  newsTitle: {
    fontWeight: "900",
  },
  newsDate: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 12,
  },
  newsPercent: {
    fontWeight: "900",
    color: "#111827",
  },

  downloadButton: {
    borderWidth: 1,
    borderColor: "#0d86ff",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  downloadText: {
    color: "#0d86ff",
    fontWeight: "800",
  },
  trendValue: {
    marginTop: 22,
    fontSize: 28,
    fontWeight: "900",
  },
  trendNote: {
    marginTop: 6,
    color: "#111827",
    fontSize: 12,
  },
  trendArea: {
    height: 160,
    marginTop: 26,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
  },
  trendBar: {
    flex: 1,
    backgroundColor: "#0d86ff",
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
  },

  refreshButton: {
    marginTop: 26,
    marginBottom: 60,
    alignSelf: "flex-end",
    backgroundColor: "#111827",
    paddingVertical: 14,
    paddingHorizontal: 22,
    borderRadius: 14,
  },
  refreshText: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
