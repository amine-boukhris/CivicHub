"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, MapPin, CheckCircle, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { ProfileMenu } from "@/components/profile-menu";
import AppLogo from "@/components/app-logo";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: [0.22, 1, 0.36, 1],
    },
  },
};

const AnimatedText = ({ text, className = "" }: { text: string; className?: string }) => {
  const words = text.split(" ");

  return (
    <motion.div
      className={className}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {words.map((word, i) => (
        <motion.span
          key={i}
          variants={itemVariants}
          style={{ display: "inline-block", marginRight: "0.25em" }}
        >
          {word}
        </motion.span>
      ))}
    </motion.div>
  );
};

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background overflow-hidden">
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="border-b border-border bg-white/80 backdrop-blur-md sticky top-0 z-50"
      >
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <AppLogo />
          <nav className="flex items-center gap-4">
            <Link
              href="/map"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              View Map
            </Link>
            <ProfileMenu />
          </nav>
        </div>
      </motion.header>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 animated-gradient opacity-10" />
        <div className="container mx-auto px-4 max-w-7xl relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <AnimatedText
                  text="Report Local Issues. Track Progress."
                  className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6 text-balance leading-tight"
                />
              </motion.div>
              <motion.p
                variants={fadeInUp}
                initial="hidden"
                animate="visible"
                className="text-lg text-muted-foreground mb-8 max-w-xl leading-relaxed"
              >
                Help improve your community by reporting potholes, broken streetlights, trash, and
                other infrastructure issues. City staff will track and resolve them.
              </motion.p>
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="flex flex-col sm:flex-row gap-4"
              >
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -2, scale: 1.02, boxShadow: "0 10px 28px rgba(46,91,255,0.25)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  style={{ borderRadius: 10 }}
                >
                  <Link href="/report">
                    <Button
                      size="lg"
                      className="bg-[#2E5BFF] hover:bg-indigo-500 text-white px-8 w-full sm:w-auto transition-colors"
                    >
                      Report an Issue
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -2, scale: 1.02, boxShadow: "0 8px 24px rgba(0,0,0,0.12)" }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ type: "spring", stiffness: 320, damping: 20 }}
                  style={{ borderRadius: 10 }}
                >
                  <Link href="/map">
                    <Button
                      size="lg"
                      variant="outline"
                      className="px-8 bg-transparent w-full sm:w-auto"
                    >
                      View All Reports
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/community-hero.jpg"
                  alt="Community members collaborating on civic improvements"
                  width={600}
                  height={400}
                  className="w-full h-auto unselectable"
                  priority
                />
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute inset-0 bg-gradient-to-t from-[#2E5BFF]/20 to-transparent"
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12 text-foreground"
          >
            How It Works
          </motion.h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid md:grid-cols-3 gap-8"
          >
            {[
              {
                icon: AlertCircle,
                color: "#2E5BFF",
                bgColor: "#2E5BFF",
                title: "1. Report",
                description:
                  "Spot a pothole or broken streetlight? Take a photo, add location, and submit a report in seconds.",
              },
              {
                icon: Clock,
                color: "#F59E0B",
                bgColor: "#F59E0B",
                title: "2. Track",
                description:
                  "City staff review your report and update the status as they work to resolve the issue.",
              },
              {
                icon: CheckCircle,
                color: "#10B981",
                bgColor: "#10B981",
                title: "3. Resolved",
                description:
                  "See the issue marked as resolved on the map and know your community is improving.",
              },
            ].map((step, index) => (
              <motion.div key={index} variants={itemVariants}>
                <Card className="border-2 hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="pt-6">
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="w-12 h-12 rounded-full flex items-center justify-center mb-4"
                      style={{ backgroundColor: `${step.bgColor}15` }}
                    >
                      <step.icon className="w-6 h-6" style={{ color: step.color }} />
                    </motion.div>
                    <h4 className="text-xl font-semibold mb-2 text-foreground">{step.title}</h4>
                    <p className="text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 bg-secondary/30 relative overflow-hidden">
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute top-0 right-0 w-96 h-96 bg-[#2E5BFF]/5 rounded-full blur-3xl"
        />
        <div className="container mx-auto px-4 max-w-6xl relative z-10">
          <motion.h3
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl font-bold text-center mb-12 text-foreground"
          >
            What You Can Report
          </motion.h3>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="grid grid-cols-2 md:grid-cols-5 gap-4"
          >
            {[
              { name: "Potholes", icon: "🕳️" },
              { name: "Streetlights", icon: "💡" },
              { name: "Trash", icon: "🗑️" },
              { name: "Graffiti", icon: "🎨" },
              { name: "Other", icon: "📋" },
            ].map((category, index) => (
              <motion.div key={category.name} variants={itemVariants}>
                <Card className="text-center hover:shadow-md transition-all duration-300 hover:-translate-y-1">
                  <CardContent className="pt-6 pb-6">
                    <motion.div
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      transition={{ type: "spring", stiffness: 400 }}
                      className="text-4xl mb-2"
                    >
                      {category.icon}
                    </motion.div>
                    <p className="font-medium text-foreground">{category.name}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className="py-16 relative overflow-hidden">
        <motion.div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, #2e5bff 0%, #4a90e2 25%, #2e5bff 50%, #1e3a8a 75%, #2e5bff 100%)",
            backgroundSize: "400% 400%",
          }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 15, ease: "linear", repeat: Infinity }}
        />
        <div className="container mx-auto px-4 text-center max-w-3xl relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-3xl font-bold mb-4 text-balance text-white">
              Ready to Make a Difference?
            </h3>
            <p className="text-lg mb-8 opacity-90 leading-relaxed text-white">
              Your reports help city staff prioritize and fix issues faster. Every report counts.
            </p>
            <Link href="/report">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-[#2E5BFF] hover:bg-gray-100 px-8"
              >
                Submit Your First Report
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2025 CivicHub. Making communities better, one report at a time.</p>
        </div>
      </footer>
    </div>
  );
}
