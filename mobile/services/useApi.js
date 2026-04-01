import { useMemo } from "react";
import { createApi } from "./api";
import { useAppStore } from "../store/appStore";
import { deleteSecureItem } from "../lib/secureStorage";
import { navigationRef } from "../navigation/navigationRef";

export function useApi() {
  const serverUrl = useAppStore((s) => s.serverUrl);
  return useMemo(
    () =>
      createApi(() => serverUrl, async () => {
        await deleteSecureItem("staff_jwt");
        await deleteSecureItem("staff_user");
        if (navigationRef.isReady()) navigationRef.replace("Login");
      }),
    [serverUrl]
  );
}
