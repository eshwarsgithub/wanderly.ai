"use client";

import { useEffect, useState, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Mail, Plus, Trash2, Crown } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  inviteCollaborator,
  loadCollaborators,
  removeCollaborator,
  type CollaboratorRecord,
} from "@/lib/supabase";

interface CollaboratorPanelProps {
  tripId: string;
  isOwner: boolean;
}

export default function CollaboratorPanel({ tripId, isOwner }: CollaboratorPanelProps) {
  const [collaborators, setCollaborators] = useState<CollaboratorRecord[]>([]);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"editor" | "viewer">("editor");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadCollaborators(tripId).then(setCollaborators);
  }, [tripId]);

  function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim()) return;
    startTransition(async () => {
      await inviteCollaborator(tripId, email.trim(), role);
      const updated = await loadCollaborators(tripId);
      setCollaborators(updated);
      setEmail("");
    });
  }

  async function handleRemove(collaboratorId: string) {
    await removeCollaborator(collaboratorId);
    setCollaborators((c) => c.filter((x) => x.id !== collaboratorId));
  }

  return (
    <div className="glass rounded-2xl p-5 space-y-4">
      <h3 className="text-white font-semibold text-sm flex items-center gap-2">
        <Users className="w-4 h-4 text-[#00f5d4]" />
        Collaborators
      </h3>

      {/* Collaborator list */}
      {collaborators.length > 0 && (
        <div className="space-y-2">
          {collaborators.map((c) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center justify-between gap-2"
            >
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-7 h-7 rounded-full bg-[#00f5d4]/20 border border-[#00f5d4]/30 flex items-center justify-center flex-shrink-0">
                  <Mail className="w-3 h-3 text-[#00f5d4]" />
                </div>
                <div className="min-w-0">
                  <p className="text-white/80 text-xs truncate">{c.email}</p>
                  <p className="text-white/30 text-xs capitalize">{c.role}</p>
                </div>
              </div>
              {isOwner && (
                <button
                  onClick={() => handleRemove(c.id)}
                  className="w-6 h-6 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400 hover:bg-red-500/20 transition-colors flex-shrink-0"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {collaborators.length === 0 && (
        <p className="text-white/30 text-xs">No collaborators yet.</p>
      )}

      {/* Invite form (owner only) */}
      {isOwner && (
        <form onSubmit={handleInvite} className="space-y-2">
          <Input
            type="email"
            placeholder="colleague@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus:border-[#00f5d4]/40 h-9 rounded-xl text-xs"
          />
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg overflow-hidden border border-white/10 flex-1">
              {(["editor", "viewer"] as const).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setRole(r)}
                  className="flex-1 py-1.5 text-xs font-medium transition-all capitalize"
                  style={{
                    background: role === r ? "rgba(0,245,212,0.15)" : "transparent",
                    color: role === r ? "#00f5d4" : "rgba(255,255,255,0.4)",
                  }}
                >
                  {r}
                </button>
              ))}
            </div>
            <motion.button
              type="submit"
              disabled={isPending || !email.trim()}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-medium text-[#0a0a0a] disabled:opacity-40"
              style={{ background: "linear-gradient(135deg, #00f5d4, #00c4aa)" }}
            >
              <Plus className="w-3 h-3" />
              Invite
            </motion.button>
          </div>
        </form>
      )}

      {!isOwner && (
        <div className="flex items-center gap-1.5 text-white/30 text-xs">
          <Crown className="w-3 h-3" />
          Only the trip owner can invite collaborators
        </div>
      )}

      <AnimatePresence>
        {isPending && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-[#00f5d4]/60 text-xs"
          >
            Sending invite...
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
