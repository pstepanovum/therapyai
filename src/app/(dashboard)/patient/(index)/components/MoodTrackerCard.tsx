/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { HeartPulse, Brain, ArrowRight } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MoodEntry } from "@/app/(dashboard)/shared/types/interfaces";

interface MoodTrackerCardProps {
    moods: MoodEntry[];
    trendDirection: 'improving' | 'steady' | 'declining';
}

const MoodTrackerCard: FC<MoodTrackerCardProps> = ({
    moods,
    trendDirection
}) => {
    const router = useRouter();

    // Function to get status color for mood value
    const getMoodColor = (value: number) => {
        if (value >= 4) return "text-green-500";
        if (value >= 3) return "text-blue-500";
        if (value >= 2) return "text-yellow-500";
        return "text-red-500";
    };

    // Function to get trend badge variant
    const getTrendBadge = () => {
        if (trendDirection === 'improving') return { variant: "success", text: "Improving" };
        if (trendDirection === 'steady') return { variant: "secondary", text: "Steady" };
        return { variant: "destructive", text: "Declining" };
    };

    return (
        <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <HeartPulse className="h-5 w-5 text-[#146C94]" />
                        Mood Tracker
                    </div>
                    {moods.length > 0 && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Tracked
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Your mood patterns over the past week
                </CardDescription>
            </CardHeader>
            <CardContent>
                {moods.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FBFF] rounded-lg border border-blue-100">
                            <div className="flex flex-col gap-3 w-full">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-end px-2">
                                        {moods.map((mood, index) => (
                                            <div key={index} className="flex flex-col items-center space-y-1 -mx-1">
                                                <div className={`text-sm font-medium ${getMoodColor(mood.value)}`}>
                                                    {mood.value}
                                                </div>
                                                <div className={`w-4 h-${mood.value * 4} rounded-t-sm ${mood.value >= 4 ? "bg-green-500" :
                                                        mood.value >= 3 ? "bg-blue-500" :
                                                            mood.value >= 2 ? "bg-yellow-500" : "bg-red-500"
                                                    }`}></div>
                                                <div className="text-xs text-gray-500 -rotate-90 h-6 w-6 flex items-center justify-center">
                                                    {mood.date.getDate()}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex justify-between text-xs text-gray-500 px-2">
                                        <div>Mon</div>
                                        <div>Tue</div>
                                        <div>Wed</div>
                                        <div>Thu</div>
                                        <div>Fri</div>
                                        <div>Sat</div>
                                        <div>Today</div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center text-sm">
                                    <div className="flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-[#146C94]" />
                                        <span className="font-medium">Current trend:</span>
                                    </div>
                                    <Badge 
                                        variant={getTrendBadge().variant as any}
                                        className="capitalize"
                                    >
                                        {getTrendBadge().text}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/patient/mood"
                            className="flex flex-row items-center bg-[#146C94] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#146C94]/90 transition-all duration-200 w-full justify-center"
                        >
                            Log Today&apos;s Mood
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <p className="text-gray-600 text-center">No mood entries recorded yet.</p>
                        <Button
                            onClick={() => router.push("/patient/mood")}
                            className="bg-[#146C94] hover:bg-[#146C94]/90"
                        >
                            Log Your First Mood
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default MoodTrackerCard;