import React from "react";
import ProfileForm from "./ProfileForm/ProfileForm";
import Pet from "./Pet/PetStatus";
import Advice from "./Advice/Advice";
import Chart from "./Chart/Chart";
import { getAppSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";


export default async function HomePage({ searchParams }: any) {
  const session = await getAppSession();
  if (!session || !session.user) {
    redirect("/auth/login");
  }

  // データベースからユーザー情報を取得
  const userWithDetails = await prisma.user.findUnique({
    where: {
      id: parseInt(session.user.id, 10),
    },
    include: {
      unlockedTitles: {
        include: {
          title: true,
        },
      },
      selectedTitle: true,
    },
  });

  if (!userWithDetails) {
    redirect("/auth/login");
  }

  // birthプロパティを文字列に変換
  const serializedUser = {
    ...userWithDetails,
    birth: userWithDetails.birth ? userWithDetails.birth.toISOString() : null,
    unlockedTitles: userWithDetails.unlockedTitles.map(ut => ({
      ...ut,
      unlockedAt: ut.unlockedAt.toISOString(),
    })),
  };
  
  return (
    <div className='bg-white'>
      <main className="flex w-full min-h-screen text-center pt-6 ml-20 mr-20 gap-10">
        <div className="flex flex-col w-full max-w-lg gap-8">
          <ProfileForm user={serializedUser} />
        </div>
          {/* 自己分析チャートコンポーネント */}
          <Chart />
        <div className="flex flex-col w-full max-w-lg">
          {/* ペットのステータス表示コンポーネント */}
          <Pet />
          {/* AIからのアドバイス表示コンポーネント */}
          <Advice />
        </div>
      </main>
    </div>
  );
}