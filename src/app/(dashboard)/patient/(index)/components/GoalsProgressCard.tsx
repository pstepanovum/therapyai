'use client';

import Link from 'next/link';
import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TherapyGoal } from "@/app/(dashboard)/shared/types/interfaces";

interface GoalsProgressCardProps {
    overallProgress: number;
    goals: TherapyGoal[];
}

const GoalsProgressCard: FC<GoalsProgressCardProps> = ({
    overallProgress,
    goals
}) => {
    const router = useRouter();

    return (
        <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <CheckCircle2 className="h-5 w-5 text-[#146C94]" />
                        Your Therapy Goals
                    </div>
                    {goals.length > 0 && (
                        <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                            In Progress
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Track your progress on current therapy goals
                </CardDescription>
            </CardHeader>
            <CardContent>
                {goals.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FBFF] rounded-lg border border-blue-100">
                            <div className="flex flex-col gap-3 w-full">
                                <div className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <h4 className="font-medium text-gray-700">Overall Progress</h4>
                                        <span className="text-[#146C94] font-medium">{overallProgress}%</span>
                                    </div>
                                    <Progress 
                                        value={overallProgress} 
                                        className="h-2 bg-[#AFD3E2]/30 [&>div]:bg-[#146C94]" 
                                    />
                                </div>

                                <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-700">Current Goals:</h4>
                                    <div className="space-y-1">
                                        {goals.map((goal) => (
                                            <div 
                                                key={goal.id} 
                                                className="flex justify-between items-center text-sm"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div 
                                                        className={`w-2 h-2 rounded-full bg-${goal.color}-500`}
                                                    ></div>
                                                    <span>{goal.title}</span>
                                                </div>
                                                <Badge 
                                                    className={`bg-${goal.color}-100 text-${goal.color}-800`}
                                                >
                                                    {goal.progress}%
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Link
                            href="/patient/goals"
                            className="flex flex-row items-center bg-[#146C94] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#146C94]/90 transition-all duration-200 w-full justify-center"
                        >
                            View All Goals & Progress
                            <ArrowRight className="h-4 w-4 ml-2" />
                        </Link>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <p className="text-gray-600 text-center">No therapy goals have been set yet.</p>
                        <Button
                            onClick={() => router.push("/patient/goals")}
                            className="bg-[#146C94] hover:bg-[#146C94]/90"
                        >
                            Set Your First Goal
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default GoalsProgressCard;