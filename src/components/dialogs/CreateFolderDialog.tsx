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
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/i18n/LanguageContext";
import { Plus, Globe, Lock } from "lucide-react";

interface CreateFolderDialogProps {
  onCreateFolder: (name: string, isPublic: boolean) => void;
}

export function CreateFolderDialog({ onCreateFolder }: CreateFolderDialogProps) {
  const { t, language } = useLanguage();
  const [folderName, setFolderName] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [isOpen, setIsOpen] = useState(false);

  const handleCreate = () => {
    if (folderName.trim()) {
      onCreateFolder(folderName.trim(), isPublic);
      setFolderName("");
      setIsPublic(true);
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
              ? "Nhập tên và chọn chế độ hiển thị cho thư mục học tập mới."
              : "Enter a name and visibility setting for your new study folder."}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 space-y-4">
          <div className="space-y-1.5">
            <Label className="font-extrabold">{t("folder.folderName")}</Label>
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

          <div className="space-y-1.5">
            <Label className="font-extrabold">
              {language === "vi" ? "Quyền riêng tư" : "Visibility"}
            </Label>
            <div className="grid grid-cols-2 gap-2.5">
              <Button
                type="button"
                variant={isPublic ? "secondary" : "outline"}
                onClick={() => setIsPublic(true)}
                className="gap-2"
              >
                <Globe className="w-4 h-4 stroke-[2.5]" />
                {t("common.public")}
              </Button>
              <Button
                type="button"
                variant={!isPublic ? "default" : "outline"}
                onClick={() => setIsPublic(false)}
                className="gap-2"
              >
                <Lock className="w-4 h-4 stroke-[2.5]" />
                {t("common.private")}
              </Button>
            </div>
          </div>
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
