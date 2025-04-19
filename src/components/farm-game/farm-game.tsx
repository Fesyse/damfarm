"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, Sky } from "@react-three/drei";
import { AnimatePresence, motion } from "framer-motion";
import {
  Menu,
  X,
  Volume2,
  VolumeX,
  User,
  Coins,
  Sun,
  CircleHelp,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

import { SEASONS } from "@/lib/constants";
import { useGameStore } from "@/lib/stores/game";

import { Fish } from "@/types/fish";
import { Position, InteractionPoint } from "./types";
import { GameWorld } from "./world";
import { Player } from "./player";
import { GreenhouseDialog } from "./dialogs/GreenhouseDialog";
import { FishingDialog } from "./dialogs/FishingDialog";
import { StocksDialog } from "./dialogs/StocksDialog";
import { MailDialog } from "./dialogs/MailDialog";
import { KioskDialog } from "./dialogs/KioskDialog";
import { HouseDialog } from "./dialogs/HouseDialog";
import { BarnDialog } from "./dialogs/BarnDialog";

export function FarmGame() {
  const gameStore = useGameStore((state: any) => state);

  const [showUI, setShowUI] = useState(true);
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [playerPosition, setPlayerPosition] = useState<Position>([0, 0, 0]);
  const [nearInteraction, setNearInteraction] =
    useState<InteractionPoint | null>(null);
  const [showDialog, setShowDialog] = useState(false);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [inventory, setInventory] = useState<Fish[]>([]);
  const { toast } = useToast();
  const [showInstructions, setShowInstructions] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [hasInteracted, setHasInteracted] = useState(false);

  useEffect(() => {
    audioRef.current = new Audio("/audio/01.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.3;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current && hasInteracted) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(() => {});
      }
    }
  }, [isMuted, hasInteracted]);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      e.preventDefault();
      if (nearInteraction) {
        if (
          (e.code === "KeyE" && nearInteraction.key === "E") ||
          (e.code === "KeyM" && nearInteraction.key === "M")
        ) {
          setDialogType(nearInteraction.type);
          setShowDialog(true);
        }
      }

      if (e.code === "KeyM") {
        setDialogType("mail");
        setShowDialog(true);
      }
      if (e.code === "KeyH") {
        setShowInstructions((prev) => !prev);
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [nearInteraction]);

  return (
    <div className="w-full h-screen relative">
      {/* Rest of component remains unchanged */}
    </div>
  );
}
