"use client";

import { Button } from "@/components/ui/button";
import { Github } from "lucide-react";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useLanguage } from "@/i18n/LanguageContext";

export function SocialLogin() {
  const { t } = useLanguage();

  return (
    <div className="flex flex-col gap-4 mt-4 w-full">
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t-2 border-border/30" />
        </div>
        <div className="relative flex justify-center text-xs font-extrabold uppercase">
          <span className="bg-card px-2.5 text-muted-foreground">
            {t("auth.orContinueWith")}
          </span>
        </div>
      </div>
      <div className="flex gap-3">
        <Button
          type="button"
          onClick={() => signIn("google")}
          variant="outline"
          className="w-full flex items-center justify-center"
        >
          <Image
            src="/google.svg"
            alt="Google"
            width={18}
            height={18}
            className="mr-2"
          />
          Google
        </Button>
        <Button
          type="button"
          onClick={() => signIn("github")}
          variant="outline"
          className="w-full flex items-center justify-center"
        >
          <Github className="mr-2 h-4 w-4 stroke-[2.5]" />
          GitHub
        </Button>
      </div>
    </div>
  );
}
