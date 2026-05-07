import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import { getEmployees } from "../../api/employeeApi";

function EmployeeCard({ employee }) {
  const statusColor =
    employee.Status === "Đang làm việc"
      ? "#22c55e"
      : employee.Status === "Nghỉ phép"
      ? "#f59e0b"
      : "#ef4444";

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {employee.FullName?.charAt(0)}
        </Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.name}>{employee.FullName}</Text>

        <Text style={styles.info}>{employee.Email}</Text>

        <Text style={styles.info}>
          {employee.PhoneNumber || "No phone"}
        </Text>

        <View style={styles.row}>
          <Text style={styles.department}>
            {employee.DepartmentName}
          </Text>

          <Text style={styles.position}>
            {employee.PositionName}
          </Text>
        </View>
      </View>

      <View
        style={[
          styles.statusBadge,
          { backgroundColor: statusColor },
        ]}
      >
        <Text style={styles.statusText}>
          {employee.Status}
        </Text>
      </View>
    </View>
  );
}

export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState([]);
  const [searchText, setSearchText] = useState("");

  const loadEmployees = async () => {
    try {
      const data = await getEmployees();
      setEmployees(data.employees || []);
    } catch (error) {
      console.log("Employee error:", error.message);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const keyword = searchText.toLowerCase();

      return (
        String(employee.FullName || "")
          .toLowerCase()
          .includes(keyword) ||

        String(employee.Email || "")
          .toLowerCase()
          .includes(keyword) ||

        String(employee.DepartmentName || "")
          .toLowerCase()
          .includes(keyword) ||

        String(employee.PositionName || "")
          .toLowerCase()
          .includes(keyword)
      );
    });
  }, [employees, searchText]);

  return (
    <ScrollView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Employee Management</Text>

          <Text style={styles.subtitle}>
            Manage employee information and status
          </Text>
        </View>

        <TouchableOpacity
          style={styles.refreshButton}
          onPress={loadEmployees}
        >
          <Text style={styles.refreshText}>Refresh</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.topPanel}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search employee..."
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
        />

        <View style={styles.summaryBox}>
          <Text style={styles.summaryValue}>
            {filteredEmployees.length}
          </Text>

          <Text style={styles.summaryLabel}>
            employees
          </Text>
        </View>
      </View>

      <View style={styles.listPanel}>
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.EmployeeID}
            employee={employee}
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

  topPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 24,
    flexDirection: "row",
    gap: 18,
    alignItems: "center",
  },

  searchInput: {
    flex: 1,
    backgroundColor: "#f8fafc",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    outlineStyle: "none",
  },

  summaryBox: {
    width: 110,
    height: 72,
    backgroundColor: "#0d86ff",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  summaryValue: {
    color: "#ffffff",
    fontSize: 24,
    fontWeight: "900",
  },

  summaryLabel: {
    color: "#dbeafe",
    fontSize: 12,
  },

  listPanel: {
    marginBottom: 60,
  },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#edf2f7",
  },

  avatar: {
    width: 58,
    height: 58,
    borderRadius: 99,
    backgroundColor: "#0d86ff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 18,
  },

  avatarText: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "900",
  },

  cardContent: {
    flex: 1,
  },

  name: {
    fontSize: 18,
    fontWeight: "900",
    color: "#111827",
  },

  info: {
    marginTop: 4,
    color: "#64748b",
  },

  row: {
    marginTop: 10,
    flexDirection: "row",
    gap: 10,
  },

  department: {
    backgroundColor: "#e0f2fe",
    color: "#0284c7",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    fontSize: 12,
    fontWeight: "800",
  },

  position: {
    backgroundColor: "#ede9fe",
    color: "#7c3aed",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 99,
    fontSize: 12,
    fontWeight: "800",
  },

  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
  },

  statusText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 12,
  },
});