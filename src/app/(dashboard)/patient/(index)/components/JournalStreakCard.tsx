'use client';

import Link from 'next/link';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, ArrowRight } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface JournalStreakCardProps {
    streakDays: number;
}

const JournalStreakCard: FC<JournalStreakCardProps> = ({ streakDays }) => {
    const router = useRouter();

    return (
        <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#146C94]" />
                        Journal Streak
                    </div>
                    {streakDays > 0 && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            Active
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Keep up your journaling habit
                </CardDescription>
            </CardHeader>
            <CardContent>
                {streakDays >= 0 ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FBFF] rounded-lg border border-blue-100">
                            <div className="flex flex-col gap-3 w-full items-center">
                                <div className="relative w-32 h-32 flex items-center justify-center">
                                    <svg className="w-full h-full" viewBox="0 0 36 36">
                                        <path
                                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#E5E7EB"
                                            strokeWidth="3"
                                            strokeDasharray="100, 100"
                                        />
                                        <path
                                            d="M18 2.0845
                            a 15.9155 15.9155 0 0 1 0 31.831
                            a 15.9155 15.9155 0 0 1 0 -31.831"
                                            fill="none"
                                            stroke="#146C94"
                                            strokeWidth="3"
                                            strokeDasharray={`${streakDays * 25}, 100`}
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-3xl font-bold text-[#146C94]">{streakDays}</span>
                                        <span className="text-sm text-gray-600">days</span>
                                    </div>
                                </div>

                                <div className="text-sm text-center text-gray-700">
                                    {streakDays === 0
                                        ? "Start journaling today to build your streak!"
                                        : `You've been journaling for ${streakDays} days in a row. Great job!`}
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/patient/journal"
                            className="flex flex-row items-center bg-[#146C94] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#146C94]/90 transition-all duration-200 w-full justify-center"
                        >
                            Write in Journal
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <p className="text-gray-600 text-center">You haven&apos;t started journaling yet.</p>
                        <Button
                            onClick={() => router.push("/patient/journal")}
                            className="bg-[#146C94] hover:bg-[#146C94]/90"
                        >
                            Start Your First Journal Entry
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default JournalStreakCard;