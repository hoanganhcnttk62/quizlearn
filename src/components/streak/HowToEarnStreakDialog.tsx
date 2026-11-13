"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Flame, BookOpen, Clock, Target } from "lucide-react";
import { useLanguage } from "@/i18n/LanguageContext";

interface HowToEarnStreakDialogProps {
  children: React.ReactNode;
}

export function HowToEarnStreakDialog({ children }: HowToEarnStreakDialogProps) {
  const { language } = useLanguage();
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flame className="text-orange-500" />
            {language === "vi" ? "Cách duy trì chuỗi Streak" : "How to Earn a Streak"}
          </DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <BookOpen className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium">
                  {language === "vi" ? "Hoàn thành buổi học" : "Complete Study Sessions"}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === "vi"
                    ? "Hoàn thành ít nhất một buổi học mỗi ngày để duy trì streak"
                    : "Finish at least one study session per day to maintain your streak"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium">
                  {language === "vi" ? "Luyện tập hàng ngày" : "Daily Practice"}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === "vi"
                    ? "Luyện tập đều đặn mỗi ngày. Bỏ lỡ 1 ngày chuỗi sẽ bị đặt lại"
                    : "Practice every day to build your streak. Missing a day will reset your streak"}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Target className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <h4 className="font-medium">
                  {language === "vi" ? "Đặt mục tiêu rõ ràng" : "Set Goals"}
                </h4>
                <p className="text-sm text-gray-500">
                  {language === "vi"
                    ? "Đặt mục tiêu học tập hàng ngày để theo dõi tiến độ"
                    : "Set daily study goals to help maintain your streak and track your progress"}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h4 className="font-medium text-orange-800 mb-2">
              {language === "vi" ? "Mẹo nhỏ cho bạn" : "Pro Tips"}
            </h4>
            <ul className="text-sm text-orange-700 space-y-2">
              {language === "vi" ? (
                <>
                  <li>• Học vào một khung giờ cố định trong ngày để tạo thói quen</li>
                  <li>• Bật thông báo nhắc nhở để không quên giờ học</li>
                  <li>• Đặt mục tiêu từ nhỏ đến lớn dần theo từng tuần</li>
                </>
              ) : (
                <>
                  <li>• Study at the same time each day to build a habit</li>
                  <li>• Set reminders to help you remember to study</li>
                  <li>• Start with small goals and gradually increase them</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </DialogContent>
      
    </Dialog>
  );
} 