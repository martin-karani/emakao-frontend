import React from "react";
import {
  ScrollView,
  View,
  Text,
  RefreshControl,
  StyleSheet,
  Pressable,
  ActivityIndicator,
} from "react-native";
import { useQuery } from "@tanstack/react-query";
import { formatKES } from "@emakao/shared";
import { createApiClient } from "@emakao/api-client";
import Constants from "expo-constants";

// Mobile uses a direct API client (no Next.js proxy layer)
const API_URL = Constants.expoConfig?.extra?.apiUrl ?? "http://localhost:8000";

function getApiClient(token?: string) {
  return createApiClient({
    baseUrl: API_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// ─── Minimal presentational components ───────────────────────────────────────

function SectionLabel({ children }: { children: string }) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

function EmptyState({
  title,
  description,
  icon,
}: {
  title: string;
  description: string;
  icon: string;
}) {
  return (
    <View style={styles.emptyState}>
      <Text style={styles.emptyIcon}>{icon}</Text>
      <Text style={styles.emptyTitle}>{title}</Text>
      <Text style={styles.emptyDescription}>{description}</Text>
    </View>
  );
}

function UnitCard({
  unitNumber,
  propertyName,
  rentAmount,
  status,
  onPress,
}: {
  unitNumber: string;
  propertyName: string;
  rentAmount: number | string;
  status: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.cardTitle}>
        {propertyName} — Unit {unitNumber}
      </Text>
      <Text style={styles.cardSubtitle}>Rent: {formatKES(rentAmount)}</Text>
      <Text style={styles.cardStatus}>{status}</Text>
    </Pressable>
  );
}

function PaymentCard({
  amount,
  date,
  status,
  onPress,
}: {
  amount: number | string;
  date: string;
  status: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} style={styles.card}>
      <Text style={styles.cardTitle}>{formatKES(amount)}</Text>
      <Text style={styles.cardSubtitle}>Due: {date}</Text>
      <Text style={styles.cardStatus}>{status}</Text>
    </Pressable>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────

export default function TenantDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tenantDashboard"],
    queryFn: async () => {
      // TODO: pass real token from auth storage
      const { data, error } = await getApiClient().GET("/v1/tenant/dashboard");
      if (error) throw new Error("Failed to fetch tenant dashboard");
      return data;
    },
  });

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.greeting}>Karibu, Nicole 👋</Text>
        <Text style={styles.subtitle}>Here is a summary of your tenancy.</Text>
      </View>

      <SectionLabel>Active Lease</SectionLabel>

      {data?.unit ? (
        <UnitCard
          unitNumber={data.unit.number}
          propertyName={data.unit.property_name}
          rentAmount={data.unit.rent_amount}
          status={data.unit.lease_status}
          onPress={() => {
            // TODO: navigate to lease details
          }}
        />
      ) : (
        <EmptyState
          title="No Active Lease"
          description="You are not currently assigned to any property."
          icon="🏠"
        />
      )}

      <SectionLabel>Recent Invoices</SectionLabel>

      {data?.recent_invoice ? (
        <PaymentCard
          amount={data.recent_invoice.amount}
          date={data.recent_invoice.due_date}
          status={data.recent_invoice.status}
          onPress={() => {
            // TODO: open M-Pesa STK Push modal
          }}
        />
      ) : (
        <EmptyState
          title="All caught up!"
          description="You have no pending invoices for this month."
          icon="🎉"
        />
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    padding: 16,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginTop: 4,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#9ca3af",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
    marginTop: 8,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 24,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  emptyIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  emptyDescription: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  cardSubtitle: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
  cardStatus: {
    fontSize: 12,
    fontWeight: "500",
    color: "#374151",
    marginTop: 8,
    textTransform: "capitalize",
  },
});
