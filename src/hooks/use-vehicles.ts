import { useQuery } from "@tanstack/react-query";
import { mockVehicles, type Vehicle } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

function useVehicles() {
  const { token } = useAuth();

  return useQuery<Vehicle[]>({
    queryKey: ["vehicles"],
    queryFn: async () => {
      try {
        if (!token) {
          return mockVehicles;
        }
        return await apiClient<Vehicle[]>("/vehicles", { token });
      } catch {
        return mockVehicles;
      }
    },
    enabled: true,
  });
}

export { useVehicles };
