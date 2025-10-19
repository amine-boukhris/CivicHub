"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { LogInIcon, LogOutIcon, MapPinIcon, SettingsIcon, UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function LandingPageMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);
      setIsLoading(false);
    };

    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  };

  const topBarVariants = {
    closed: { rotate: 0, translateY: 0 },
    open: { rotate: -45, translateY: 7 },
  };

  const middleBarVariants = {
    closed: { opacity: 1, scale: 1 },
    open: { opacity: 0, scale: 0.3 },
  };

  const bottomBarVariants = {
    closed: { rotate: 0, translateY: 0 },
    open: { rotate: 45, translateY: -7 },
  };

  const menuVariants = {
    closed: {
      height: 0,
      transition: {
        duration: 0.3,
      },
    },
    open: {
      height: "auto",
      transition: {
        duration: 0.3,
      },
    },
  };

  return (
    <div className="w-fit p-2 rounded-[16px] h-fit fixed top-3 right-3 lg:left-3 z-30 bg-white">
      <div className="flex gap-2 flex-row-reverse lg:flex-row">
        <div
          className="bg-cream-lighter hover:bg-bluish-pink p-5 rounded-[18px] aspect-square cursor-pointer transition-colors flex items-center justify-center"
          onClick={() => setIsOpen(!isOpen)}
        >
          <div className="flex flex-col gap-[4px] w-5">
            <motion.div
              className="h-[3px] w-full bg-black rounded-2xl origin-center"
              variants={topBarVariants}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="h-[3px] w-full bg-black rounded-2xl origin-center"
              variants={middleBarVariants}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="h-[3px] w-full bg-black rounded-2xl origin-center"
              variants={bottomBarVariants}
              animate={isOpen ? "open" : "closed"}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
        <div className="rounded-[18px] text-sm bg-black hover:bg-bluish-pink text-white hover:text-black flex items-center justify-center px-6 transition-colors cursor-pointer font-semibold">
          Report
        </div>
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial="closed"
            animate="open"
            exit="closed"
            variants={menuVariants}
            className="overflow-hidden pt-6 -mt-6"
          >
            <ul className="space-y-6 pt-6 pl-1.5">
              {/* <p className="text-neutral-400 text-2xl font-semibold mb-2">Services</p> */}
              <div className="text-black font-medium tracking-wide text-base space-y-2">
                <li className="cursor-pointer transition-colors">
                  <Link href="/profile" className="flex gap-1 items-center">
                    <UserIcon className="mr-2 h-4 w-4" />
                    <span>View Profile</span>
                  </Link>
                </li>
                <li className="cursor-pointer transition-colors">
                  <Link href="/map" className="flex gap-1 items-center">
                    <MapPinIcon className="mr-2 h-4 w-4" />
                    <span>View Map</span>
                  </Link>
                </li>
                <li className="cursor-pointer transition-colors">
                  <Link href="/settings" className="flex gap-1 items-center">
                    <SettingsIcon className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </li>
              </div>
            </ul>
            <div className="mt-6">
              {user ? (
                <button className="rounded-3xl bg-black hover:bg-bluish-pink text-white hover:text-black p-4 cursor-pointer font-semibold w-full transition-colors">
                  <div
                    onClick={handleLogout}
                    className="cursor-pointer text-red-600 focus:text-red-600"
                  >
                    <LogOutIcon className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </div>
                </button>
              ) : (
                <Link href="/auth/login">
                  <button className="rounded-3xl bg-black hover:bg-bluish-pink text-white hover:text-black p-4 cursor-pointer font-semibold w-full transition-colors">
                    <span>Login</span>
                  </button>
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
