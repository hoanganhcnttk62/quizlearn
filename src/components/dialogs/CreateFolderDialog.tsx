"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useLanguage } from "@/i18n/LanguageContext";
import { Plus } from "lucide-react";

interface CreateFolderDialogProps {
  onCreateFolder: (name: string) => void;
}

export function CreateFolderDialog({ onCreateFolder }: CreateFolderDialogProps) {
  const { t, language } = useLanguage();
  const [folderName, setFolderName] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim());
      setFolderName("");
      setIsOpen(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="flex items-center gap-2">
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>{t("folder.createFolder")}</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("folder.createFolder")}</DialogTitle>
          <DialogDescription>
            {language === "vi"
              ? "Nhập tên cho thư mục học tập mới của bạn."
              : "Enter a name for your new study folder."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <Input
            placeholder={t("folder.folderName")}
            value={folderName}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFolderName(e.target.value)}
            onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
              if (e.key === "Enter") {
                handleCreate();
              }
            }}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            {t("common.cancel")}
          </Button>
          <Button onClick={handleCreate}>{t("common.create")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
