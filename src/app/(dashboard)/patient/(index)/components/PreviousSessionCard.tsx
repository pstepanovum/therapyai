'use client';

import { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BookOpen, CalendarDays, Clock, UserCircle, ArrowRight } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Session } from "@/app/(dashboard)/shared/types/interfaces";

interface PreviousSessionCardProps {
    lastSession: Session | null;
}

const PreviousSessionCard: FC<PreviousSessionCardProps> = ({ lastSession }) => {
    const router = useRouter();

    return (
        <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <BookOpen className="h-5 w-5 text-[#146C94]" />
                        Previous Session Summary
                    </div>
                    {lastSession && (
                        <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200">
                            Completed
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Recap and insights from your last therapy session
                </CardDescription>
            </CardHeader>
            <CardContent>
                {lastSession ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FBFF] rounded-lg border border-blue-100">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="h-5 w-5 text-[#146C94]" />
                                    <span className="font-medium">{lastSession.therapist}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>{lastSession.sessionDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>{lastSession.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <Link
                                href={`/patient/sessions/${lastSession.id}`}
                                className="flex flex-row items-center bg-[#146C94] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#146C94]/90 transition-all duration-200"
                            >
                                View Session Details
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4 className="text-sm font-medium text-gray-700">Session Summary:</h4>
                            <p className="text-sm text-gray-600">
                                {lastSession.summary || "No summary available for this session."}
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <p className="text-gray-600 text-center">No past sessions available yet.</p>
                        <Button
                            onClick={() => router.push("/patient/schedule")}
                            className="bg-[#146C94] hover:bg-[#146C94]/90"
                        >
                            Schedule First Session
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default PreviousSessionCard;