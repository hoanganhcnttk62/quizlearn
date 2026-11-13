"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSelector } from "react-redux";
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
  ShieldAlert,
  Search,
  Trash2,
  Lock,
  Unlock,
  TrendingUp,
  CheckCircle,
  XCircle,
  RefreshCw,
  ExternalLink,
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
import Image from "next/image";

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
          <ShieldAlert className="w-16 h-16 text-red-500 mb-4 animate-bounce" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            Truy Cập Bị Giới Hạn
          </h1>
          <p className="text-gray-500 max-w-md mt-2 mb-6">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-200 dark:border-gray-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 text-xs px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                Admin Portal
              </span>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Bảng Quản Trị Hệ Thống
              </h1>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Quản lý toàn bộ người dùng, bộ flashcard, thư mục và thống kê của QuizLearn
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={() => {
                refetchStats();
                refetchUsers();
                refetchSets();
                refetchFolders();
                toast.info("Đã làm mới dữ liệu");
              }}
            >
              <RefreshCw className="w-4 h-4" />
              Làm Mới
            </Button>
          </div>
        </div>

        {/* Tab Navigation */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
            <TabsTrigger value="overview" className="gap-2 font-medium">
              <TrendingUp className="w-4 h-4" />
              Tổng Quan
            </TabsTrigger>
            <TabsTrigger value="users" className="gap-2 font-medium">
              <Users className="w-4 h-4" />
              Người Dùng ({stats?.totalUsers ?? "..."})
            </TabsTrigger>
            <TabsTrigger value="sets" className="gap-2 font-medium">
              <Layers className="w-4 h-4" />
              Bộ Thẻ ({stats?.totalSets ?? "..."})
            </TabsTrigger>
            <TabsTrigger value="folders" className="gap-2 font-medium">
              <Folder className="w-4 h-4" />
              Thư Mục ({stats?.totalFolders ?? "..."})
            </TabsTrigger>
          </TabsList>

          {/* TAB 1: OVERVIEW */}
          <TabsContent value="overview" className="space-y-6">
            {/* Stat Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border border-purple-100 dark:border-purple-900/40 bg-gradient-to-br from-white to-purple-50/30 dark:from-gray-900 dark:to-purple-950/20 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Tổng Người Dùng
                  </CardTitle>
                  <div className="w-9 h-9 rounded-xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center text-purple-600">
                    <Users className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {isStatsLoading ? "..." : stats?.totalUsers}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Đã đăng ký tài khoản</p>
                </CardContent>
              </Card>

              <Card className="border border-blue-100 dark:border-blue-900/40 bg-gradient-to-br from-white to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Tổng Bộ Thẻ (Sets)
                  </CardTitle>
                  <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center text-blue-600">
                    <Layers className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {isStatsLoading ? "..." : stats?.totalSets}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Bộ học tập đang lưu hành</p>
                </CardContent>
              </Card>

              <Card className="border border-emerald-100 dark:border-emerald-900/40 bg-gradient-to-br from-white to-emerald-50/30 dark:from-gray-900 dark:to-emerald-950/20 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Tổng Thẻ (Cards)
                  </CardTitle>
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center text-emerald-600">
                    <BookOpen className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {isStatsLoading ? "..." : stats?.totalCards}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Thẻ câu hỏi và thuật ngữ</p>
                </CardContent>
              </Card>

              <Card className="border border-amber-100 dark:border-amber-900/40 bg-gradient-to-br from-white to-amber-50/30 dark:from-gray-900 dark:to-amber-950/20 shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Tổng Thư Mục
                  </CardTitle>
                  <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600">
                    <Folder className="w-5 h-5" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-extrabold text-gray-900 dark:text-gray-100">
                    {isStatsLoading ? "..." : stats?.totalFolders}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Thư mục phân loại bài học</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Items Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Users */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Người Dùng Mới Nhất</CardTitle>
                    <CardDescription>Các tài khoản vừa tham gia</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("users")}>
                    Xem Tất Cả &rarr;
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentUsers?.map((u: any) => (
                      <div
                        key={u.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-xs uppercase">
                            {u.username?.[0] || "U"}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{u.username}</p>
                            <p className="text-xs text-gray-500">{u.email}</p>
                          </div>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            u.statusId === 1
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {u.statusId === 1 ? "Active" : "Locked"}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Recent Sets */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle className="text-base font-semibold">Bộ Thẻ Mới Tạo</CardTitle>
                    <CardDescription>Các bộ flashcard vừa được thêm</CardDescription>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("sets")}>
                    Xem Tất Cả &rarr;
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {stats?.recentSets?.map((s: any) => (
                      <div
                        key={s.id}
                        className="flex items-center justify-between p-2.5 rounded-lg border border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-semibold">{s.title}</p>
                          <p className="text-xs text-gray-500">
                            Bởi: {s.user?.username || "Ẩn danh"}
                          </p>
                        </div>
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            s.isPublic
                              ? "bg-blue-100 text-blue-700"
                              : "bg-gray-100 text-gray-600"
                          }`}
                        >
                          {s.isPublic ? "Công Khai" : "Riêng Tư"}
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
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Danh Sách Người Dùng</CardTitle>
                  <CardDescription>
                    Quản lý thông tin, phân quyền và khóa/mở tài khoản
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm theo username, email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 font-semibold border-b">
                      <tr>
                        <th className="p-3">Người Dùng</th>
                        <th className="p-3">Vai Trò</th>
                        <th className="p-3">Cấp Độ / Điểm</th>
                        <th className="p-3">Streak</th>
                        <th className="p-3">Trạng Thái</th>
                        <th className="p-3 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {isUsersLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            Đang tải danh sách người dùng...
                          </td>
                        </tr>
                      ) : usersData?.users?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            Không tìm thấy người dùng nào.
                          </td>
                        </tr>
                      ) : (
                        usersData?.users?.map((u: any) => (
                          <tr key={u.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                            <td className="p-3 flex items-center gap-3">
                              <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
                                {u.username?.[0]?.toUpperCase() || "U"}
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900 dark:text-gray-100">
                                  {u.username}
                                </p>
                                <p className="text-xs text-gray-500">{u.email}</p>
                              </div>
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                                  u.role?.name === "Admin"
                                    ? "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300"
                                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {u.role?.name || "User"}
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-medium text-gray-700 dark:text-gray-300">
                                Lv.{u.level || 1}
                              </span>
                              <span className="text-xs text-gray-500 ml-1">
                                ({u.experiencePoints || 0} XP)
                              </span>
                            </td>
                            <td className="p-3">
                              <span className="font-semibold text-orange-600">
                                🔥 {u.currentStreak || 0} ngày
                              </span>
                            </td>
                            <td className="p-3">
                              <span
                                className={`inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                  u.statusId === 1
                                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                                    : "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-300"
                                }`}
                              >
                                {u.statusId === 1 ? (
                                  <>
                                    <CheckCircle className="w-3 h-3" /> Hoạt động
                                  </>
                                ) : (
                                  <>
                                    <XCircle className="w-3 h-3" /> Đã khóa
                                  </>
                                )}
                              </span>
                            </td>
                            <td className="p-3 text-right">
                              {u.role?.name !== "Admin" && (
                                <Button
                                  variant={u.statusId === 1 ? "destructive" : "outline"}
                                  size="sm"
                                  className="h-8 gap-1"
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
            <Card>
              <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <CardTitle>Quản Lý Bộ Thẻ Flashcard</CardTitle>
                  <CardDescription>
                    Xem tất cả các bộ học tập trên hệ thống và xóa các bộ thẻ vi phạm
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <Input
                    placeholder="Tìm theo tiêu đề bộ thẻ..."
                    value={setSearch}
                    onChange={(e) => setSetSearch(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 font-semibold border-b">
                      <tr>
                        <th className="p-3">Bộ Thẻ</th>
                        <th className="p-3">Tác Giả</th>
                        <th className="p-3">Số Lượng Thẻ</th>
                        <th className="p-3">Quyền Xem</th>
                        <th className="p-3">Ngày Tạo</th>
                        <th className="p-3 text-right">Hành Động</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {isSetsLoading ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            Đang tải danh sách bộ thẻ...
                          </td>
                        </tr>
                      ) : setsData?.sets?.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-8 text-gray-500">
                            Không tìm thấy bộ thẻ nào.
                          </td>
                        </tr>
                      ) : (
                        setsData?.sets?.map((s: any) => (
                          <tr key={s.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                            <td className="p-3">
                              <p className="font-semibold text-gray-900 dark:text-gray-100">
                                {s.title}
                              </p>
                              {s.description && (
                                <p className="text-xs text-gray-500 line-clamp-1 max-w-xs">
                                  {s.description}
                                </p>
                              )}
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs">
                                  {s.user?.username?.[0]?.toUpperCase() || "A"}
                                </div>
                                <span className="font-medium text-xs">
                                  {s.user?.username || "Không rõ"}
                                </span>
                              </div>
                            </td>
                            <td className="p-3">
                              <span className="font-bold text-purple-600">
                                {s.cardCount}
                              </span>{" "}
                              thẻ
                            </td>
                            <td className="p-3">
                              <span
                                className={`text-xs px-2.5 py-0.5 rounded-full font-medium ${
                                  s.isPublic
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300"
                                    : "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300"
                                }`}
                              >
                                {s.isPublic ? "Công Khai" : "Riêng Tư"}
                              </span>
                            </td>
                            <td className="p-3 text-xs text-gray-500">
                              {new Date(s.createdAt).toLocaleDateString("vi-VN")}
                            </td>
                            <td className="p-3 text-right">
                              <Button
                                variant="destructive"
                                size="sm"
                                className="h-8 gap-1"
                                onClick={() => handleDeleteSet(s.id, s.title)}
                                disabled={isDeletingSet}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Xóa
                              </Button>
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
            <Card>
              <CardHeader>
                <CardTitle>Quản Lý Thư Mục Học Tập</CardTitle>
                <CardDescription>
                  Các thư mục phân loại bài học do người dùng tạo
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 dark:bg-gray-800/60 text-gray-600 dark:text-gray-400 font-semibold border-b">
                      <tr>
                        <th className="p-3">Tên Thư Mục</th>
                        <th className="p-3">Người Sở Hữu</th>
                        <th className="p-3">Ngày Tạo</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      {isFoldersLoading ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8 text-gray-500">
                            Đang tải thư mục...
                          </td>
                        </tr>
                      ) : foldersData?.folders?.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="text-center py-8 text-gray-500">
                            Chưa có thư mục nào.
                          </td>
                        </tr>
                      ) : (
                        foldersData?.folders?.map((f: any) => (
                          <tr key={f.id} className="hover:bg-gray-50/60 dark:hover:bg-gray-800/40">
                            <td className="p-3 flex items-center gap-2">
                              <Folder className="w-4 h-4 text-amber-500" />
                              <span className="font-semibold text-gray-900 dark:text-gray-100">
                                {f.title}
                              </span>
                            </td>
                            <td className="p-3 text-xs">
                              {f.user?.username || f.user?.email || "Không rõ"}
                            </td>
                            <td className="p-3 text-xs text-gray-500">
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
