"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
import Link from "next/link";
import { PageLayout } from "@/components/layout/PageLayout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  Layers,
  BookOpen,
  Folder,
  ShieldCheck,
  Search,
  Trash2,
  Lock,
  Unlock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  RefreshCw,
  ExternalLink,
  Eye,
  GraduationCap,
  Sparkles,
} from "lucide-react";
import {
  useGetAdminStatsQuery,
  useGetAdminUsersQuery,
  useToggleUserStatusMutation,
  useGetAdminSetsQuery,
  useDeleteAdminSetMutation,
  useGetAdminFoldersQuery,
} from "../../../redux/features/admin/adminApi";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useSelector((state: any) => state.auth);

  const isAdmin =
    user?.role?.name?.toLowerCase() === "admin" ||
    user?.roleId === "3dd54a71-c0f5-4142-a1ff-ec9b08e91dbb";

  const [activeTab, setActiveTab] = useState("overview");
  const [userSearch, setUserSearch] = useState("");
  const [setSearch, setSetSearch] = useState("");

  // RTK Queries
  const {
    data: statsData,
    isLoading: isStatsLoading,
    refetch: refetchStats,
  } = useGetAdminStatsQuery(undefined, { skip: !isAdmin });

  const {
    data: usersData,
    isLoading: isUsersLoading,
    refetch: refetchUsers,
  } = useGetAdminUsersQuery({ search: userSearch }, { skip: !isAdmin });

  const {
    data: setsData,
    isLoading: isSetsLoading,
    refetch: refetchSets,
  } = useGetAdminSetsQuery({ search: setSearch }, { skip: !isAdmin });

  const {
    data: foldersData,
    isLoading: isFoldersLoading,
    refetch: refetchFolders,
  } = useGetAdminFoldersQuery(undefined, { skip: !isAdmin });

  // Mutations
  const [toggleUserStatus, { isLoading: isToggling }] = useToggleUserStatusMutation();
  const [deleteAdminSet, { isLoading: isDeletingSet }] = useDeleteAdminSetMutation();

  const handleToggleStatus = async (id: string, currentStatus: number) => {
    try {
      await toggleUserStatus(id).unwrap();
      toast.success(
        currentStatus === 1 ? "Đã khóa người dùng thành công" : "Đã mở khóa người dùng thành công"
      );
    } catch (err: any) {
      toast.error(err?.data?.message || "Thao tác thất bại");
    }
  };

  const handleDeleteSet = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc muốn xóa vĩnh viễn bộ thẻ "${title}" và toàn bộ flashcard của nó không?`)) {
      return;
    }
    try {
      await deleteAdminSet(id).unwrap();
      toast.success("Đã xóa bộ thẻ thành công");
    } catch (err: any) {
      toast.error(err?.data?.message || "Xóa bộ thẻ thất bại");
    }
  };

  // Nếu không phải Admin
  if (!isAdmin) {
    return (
      <PageLayout>
        <div className="flex flex-col items-center justify-center min-h-[70vh] p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 dark:bg-rose-950/40 flex items-center justify-center mb-4">
            <ShieldCheck className="w-9 h-9 text-rose-600 dark:text-rose-400" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Truy Cập Bị Giới Hạn
          </h1>
          <p className="text-muted-foreground max-w-md mt-2 mb-6">
            Bạn cần quyền Quản Trị Viên (Admin) để có thể xem và quản lý hệ thống QuizLearn.
          </p>
          <Button onClick={() => router.push("/dashboard")}>
            Quay Về Trang Cá Nhân
          </Button>
        </div>
      </PageLayout>
    );
  }

  const stats = statsData?.stats;

  return (
    <PageLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-border">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-sm">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">
                Quản Trị Hệ Thống
              </h1>
              <span className="bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                Admin Console
              </span>
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              Trung tâm điều hành và giám sát toàn bộ người dùng, bộ thẻ flashcard và dữ liệu học tập
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              variant="outline"
              size="sm"
              className="gap-2 shadow-xs border-border bg-card hover:bg-accent"
              onClick={() => {
                refetchStats();
                refetchUsers();
                refetchSets();
                refetchFolders();
                toast.info("Đã đồng bộ dữ liệu mới nhất");
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Đồng Bộ Dữ Liệu
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-muted/70 p-1 rounded-lg border border-border">
            <TabsTrigger value="overview" className="gap-2 font-medium">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              Tổng Quan
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 font-medium">
              <Users className="w-4 h-4 text-emerald-600" />
              Người Dùng ({stats?.totalUsers ?? "..."})
            </TabsTrigger>
            <TabsTrigger value="sets" className="gap-2 font-medium">
              <Layers className="w-4 h-4 text-indigo-600" />
              Bộ Thẻ Học ({stats?.totalSets ?? "..."})
            </TabsTrigger>
            <TabsTrigger value="folders" className="gap-2 font-medium">
              <Folder className="w-4 h-4 text-amber-600" />
              Thư Mục ({stats?.totalFolders ?? "..."})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-border/80 bg-card shadow-xs hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Người Dùng
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center">
                    <Users className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isStatsLoading ? "..." : stats?.totalUsers}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Tài khoản đã đăng ký</p>
                </CardContent>
              </Card>

              <Card className="border border-border/80 bg-card shadow-xs hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Bộ Thẻ Flashcard
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isStatsLoading ? "..." : stats?.totalSets}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Bộ học tập đang lưu hành</p>
                </CardContent>
              </Card>

              <Card className="border border-border/80 bg-card shadow-xs hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Tổng Thẻ (Cards)
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isStatsLoading ? "..." : stats?.totalCards}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Thuật ngữ & định nghĩa</p>
                </CardContent>
              </Card>

              <Card className="border border-border/80 bg-card shadow-xs hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-xs font-semibold tracking-wider text-muted-foreground uppercase">
                    Thư Mục Học Tập
                  </CardTitle>
                  <div className="w-8 h-8 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
                    <Folder className="w-4 h-4" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {isStatsLoading ? "..." : stats?.totalFolders}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Thư mục phân loại chủ đề</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Items Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card className="border border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-semibold">Tài Khoản Mới Nhất</CardTitle>
                    <CardDescription>Người dùng vừa gia nhập nền tảng</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => setActiveTab("users")}
                  >
                    Xem Chi Tiết &rarr;
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {stats?.recentUsers?.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase">
                            {u.username?.[0] || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-foreground">{u.username}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                            u.statusId === 1
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                              : "bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                          }`}
                        >
                          {u.statusId === 1 ? "Hoạt động" : "Đã khóa"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sets */}
              <Card className="border border-border/80 shadow-xs">
                <CardHeader className="flex flex-row items-center justify-between pb-3">
                  <div>
                    <CardTitle className="text-base font-semibold">Bộ Thẻ Mới Cập Nhật</CardTitle>
                    <CardDescription>Bấm vào tiêu đề để mở học trực tiếp</CardDescription>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-xs text-blue-600 hover:text-blue-700"
                    onClick={() => setActiveTab("sets")}
                  >
                    Xem Chi Tiết &rarr;
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2.5">
                    {stats?.recentSets?.map((s: any) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0 pr-3">
                          <Link
                            href={`/set/${s.id}`}
                            target="_blank"
                            className="text-sm font-semibold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1.5 truncate group"
                            title="Mở bộ thẻ này"
                          >
                            <span className="truncate">{s.title}</span>
                            <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 flex-shrink-0" />
                          </Link>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            Tác giả: {s.user?.username || "Ẩn danh"}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap ${
                            s.isPublic
                              ? "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                              : "bg-muted text-muted-foreground border border-border"
                          }`}
                        >
                          {s.isPublic ? "Công khai" : "Riêng tư"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* TAB 2: USERS MANAGEMENT */}
          <TabsContent value="users" className="space-y-4">
            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-lg">Danh Sách Người Dùng</CardTitle>
                  <CardDescription>
                    Xem thông tin tài khoản, phân quyền và khóa/mở quyền truy cập
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo username, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9 bg-card"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/60 text-muted-foreground font-semibold border-y border-border">
                      <tr>
                        <th className="p-3 pl-6">Người Dùng</th>
                        <th className="p-3">Vai Trò</th>
                        <th className="p-3">Tiến Độ</th>
                        <th className="p-3">Chuỗi Streak</th>
                        <th className="p-3">Trạng Thái</th>
                        <th className="p-3 pr-6 text-right">Thao Tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {isUsersLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-muted-foreground">
                            Đang tải danh sách người dùng...
                          </td>
                        </tr>
                      ) : usersData?.users?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-muted-foreground">
                            Không tìm thấy người dùng nào.
                          </td>
                        </tr>
                      ) : (
                        usersData?.users?.map((u: any) => (
                          <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3 pl-6 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                {u.username?.[0] || "U"}
                              </div>
                              <div className="min-w-0">
                                <p className="font-semibold text-foreground truncate">
                                  {u.username}
                                </p>
                                <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-semibold border ${
                                  u.role?.name === "Admin"
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                                    : "bg-muted text-muted-foreground border-border"
                                }`}
                              >
                                {u.role?.name || "User"}
                              </span>
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-1.5">
                                <GraduationCap className="w-4 h-4 text-muted-foreground" />
                                <span className="font-medium text-foreground">
                                  Lv.{u.level || 1}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  ({u.experiencePoints || 0} XP)
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-orange-600 dark:text-orange-400">
                                🔥 {u.currentStreak || 0} ngày
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                                  u.statusId === 1
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800"
                                    : "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-300 dark:border-rose-800"
                                }`}
                              >
                                {u.statusId === 1 ? (
                                  <>
                                    <CheckCircle2 className="w-3 h-3" /> Hoạt động
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3" /> Đã khóa
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3 pr-6 text-right">
                              {u.role?.name !== "Admin" && (
                                <Button
                                  variant={u.statusId === 1 ? "outline" : "default"}
                                  size="sm"
                                  className={`h-8 gap-1.5 text-xs ${
                                    u.statusId === 1
                                      ? "text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                                      : "bg-emerald-600 hover:bg-emerald-700 text-white"
                                  }`}
                                  onClick={() => handleToggleStatus(u.id, u.statusId)}
                                  disabled={isToggling}
                                >
                                  {u.statusId === 1 ? (
                                    <>
                                      <Lock className="w-3.5 h-3.5" /> Khóa
                                    </>
                                  ) : (
                                    <>
                                      <Unlock className="w-3.5 h-3.5" /> Mở khóa
                                    </>
                                  )}
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 3: SETS MANAGEMENT */}
          <TabsContent value="sets" className="space-y-4">
            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4">
                <div>
                  <CardTitle className="text-lg">Quản Lý Bộ Thẻ Flashcard</CardTitle>
                  <CardDescription>
                    Toàn bộ thẻ học trên hệ thống — Bấm vào link để xem và kiểm tra nội dung
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tiêu đề bộ thẻ..."
                    value={setSearch}
                    onChange={(e) => setSetSearch(e.target.value)}
                    className="pl-9 bg-card"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/60 text-muted-foreground font-semibold border-y border-border">
                      <tr>
                        <th className="p-3 pl-6">Bộ Thẻ (Đính kèm Link)</th>
                        <th className="p-3">Tác Giả</th>
                        <th className="p-3">Số Thẻ</th>
                        <th className="p-3">Trạng Thái</th>
                        <th className="p-3">Ngày Tạo</th>
                        <th className="p-3 pr-6 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {isSetsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-muted-foreground">
                            Đang tải danh sách bộ thẻ...
                          </td>
                        </tr>
                      ) : setsData?.sets?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-muted-foreground">
                            Không tìm thấy bộ thẻ nào.
                          </td>
                        </tr>
                      ) : (
                        setsData?.sets?.map((s: any) => (
                          <tr key={s.id} className="hover:bg-muted/30 transition-colors">
                            {/* CỘT CÓ LINK TRỰC TIẾP VÀO BỘ THẺ */}
                            <td className="p-3 pl-6">
                              <Link
                                href={`/set/${s.id}`}
                                target="_blank"
                                className="font-semibold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1.5 group"
                              >
                                <span>{s.title}</span>
                                <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                              </Link>
                              {s.description && (
                                <p className="text-xs text-muted-foreground line-clamp-1 max-w-sm mt-0.5">
                                  {s.description}
                                </p>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0">
                                  {s.user?.username?.[0] || "A"}
                                </div>
                                <span className="font-medium text-xs text-foreground">
                                  {s.user?.username || "Không rõ"}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-foreground">
                                {s.cardCount}
                              </span>{" "}
                              <span className="text-xs text-muted-foreground">thẻ</span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${
                                  s.isPublic
                                    ? "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800"
                                    : "bg-muted text-muted-foreground border-border"
                                }`}
                              >
                                {s.isPublic ? "Công khai" : "Riêng tư"}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="p-3 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                {/* Nút xem bộ thẻ */}
                                <Link href={`/set/${s.id}`} target="_blank">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-8 gap-1 text-xs border-border hover:bg-muted text-foreground"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                    Xem
                                  </Button>
                                </Link>

                                {/* Nút xóa bộ thẻ */}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  className="h-8 gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 border-rose-200 dark:border-rose-800"
                                  onClick={() => handleDeleteSet(s.id, s.title)}
                                  disabled={isDeletingSet}
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  Xóa
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TAB 4: FOLDERS MANAGEMENT */}
          <TabsContent value="folders" className="space-y-4">
            <Card className="border border-border/80 shadow-xs">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Quản Lý Thư Mục Học Tập</CardTitle>
                <CardDescription>
                  Các thư mục phân loại bài học do người dùng khởi tạo
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-muted/60 text-muted-foreground font-semibold border-y border-border">
                      <tr>
                        <th className="p-3 pl-6">Tên Thư Mục</th>
                        <th className="p-3">Người Sở Hữu</th>
                        <th className="p-3 pr-6">Ngày Tạo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {isFoldersLoading ? (
                        <tr>
                          <td colSpan={3} className="text-center py-10 text-muted-foreground">
                            Đang tải danh sách thư mục...
                          </td>
                        </tr>
                      ) : foldersData?.folders?.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-10 text-muted-foreground">
                            Chưa có thư mục nào.
                          </td>
                        </tr>
                      ) : (
                        foldersData?.folders?.map((f: any) => (
                          <tr key={f.id} className="hover:bg-muted/30 transition-colors">
                            <td className="p-3 pl-6 flex items-center gap-2.5">
                              <div className="w-7 h-7 rounded-md bg-amber-50 dark:bg-amber-950/50 flex items-center justify-center text-amber-600">
                                <Folder className="w-4 h-4" />
                              </div>
                              <span className="font-semibold text-foreground">
                                {f.title}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-muted-foreground">
                              {f.user?.username || f.user?.email || "Không rõ"}
                            </td>
                            <td className="p-3 pr-6 text-xs text-muted-foreground">
                              {new Date(f.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
