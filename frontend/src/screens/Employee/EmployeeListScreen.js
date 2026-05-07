import React, { useEffect, useMemo, useState } from "react";
import {
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

import {
  getEmployees,
  createEmployee,
  updateEmployee,
  deleteEmployee,
} from "../../api/employeeApi";

import { getDepartments, getPositions } from "../../api/departmentApi";

const emptyForm = {
  FullName: "",
  DateOfBirth: "2000-01-01",
  Gender: "Male",
  PhoneNumber: "",
  Email: "",
  HireDate: "2026-05-08",
  DepartmentID: 1,
  PositionID: 1,
  Status: "Đang làm việc",
};
const statusOptions = ["All", "Đang làm việc", "Nghỉ phép", "Thực tập"];

function EmployeeCard({ employee, onEdit, onDelete }) {
  const statusColor =
  employee.Status === "Đang làm việc"
    ? "#22c55e"
    : employee.Status === "Nghỉ phép"
    ? "#f59e0b"
    : employee.Status === "Thực tập"
    ? "#3b82f6"
    : "#ef4444";

  return (
    <View style={styles.card}>
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{employee.FullName?.charAt(0)}</Text>
      </View>

      <View style={styles.cardContent}>
        <Text style={styles.name}>{employee.FullName}</Text>
        <Text style={styles.info}>{employee.Email}</Text>
        <Text style={styles.info}>{employee.PhoneNumber || "No phone"}</Text>

        <View style={styles.row}>
          <Text style={styles.department}>{employee.DepartmentName}</Text>
          <Text style={styles.position}>{employee.PositionName}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
          <Text style={styles.statusText}>{employee.Status}</Text>
        </View>

        <TouchableOpacity style={styles.editBtn} onPress={() => onEdit(employee)}>
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteBtn}
          onPress={() => onDelete(employee.EmployeeID)}
        >
          <Text style={styles.actionText}>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function EmployeeForm({ form, setForm, departments, positions, onSubmit, onCancel, editing }) {
  return (
    <View style={styles.modalBox}>
      <Text style={styles.modalTitle}>
        {editing ? "Edit Employee" : "Add Employee"}
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Full name"
        value={form.FullName}
        onChangeText={(value) => setForm({ ...form, FullName: value })}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={form.Email}
        onChangeText={(value) => setForm({ ...form, Email: value })}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone number"
        value={form.PhoneNumber}
        onChangeText={(value) => setForm({ ...form, PhoneNumber: value })}
      />

      <TextInput
        style={styles.input}
        placeholder="Date of birth: YYYY-MM-DD"
        value={form.DateOfBirth}
        onChangeText={(value) => setForm({ ...form, DateOfBirth: value })}
      />

      <TextInput
        style={styles.input}
        placeholder="Hire date: YYYY-MM-DD"
        value={form.HireDate}
        onChangeText={(value) => setForm({ ...form, HireDate: value })}
      />

      <View style={styles.optionRow}>
        {["Male", "Female"].map((gender) => (
          <TouchableOpacity
            key={gender}
            style={[styles.optionBtn, form.Gender === gender && styles.optionActive]}
            onPress={() => setForm({ ...form, Gender: gender })}
          >
            <Text
              style={[
                styles.optionText,
                form.Gender === gender && styles.optionTextActive,
              ]}
            >
              {gender}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Department</Text>
      <View style={styles.optionWrap}>
        {departments.map((department) => (
          <TouchableOpacity
            key={department.DepartmentID}
            style={[
              styles.chip,
              Number(form.DepartmentID) === Number(department.DepartmentID) &&
                styles.chipActive,
            ]}
            onPress={() =>
              setForm({ ...form, DepartmentID: department.DepartmentID })
            }
          >
            <Text
              style={[
                styles.chipText,
                Number(form.DepartmentID) === Number(department.DepartmentID) &&
                  styles.chipTextActive,
              ]}
            >
              {department.DepartmentName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Position</Text>
      <View style={styles.optionWrap}>
        {positions.map((position) => (
          <TouchableOpacity
            key={position.PositionID}
            style={[
              styles.chip,
              Number(form.PositionID) === Number(position.PositionID) &&
                styles.chipActiveGreen,
            ]}
            onPress={() => setForm({ ...form, PositionID: position.PositionID })}
          >
            <Text
              style={[
                styles.chipText,
                Number(form.PositionID) === Number(position.PositionID) &&
                  styles.chipTextActive,
              ]}
            >
              {position.PositionName}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.fieldLabel}>Status</Text>
      <View style={styles.optionRow}>
        {["Đang làm việc", "Nghỉ phép", "Thực tập"].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.optionBtn, form.Status === status && styles.optionActive]}
            onPress={() => setForm({ ...form, Status: status })}
          >
            <Text
              style={[
                styles.optionText,
                form.Status === status && styles.optionTextActive,
              ]}
            >
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.modalActions}>
        <TouchableOpacity style={styles.cancelBtn} onPress={onCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.saveBtn} onPress={onSubmit}>
          <Text style={styles.saveText}>{editing ? "Update" : "Add"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default function EmployeeListScreen() {
  const [employees, setEmployees] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [positions, setPositions] = useState([]);

  const [searchText, setSearchText] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All");
  const [positionFilter, setPositionFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");

  const [showForm, setShowForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    try {
      const employeeData = await getEmployees();
      const departmentData = await getDepartments();
      const positionData = await getPositions();

      setEmployees(employeeData.employees || []);
      setDepartments(departmentData || []);
      setPositions(positionData || []);
    } catch (error) {
      console.log("Employee screen error:", error.message);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredEmployees = useMemo(() => {
    return employees.filter((employee) => {
      const keyword = searchText.toLowerCase();

      const matchSearch =
        String(employee.FullName || "").toLowerCase().includes(keyword) ||
        String(employee.Email || "").toLowerCase().includes(keyword) ||
        String(employee.DepartmentName || "").toLowerCase().includes(keyword) ||
        String(employee.PositionName || "").toLowerCase().includes(keyword);

      const matchDepartment =
        departmentFilter === "All" || employee.DepartmentName === departmentFilter;

      const matchPosition =
        positionFilter === "All" || employee.PositionName === positionFilter;

      const matchStatus =
        statusFilter === "All" || employee.Status === statusFilter;

      return matchSearch && matchDepartment && matchPosition && matchStatus;
    });
  }, [employees, searchText, departmentFilter, positionFilter, statusFilter]);

  const openAddForm = () => {
    setEditingEmployee(null);
    setForm({
      ...emptyForm,
      DepartmentID: departments[0]?.DepartmentID || 1,
      PositionID: positions[0]?.PositionID || 1,
    });
    setShowForm(true);
  };

  const openEditForm = (employee) => {
    setEditingEmployee(employee);
    setForm({
      FullName: employee.FullName || "",
      DateOfBirth: employee.DateOfBirth || "2000-01-01",
      Gender: employee.Gender || "Male",
      PhoneNumber: employee.PhoneNumber || "",
      Email: employee.Email || "",
      HireDate: employee.HireDate || "2026-05-08",
      DepartmentID: employee.DepartmentID || 1,
      PositionID: employee.PositionID || 1,
      Status: employee.Status || "Đang làm việc",
    });
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingEmployee(null);
    setForm(emptyForm);
  };

  const submitForm = async () => {
    try {
      if (!form.FullName.trim()) {
        alert("Full name is required");
        return;
      }

      if (editingEmployee) {
        await updateEmployee(editingEmployee.EmployeeID, form);
      } else {
        await createEmployee(form);
      }

      closeForm();
      loadData();
    } catch (error) {
      console.log("Save employee error:", error.message);
      alert("Cannot save employee");
    }
  };

  const handleDelete = async (employeeId) => {
    try {
      const confirmDelete = window.confirm("Delete this employee?");
      if (!confirmDelete) return;

      await deleteEmployee(employeeId);
      loadData();
    } catch (error) {
      console.log("Delete employee error:", error.message);
      alert("Cannot delete employee");
    }
  };

  return (
    <ScrollView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Employee Management</Text>
          <Text style={styles.subtitle}>
            View, search, filter, add, edit, and delete employees
          </Text>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.refreshButton} onPress={loadData}>
            <Text style={styles.refreshText}>Refresh</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.addButton} onPress={openAddForm}>
            <Text style={styles.addText}>Add Employee</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.summaryGrid}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Total Employees</Text>
          <Text style={styles.summaryValue}>{employees.length}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Filtered</Text>
          <Text style={styles.summaryValue}>{filteredEmployees.length}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Departments</Text>
          <Text style={styles.summaryValue}>{departments.length}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>Positions</Text>
          <Text style={styles.summaryValue}>{positions.length}</Text>
        </View>
      </View>

      <View style={styles.filterPanel}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search employee..."
          placeholderTextColor="#94a3b8"
          value={searchText}
          onChangeText={setSearchText}
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChip,
              departmentFilter === "All" && styles.filterChipActive,
            ]}
            onPress={() => setDepartmentFilter("All")}
          >
            <Text style={styles.filterText}>All Departments</Text>
          </TouchableOpacity>

          {departments.map((department) => (
            <TouchableOpacity
              key={department.DepartmentID}
              style={[
                styles.filterChip,
                departmentFilter === department.DepartmentName &&
                  styles.filterChipActive,
              ]}
              onPress={() => setDepartmentFilter(department.DepartmentName)}
            >
              <Text style={styles.filterText}>{department.DepartmentName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            style={[
              styles.filterChipGreen,
              positionFilter === "All" && styles.filterChipGreenActive,
            ]}
            onPress={() => setPositionFilter("All")}
          >
            <Text style={styles.filterText}>All Positions</Text>
          </TouchableOpacity>

          {positions.map((position) => (
            <TouchableOpacity
              key={position.PositionID}
              style={[
                styles.filterChipGreen,
                positionFilter === position.PositionName &&
                  styles.filterChipGreenActive,
              ]}
              onPress={() => setPositionFilter(position.PositionName)}
            >
              <Text style={styles.filterText}>{position.PositionName}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {statusOptions.map((status) => (
            <TouchableOpacity
              key={status}
              style={[
                styles.statusFilter,
                statusFilter === status && styles.statusFilterActive,
              ]}
              onPress={() => setStatusFilter(status)}
            >
              <Text style={styles.filterText}>{status}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {showForm && (
        <EmployeeForm
          form={form}
          setForm={setForm}
          departments={departments}
          positions={positions}
          onSubmit={submitForm}
          onCancel={closeForm}
          editing={!!editingEmployee}
        />
      )}

      <View style={styles.listPanel}>
        {filteredEmployees.map((employee) => (
          <EmployeeCard
            key={employee.EmployeeID}
            employee={employee}
            onEdit={openEditForm}
            onDelete={handleDelete}
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

  headerActions: {
    flexDirection: "row",
    gap: 12,
  },

  refreshButton: {
    backgroundColor: "#111827",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  refreshText: {
    color: "#ffffff",
    fontWeight: "900",
  },

  addButton: {
    backgroundColor: "#0d86ff",
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 14,
  },

  addText: {
    color: "#ffffff",
    fontWeight: "900",
  },

  summaryGrid: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 20,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
  },

  summaryLabel: {
    color: "#64748b",
    fontWeight: "700",
  },

  summaryValue: {
    marginTop: 8,
    fontSize: 28,
    fontWeight: "900",
  },

  filterPanel: {
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 18,
    marginBottom: 22,
    gap: 12,
  },

  searchInput: {
    backgroundColor: "#f8fafc",
    height: 48,
    borderRadius: 12,
    paddingHorizontal: 16,
    outlineStyle: "none",
  },

  filterChip: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    marginRight: 8,
  },

  filterChipActive: {
    backgroundColor: "#0d86ff",
  },

  filterChipGreen: {
    backgroundColor: "#ecfdf5",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    marginRight: 8,
  },

  filterChipGreenActive: {
    backgroundColor: "#22c55e",
  },

  statusFilter: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 99,
    marginRight: 8,
  },

  statusFilterActive: {
    backgroundColor: "#f59e0b",
  },

  filterText: {
    color: "#111827",
    fontWeight: "800",
    fontSize: 12,
  },

  modalBox: {
    backgroundColor: "#ffffff",
    borderRadius: 20,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "900",
    marginBottom: 16,
  },

  input: {
    height: 46,
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    paddingHorizontal: 14,
    marginBottom: 12,
    outlineStyle: "none",
  },

  fieldLabel: {
    marginTop: 10,
    marginBottom: 8,
    fontWeight: "900",
    color: "#334155",
  },

  optionRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 12,
  },

  optionBtn: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },

  optionActive: {
    backgroundColor: "#0d86ff",
  },

  optionText: {
    fontWeight: "800",
    color: "#334155",
  },

  optionTextActive: {
    color: "#ffffff",
  },

  optionWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  chip: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 99,
  },

  chipActive: {
    backgroundColor: "#0d86ff",
  },

  chipActiveGreen: {
    backgroundColor: "#22c55e",
  },

  chipText: {
    color: "#334155",
    fontWeight: "800",
    fontSize: 12,
  },

  chipTextActive: {
    color: "#ffffff",
  },

  modalActions: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 18,
  },

  cancelBtn: {
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#f1f5f9",
  },

  cancelText: {
    fontWeight: "900",
    color: "#334155",
  },

  saveBtn: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#0d86ff",
  },

  saveText: {
    fontWeight: "900",
    color: "#ffffff",
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

  actions: {
    alignItems: "flex-end",
    gap: 8,
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

  editBtn: {
    backgroundColor: "#f59e0b",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  deleteBtn: {
    backgroundColor: "#ef4444",
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },

  actionText: {
    color: "#ffffff",
    fontWeight: "900",
    fontSize: 12,
  },
});