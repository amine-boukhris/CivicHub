'use client'

import Link from "next/link";
import { motion } from "motion/react";
import { MapPin } from "lucide-react";

export default function AppLogo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <motion.div
        whileHover={{ scale: 1.05, rotate: 5 }}
        transition={{ type: "spring", stiffness: 400 }}
        className="rounded flex items-center justify-center"
      >
        <MapPin className="size-6 text-black" />
      </motion.div>
      <h1 className="text-xl font-semibold text-foreground">CivicHub</h1>
    </Link>
  );
}
