"use client";

import React, { useEffect } from "react";
import { useAuth } from "../auth/AuthProvider";

export default function LogoutPage() {
  const { logout } = useAuth();

  useEffect(() => {
    logout();
  }, [logout]);

  return (
    <div>
      <div>Bezig met uitloggen...</div>
    </div>
  );
}
