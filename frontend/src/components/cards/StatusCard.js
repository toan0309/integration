import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function StatusCard({ title, value }) {
  const isOk = value === "connected" || value === "running";

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: isOk ? "#16a34a" : "#dc2626" }]}>
        {value || "N/A"}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 18,
    borderRadius: 16,
    marginBottom: 12,
  },
  title: {
    color: "#64748b",
    fontSize: 14,
  },
  value: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: "800",
  },
});
