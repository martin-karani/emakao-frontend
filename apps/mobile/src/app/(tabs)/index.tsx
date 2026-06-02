import React from "react";
import { ScrollView, View, Text, RefreshControl } from "react-native";
import { UnitCard, EmptyState, PaymentCard } from "@emakao/ui-native";
import { useQuery } from "@tanstack/react-query";
import { formatKES } from "@emakao/shared";
import { getApiClient } from "@/lib/api-client";

export default function TenantDashboard() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ["tenantDashboard"],
    queryFn: async () => {
      const { data, error } = await getApiClient().GET("/v1/tenant/dashboard");
      if (error) throw new Error("Failed to fetch tenant dashboard");
      return data;
    },
  });

  return (
    <ScrollView
      className="flex-1 bg-gray-50 p-4"
      refreshControl={
        <RefreshControl refreshing={isLoading} onRefresh={refetch} />
      }
    >
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-900">
          Karibu, Nicole 👋
        </Text>
        <Text className="text-gray-500 mt-1">
          Here is a summary of your tenancy.
        </Text>
      </View>

      <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
        Active Lease
      </Text>

      {data?.unit ? (
        <UnitCard
          unitNumber={data.unit.number}
          propertyName={data.unit.property_name}
          rentAmount={data.unit.rent_amount}
          status={data.unit.lease_status}
          onPress={() => console.log("Navigate to lease details")}
        />
      ) : (
        <EmptyState
          title="No Active Lease"
          description="You are not currently assigned to any property."
          icon="🏠"
        />
      )}

      <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mt-6 mb-3">
        Recent Invoices
      </Text>

      {data?.recent_invoice ? (
        <PaymentCard
          amount={data.recent_invoice.amount}
          date={data.recent_invoice.due_date}
          status={data.recent_invoice.status}
          method="M-PESA"
          onPress={() => console.log("Open M-Pesa STK Push modal")}
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
