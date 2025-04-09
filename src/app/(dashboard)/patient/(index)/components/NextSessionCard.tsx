'use client';

import { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, UserCircle, CalendarDays, ArrowRight } from 'lucide-react';
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

interface NextSessionCardProps {
    nextSession: Session | null;
}

const NextSessionCard: FC<NextSessionCardProps> = ({ nextSession }) => {
    const router = useRouter();

    return (
        <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between gap-2">
                    <div className="flex flex-row items-center gap-2">
                        <Calendar className="h-5 w-5 text-[#146C94]" />
                        Next Therapy Session
                    </div>
                    {nextSession && (
                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                            Upcoming
                        </Badge>
                    )}
                </CardTitle>
                <CardDescription>
                    Your upcoming appointment details
                </CardDescription>
            </CardHeader>
            <CardContent>
                {nextSession ? (
                    <div className="space-y-4">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-[#F8FBFF] rounded-lg border border-blue-100">
                            <div className="flex flex-col gap-1">
                                <div className="flex items-center gap-2">
                                    <UserCircle className="h-5 w-5 text-[#146C94]" />
                                    <span className="font-medium">{nextSession.therapist}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <CalendarDays className="h-4 w-4" />
                                    <span>{nextSession.sessionDate.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-600">
                                    <Clock className="h-4 w-4" />
                                    <span>{nextSession.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                </div>
                            </div>
                            <Link
                                href={`/rooms/${nextSession.id}`}
                                className="flex flex-row items-center bg-[#146C94] text-white px-5 py-3 rounded-md text-sm font-medium hover:bg-[#146C94]/90 transition-all duration-200"
                            >
                                Join Session
                                <ArrowRight className="h-4 w-4 ml-2" />
                            </Link>
                        </div>
                        <div className="flex flex-col gap-2">
                            <h4 className="text-sm font-medium text-gray-700">Preparation Tips:</h4>
                            <ul className="text-sm text-gray-600 space-y-1 list-inside list-disc">
                                <li>Find a quiet, private space for your session</li>
                                <li>Test your camera and microphone beforehand</li>
                                <li>Consider topics you&apos;d like to discuss today</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <p className="text-gray-600 text-center">You don&apos;t have any upcoming sessions scheduled.</p>
                        <Button
                            onClick={() => router.push("/patient/schedule")}
                            className="bg-[#146C94] hover:bg-[#146C94]/90"
                        >
                            Schedule Now
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default NextSessionCard;