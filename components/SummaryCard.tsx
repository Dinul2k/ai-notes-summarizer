import React, { useState } from "react";
import { View, Text, TouchableOpacity } from "react-native";

type SummaryCardProps = {
  title: string;
  summary: string;
};

export default function SummaryCard({ title, summary }: SummaryCardProps) {
  const [expanded, setExpanded] = useState(false);

  return (
    <View
      style={{
        backgroundColor: "#f8f8ff",
        margin: 10,
        borderRadius: 10,
        padding: 12,
      }}
    >
      <Text style={{ fontWeight: "bold", fontSize: 16 }}>{title}</Text>
      <Text numberOfLines={expanded ? undefined : 3}>{summary}</Text>
      <TouchableOpacity onPress={() => setExpanded(!expanded)}>
        <Text style={{ color: "blue" }}>
          {expanded ? "Show less" : "Show more"}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
