"use client";

import React, { Suspense } from "react";
import LoginForm from "./_components/LoginForm";

export default function LoginPage() {
  return (
    <React.Suspense fallback={<div>Loading...</div>}>
      <LoginForm />
    </React.Suspense>
  );
}
