import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { getDepartments, getPositions } from "../../api/departmentApi";

function SummaryCard({ title, value, color }) {
  return (
    <View style={[styles.summaryCard, { borderLeftColor: color }]}>
      <Text style={styles.summaryTitle}>{title}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

function DataCard({ title, subtitle, count, type }) {
  return (
    <View style={styles.dataCard}>
      <View>
        <Text style={styles.dataTitle}>{title}</Text>
        <Text style={styles.dataSubtitle}>{subtitle}</Text>
      </View>

      <View style={styles.countBox}>
        <Text style={styles.countValue}>{count}</Text>
        <Text style={styles.countLabel}>employees</Text>
      </View>

      <View style={styles.typeBadge}>
        <Text style={styles.typeBadgeText}>{type}</Text>
      </View>
    </View>
  );
}

export default function DepartmentScreen() {
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("departments");

  const loadData = async () => {
    try {
      const departmentData = await getDepartments();
      const positionData = await getPositions();

      setDepartments(departmentData);
      setPositions(positionData);
    } catch (error) {
      console.log("Department screen error:", error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredDepartments = useMemo(() => {
    return departments.filter((item) =>
      String(item.DepartmentName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [departments, searchText]);

  const filteredPositions = useMemo(() => {
    return positions.filter((item) =>
      String(item.PositionName || "")
        .toLowerCase()
        .includes(searchText.toLowerCase())
    );
  }, [positions, searchText]);

  const totalDepartmentEmployees = departments.reduce(
    (sum, item) => sum + Number(item.TotalEmployees || 0),
    0
  );

  const totalPositionEmployees = positions.reduce(
    (sum, item) => sum + Number(item.TotalEmployees || 0),
    0
  );

  return (
    <ScrollView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Department & Position</Text>
          <Text style={styles.subtitle}>
            Manage departments, positions, and employee distribution
          </Text>
        </View>

        <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.summaryGrid}>
        <SummaryCard
          title="Total Departments"
          value={departments.length}
          color="#0d86ff"
        />

        <SummaryCard
          title="Total Positions"
          value={positions.length}
          color="#22c55e"
        />

        <SummaryCard
          title="Department Employees"
          value={totalDepartmentEmployees}
          color="#f59e0b"
        />

        <SummaryCard
          title="Position Employees"
          value={totalPositionEmployees}
          color="#ef4444"
        />
      </View>

      <View style={styles.toolBar}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search department or position..."
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
        />

        <View style={styles.tabs}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "departments" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("departments")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "departments" && styles.tabTextActive,
              ]}
            >
              Departments
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              activeTab === "positions" && styles.tabButtonActive,
            ]}
            onPress={() => setActiveTab("positions")}
          >
            <Text
              style={[
                styles.tabText,
                activeTab === "positions" && styles.tabTextActive,
              ]}
            >
              Positions
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.listPanel}>
        <View style={styles.panelHeader}>
          <Text style={styles.panelTitle}>
            {activeTab === "departments"
              ? "Department List"
              : "Position List"}
          </Text>

          <Text style={styles.panelCount}>
            {activeTab === "departments"
              ? filteredDepartments.length
              : filteredPositions.length}{" "}
            records
          </Text>
        </View>

        {activeTab === "departments" &&
          filteredDepartments.map((item) => (
            <DataCard
              key={item.DepartmentID}
              title={item.DepartmentName}
              subtitle={`Department ID: ${item.DepartmentID}`}
              count={item.TotalEmployees}
              type="Department"
            />
          ))}

        {activeTab === "positions" &&
          filteredPositions.map((item) => (
            <DataCard
              key={item.PositionID}
              title={item.PositionName}
              subtitle={`Position ID: ${item.PositionID}`}
              count={item.TotalEmployees}
              type="Position"
            />
          ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#f4f6fb",
    padding: 24,
  },

  header: {
    marginTop: 28,
    marginBottom: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  title: {
    fontSize: 32,
    fontWeight: "900",
    color: "#111827",
  },

  subtitle: {
    color: "#64748b",
    marginTop: 6,
    fontSize: 14,
  },

  refreshButton: {
    backgroundColor: "#0d86ff",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  refreshText: {
    color: "#ffffff",
    fontWeight: "900",
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 24,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderLeftWidth: 6,
  },

  summaryTitle: {
    color: "#64748b",
    fontSize: 13,
    fontWeight: "700",
  },

  summaryValue: {
    marginTop: 10,
    fontSize: 30,
    fontWeight: "900",
    color: "#111827",
  },

  toolBar: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    flexDirection: "row",
    gap: 16,
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    height: 46,
    borderRadius: 12,
    paddingHorizontal: 16,
    color: "#111827",
    outlineStyle: "none",
  },

  tabs: {
    flexDirection: "row",
    backgroundColor: "#f1f5f9",
    borderRadius: 12,
    padding: 4,
  },

  tabButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 10,
  },

  tabButtonActive: {
    backgroundColor: "#0d86ff",
  },

  tabText: {
    color: "#64748b",
    fontWeight: "800",
  },

  tabTextActive: {
    color: "#ffffff",
  },

  listPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 22,
    marginBottom: 60,
  },

  panelHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 18,
  },

  panelTitle: {
    fontSize: 20,
    fontWeight: "900",
    color: "#111827",
  },

  panelCount: {
    color: "#64748b",
    fontWeight: "700",
  },

  dataCard: {
    backgroundColor: "#f8fbff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#edf2f7",
  },

  dataTitle: {
    fontSize: 17,
    fontWeight: "900",
    color: "#111827",
    minWidth: 260,
  },

  dataSubtitle: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
  },

  countBox: {
    marginLeft: "auto",
    alignItems: "center",
    marginRight: 20,
  },

  countValue: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0d86ff",
  },

  countLabel: {
    color: "#64748b",
    fontSize: 12,
  },

  typeBadge: {
    backgroundColor: "#eaf4ff",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 99,
  },

  typeBadgeText: {
    color: "#0d86ff",
    fontWeight: "900",
    fontSize: 12,
  },
});