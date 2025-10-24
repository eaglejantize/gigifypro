import { useEffect, useState } from "react";

export type MeUser = {
  id: string;
  email: string;
  name: string;
  role: "user" | "worker" | "admin";
} | null;

export function useMe() {
  const [me, setMe] = useState<MeUser | undefined>(undefined);
  
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/me", { credentials: "include" });
        const data = await r.json();
        setMe(data);
      } catch (error) {
        setMe(null);
      }
    })();
  }, []);
  
  return me; // undefined = loading, null = not logged in, object = logged in
}

export default useMe;
