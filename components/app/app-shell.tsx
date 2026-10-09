"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { LogoYg } from "@/components/landing/logo-yg";
import { logoutAction } from "@/app/login/actions";
import { LazyEyeProvider, useLazyEye, type LazyEyeProfile } from "@/components/app/lazy-eye-provider";
import { eyeColor, resolveAnaglyphColors } from "@/lib/anaglyph/color";

function ModeToggle() {
  const { lazyEyeEnabled, setLazyEyeEnabled, pending } = useLazyEye();
  return (
    <div className="flex items-center rounded-full bg-white/8 p-1 text-xs font-semibold">
      <button
        type="button"
        disabled={pending}
        onClick={() => setLazyEyeEnabled(false)}
        className={`rounded-full px-3 py-1.5 transition ${
          !lazyEyeEnabled ? "bg-white text-black" : "text-white/65 hover:text-white"
        }`}
      >
        Regular
      </button>
      <button
        type="button"
        disabled={pending}
        onClick={() => setLazyEyeEnabled(true)}
        className={`rounded-full px-3 py-1.5 transition ${
          lazyEyeEnabled ? "bg-[#3d8bff] text-white" : "text-white/65 hover:text-white"
        }`}
      >
        Lazy eye
      </button>
    </div>
  );
}

function GlassesPicker() {
  const { lazyEyeEnabled, profiles, activeProfile, activateProfile, pending } = useLazyEye();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  if (!lazyEyeEnabled || profiles.length === 0) {
    return null;
  }

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        disabled={pending}
        onClick={() => setOpen((value) => !value)}
        className="flex max-w-[9rem] items-center gap-2 rounded-full bg-white/8 px-2.5 py-1.5 text-xs font-semibold text-white/85 hover:bg-white/12"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {activeProfile ? (
          <span className="flex -space-x-1.5">
            <span
              className="size-3.5 rounded-full border border-black/40"
              style={{
                background: eyeColor(
                  resolveAnaglyphColors(
                    {
                      leftHue: activeProfile.leftHue,
                      leftLightness: activeProfile.leftLightness,
                      rightHue: activeProfile.rightHue,
                      rightLightness: activeProfile.rightLightness,
                    },
                    {
                      strongEye: activeProfile.strongEye,
                      strongEyeWeaken: activeProfile.strongEyeWeaken,
                      background: activeProfile.background,
                    },
                  ),
                  "left",
                ),
              }}
            />
            <span
              className="size-3.5 rounded-full border border-black/40"
              style={{
                background: eyeColor(
                  resolveAnaglyphColors(
                    {
                      leftHue: activeProfile.leftHue,
                      leftLightness: activeProfile.leftLightness,
                      rightHue: activeProfile.rightHue,
                      rightLightness: activeProfile.rightLightness,
                    },
                    {
                      strongEye: activeProfile.strongEye,
                      strongEyeWeaken: activeProfile.strongEyeWeaken,
                      background: activeProfile.background,
                    },
                  ),
                  "right",
                ),
              }}
            />
          </span>
        ) : null}
        <span className="truncate">{activeProfile?.name ?? "Glasses"}</span>
      </button>
      {open ? (
        <div
          role="listbox"
          className="absolute right-0 z-20 mt-2 w-56 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] py-1 shadow-xl"
        >
          {profiles.map((profile) => {
            const profileColors = resolveAnaglyphColors(
              {
                leftHue: profile.leftHue,
                leftLightness: profile.leftLightness,
                rightHue: profile.rightHue,
                rightLightness: profile.rightLightness,
              },
              {
                strongEye: profile.strongEye,
                strongEyeWeaken: profile.strongEyeWeaken,
                background: profile.background,
              },
            );
            return (
              <button
                key={profile.id}
                type="button"
                role="option"
                aria-selected={profile.isActive}
                onClick={() => {
                  activateProfile(profile.id);
                  setOpen(false);
                }}
                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-white/8 ${
                  profile.isActive ? "bg-white/6 text-white" : "text-white/80"
                }`}
              >
                <span className="flex -space-x-1.5">
                  <span
                    className="size-3.5 rounded-full border border-black/40"
                    style={{ background: eyeColor(profileColors, "left") }}
                  />
                  <span
                    className="size-3.5 rounded-full border border-black/40"
                    style={{ background: eyeColor(profileColors, "right") }}
                  />
                </span>
                <span className="min-w-0 flex-1 truncate">{profile.name}</span>
                {profile.isActive ? <span className="text-[10px] text-[#7eb6ff]">In use</span> : null}
              </button>
            );
          })}
          <Link
            href="/app/settings?tab=glasses"
            className="block border-t border-white/10 px-3 py-2 text-sm text-white/70 hover:bg-white/8"
            onClick={() => setOpen(false)}
          >
            Manage glasses…
          </Link>
        </div>
      ) : null}
    </div>
  );
}

function ProfileMenu({ email }: { email: string }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const initial = (email[0] || "U").toUpperCase();

  useEffect(() => {
    function onPointerDown(event: MouseEvent) {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <div className="relative" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-sm font-semibold text-white"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        {initial}
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-20 mt-2 w-44 overflow-hidden rounded-xl border border-white/10 bg-[#1a1a1a] py-1 shadow-xl"
        >
          <Link
            href="/app/settings"
            role="menuitem"
            className="block px-3 py-2 text-sm text-white/85 hover:bg-white/8"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="block w-full px-3 py-2 text-left text-sm text-white/85 hover:bg-white/8"
            >
              Sign out
            </button>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function ShellChrome({
  email,
  role,
  children,
}: {
  email: string;
  role?: "admin" | "user";
  children: React.ReactNode;
}) {
  return (
    <div className="learner-app min-h-dvh bg-[#0c0c0c] text-white">
      <header className="border-b border-white/10">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 px-4">
          <nav className="flex items-center gap-6">
            <Link href="/app" className="text-[#7eb6ff]">
              <LogoYg className="h-7 w-auto" title="Home" />
            </Link>
            <Link href="/app" className="text-sm font-medium text-white underline decoration-[#4da3ff] underline-offset-8">
              Home
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <ModeToggle />
            <GlassesPicker />
            {role === "admin" ? (
              <Link href="/admin" className="text-xs text-white/60 hover:text-white">
                Admin
              </Link>
            ) : null}
            <ProfileMenu email={email} />
          </div>
        </div>
      </header>
      <main>{children}</main>
    </div>
  );
}

export function AppShell({
  email,
  role,
  lazyEyeEnabled,
  activeProfile,
  profiles,
  children,
}: {
  email: string;
  role?: "admin" | "user";
  lazyEyeEnabled: boolean;
  activeProfile: LazyEyeProfile | null;
  profiles: LazyEyeProfile[];
  children: React.ReactNode;
}) {
  return (
    <LazyEyeProvider
      lazyEyeEnabled={lazyEyeEnabled}
      activeProfile={activeProfile}
      profiles={profiles}
    >
      <ShellChrome email={email} role={role}>
        {children}
      </ShellChrome>
    </LazyEyeProvider>
  );
}
