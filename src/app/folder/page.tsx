"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector, useDispatch } from "react-redux";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DonutChart } from "@/components/charts/DonutChart";
import { LineChart } from "@/components/charts/LineChart";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { CampaignTable } from "@/components/dashboard/CampaignTable";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Bell, Settings, Folder, MoreHorizontal, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";
import Protected from "@/hooks/useProtected";
import { CreateFolderDialog } from "@/components/dialogs/CreateFolderDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateFolderMutation, useGetFoldersByUserIdQuery } from "../../../redux/features/folders/foldersApi";
import { ThemeToggle } from "@/components/theme-toggle";
import { PageLayout } from "@/components/layout/PageLayout";
import { useLanguage } from "@/i18n/LanguageContext";

interface Folder {
  id: string;
  name: string;
  icon: JSX.Element;
  totalSets:number;
}



const navigationItems = [
  { name: "Dashboard", href: "/dashboard", current: true },
  { name: "Project", href: "/project", current: false },
  { name: "Clients", href: "/clients", current: false },
  { name: "Quotes", href: "/quotes", current: false },
  { name: "Meeting Schedule", href: "/meetings", current: false },
  { name: "Notes", href: "/notes", current: false },
];

export default function FolderPage() {
  const { t, language } = useLanguage();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); 
  const [folders, setFolders] = useState<Folder[]>([]);
  const { user } = useSelector((state: any) => state.auth);
  const { data, isLoading, isError } = useGetFoldersByUserIdQuery({});
  const [createFolder, { isLoading: isCreating }] = useCreateFolderMutation();
  const handleCreateFolder = (name: string) => {
    createFolder({ name });
    const newFolder: Folder = {
      id: (folders.length + 1).toString(),
      name,
      icon: <div className="w-3 h-3 rounded-full bg-blue-500" />,
      totalSets:0
    };
    setFolders([...folders, newFolder]);
  };

  const handleFolderClick = (folderId: string) => {
    router.push(`/folder/${folderId}`);
  };

  const handleCreateSet = () => {
    router.push("/create-set");
  };

  useEffect(() => {
    if (data) {
      setFolders(data.folders);
    }
    // console.log('folders',data);
  }, [data]);
  // console.log(data);

  return (
    <Protected>
      <PageLayout>
        <div className="min-h-screen">
          <div className="max-w-[1400px] mx-auto p-6 sm:p-8 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between pb-5 border-b-2 border-border">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl border-2 border-border bg-neo-orange text-neo-ink shadow-neo-xs flex items-center justify-center">
                  <Folder className="w-6 h-6 stroke-[2.5]" />
                </div>
                <h1 className="text-3xl font-black text-foreground">
                  {t("folder.title")}
                </h1>
              </div>
              <CreateFolderDialog onCreateFolder={handleCreateFolder} />
            </div>

            {/* Folders Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {folders?.map((folder) => (
                <Card
                  key={folder.id}
                  interactive
                  className="p-5 group"
                  onClick={() => handleFolderClick(folder.id)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3.5">
                      <div className="w-11 h-11 rounded-xl border-2 border-border bg-neo-yellow text-neo-ink shadow-neo-xs flex items-center justify-center flex-shrink-0">
                        <Folder className="w-5 h-5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-lg text-card-foreground">
                          {folder.name}
                        </h3>
                        <p className="text-xs font-bold text-muted-foreground">
                          {t("folder.setsCount", { count: folder?.totalSets || 0 })}
                        </p>
                      </div>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 opacity-80 group-hover:opacity-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem>
                          {language === "vi" ? "Đổi tên" : "Rename"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive focus:bg-neo-coral focus:text-neo-ink">
                          {t("common.delete")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </PageLayout>
    </Protected>
  );
}
