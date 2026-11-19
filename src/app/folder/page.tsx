"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Folder as FolderIcon, MoreHorizontal, Globe, Lock, Pencil, Trash2 } from "lucide-react";
import Protected from "@/hooks/useProtected";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  useCreateFolderMutation,
  useUpdateFolderMutation,
  useDeleteFolderMutation,
  useGetFoldersByUserIdQuery,
} from "../../../redux/features/folders/foldersApi";
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/i18n/LanguageContext";
import { toast } from "sonner";

interface FolderItem {
  id: string;
  name: string;
  description?: string;
  isPublic?: boolean;
  totalSets: number;
}

export default function FolderPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [folders, setFolders] = useState<FolderItem[]>([]);
  const { data } = useGetFoldersByUserIdQuery({});
  const [createFolder] = useCreateFolderMutation();
  const [updateFolder, { isLoading: isUpdating }] = useUpdateFolderMutation();
  const [deleteFolder] = useDeleteFolderMutation();

  // Edit folder dialog state
  const [editingFolder, setEditingFolder] = useState<FolderItem | null>(null);
  const [editName, setEditName] = useState("");
  const [editIsPublic, setEditIsPublic] = useState(true);

  useEffect(() => {
    if (data?.folders) {
      setFolders(data.folders);
    }
  }, [data]);

  const handleCreateFolder = async (name: string, isPublic: boolean) => {
    try {
      await createFolder({ name, isPublic }).unwrap();
      toast.success(language === "vi" ? "Tạo thư mục thành công!" : "Folder created!");
    } catch (err: any) {
      toast.error(err?.data?.message || t("common.error"));
    }
  };

  const openEditDialog = (folder: FolderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFolder(folder);
    setEditName(folder.name);
    setEditIsPublic(folder.isPublic ?? false);
  };

  const handleSaveEdit = async () => {
    if (!editingFolder || !editName.trim()) {
      toast.error(language === "vi" ? "Tên thư mục không được để trống" : "Folder name cannot be empty");
      return;
    }
    try {
      await updateFolder({
        id: editingFolder.id,
        name: editName.trim(),
        isPublic: editIsPublic,
      }).unwrap();
      toast.success(language === "vi" ? "Đã cập nhật thư mục!" : "Folder updated!");
      setEditingFolder(null);
    } catch (err: any) {
      toast.error(err?.data?.message || t("common.error"));
    }
  };

  const handleDeleteFolder = async (folder: FolderItem, e: React.MouseEvent) => {
    e.stopPropagation();
    const ok = window.confirm(
      language === "vi"
        ? `Bạn có chắc muốn xóa thư mục "${folder.name}" không?`
        : `Are you sure you want to delete folder "${folder.name}"?`
    );
    if (!ok) return;

    try {
      await deleteFolder(folder.id).unwrap();
      toast.success(language === "vi" ? "Đã xóa thư mục!" : "Folder deleted!");
    } catch (err: any) {
      toast.error(err?.data?.message || t("common.error"));
    }
  };

  return (
    <Protected>
      <PageLayout>
        <div className="min-h-screen">
          <div className="max-w-[1400px] mx-auto p-6 sm:p-8 space-y-8">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b-2 border-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl border-2 border-border bg-neo-orange text-neo-ink shadow-neo-xs flex items-center justify-center">
                  <FolderIcon className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h1 className="text-3xl font-black text-foreground">
                  {t("folder.title")}
                </h1>
              </div>
              <CreateFolderDialog onCreateFolder={handleCreateFolder} />
            </div>

            {/* Folders Grid */}
            {folders.length === 0 ? (
              <Card className="p-10 text-center font-bold text-muted-foreground">
                {t("folder.noFolders")}
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {folders.map((folder) => (
                  <Card
                    key={folder.id}
                    interactive
                    className="p-5 group"
                    onClick={() => router.push(`/folder/${folder.id}`)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div className="w-11 h-11 rounded-xl border-2 border-border bg-neo-yellow text-neo-ink shadow-neo-xs flex items-center justify-center flex-shrink-0">
                          <FolderIcon className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="font-extrabold text-lg text-card-foreground truncate">
                            {folder.name}
                          </h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className="text-xs font-bold text-muted-foreground">
                              {t("folder.setsCount", { count: folder?.totalSets || 0 })}
                            </span>
                            <Badge variant={folder.isPublic ? "blue" : "neutral"} className="text-[10px] px-2 py-0">
                              {folder.isPublic ? (
                                <>
                                  <Globe className="w-3 h-3" /> {t("common.public")}
                                </>
                              ) : (
                                <>
                                  <Lock className="w-3 h-3" /> {t("common.private")}
                                </>
                              )}
                            </Badge>
                          </div>
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="outline" size="icon" className="h-8 w-8 flex-shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={(e) => openEditDialog(folder, e)}>
                            <Pencil className="w-4 h-4 mr-2" />
                            {language === "vi" ? "Sửa tên & Quyền riêng tư" : "Edit Name & Privacy"}
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={(e) => handleDeleteFolder(folder, e)}
                            className="text-destructive focus:bg-neo-coral focus:text-neo-ink"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("common.delete")}
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit Folder Dialog */}
        <Dialog open={!!editingFolder} onOpenChange={(open) => !open && setEditingFolder(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {language === "vi" ? "Chỉnh sửa thư mục" : "Edit Folder"}
              </DialogTitle>
              <DialogDescription>
                {language === "vi"
                  ? "Đổi tên thư mục hoặc thay đổi quyền riêng tư (Công khai / Riêng tư)."
                  : "Rename your folder or change its privacy setting."}
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="font-extrabold">{t("folder.folderName")}</Label>
                <Input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder={t("folder.folderName")}
                  onKeyDown={(e) => e.key === "Enter" && handleSaveEdit()}
                />
              </div>

              <div className="space-y-1.5">
                <Label className="font-extrabold">
                  {language === "vi" ? "Quyền riêng tư" : "Visibility"}
                </Label>
                <div className="grid grid-cols-2 gap-2.5">
                  <Button
                    type="button"
                    variant={editIsPublic ? "secondary" : "outline"}
                    onClick={() => setEditIsPublic(true)}
                    className="gap-2"
                  >
                    <Globe className="w-4 h-4 stroke-[2.5]" />
                    {t("common.public")}
                  </Button>
                  <Button
                    type="button"
                    variant={!editIsPublic ? "default" : "outline"}
                    onClick={() => setEditIsPublic(false)}
                    className="gap-2"
                  >
                    <Lock className="w-4 h-4 stroke-[2.5]" />
                    {t("common.private")}
                  </Button>
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingFolder(null)}>
                {t("common.cancel")}
              </Button>
              <Button onClick={handleSaveEdit} disabled={isUpdating}>
                {t("common.save")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </PageLayout>
    </Protected>
  );
}
