'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Calendar, Clock, Plus, ArrowRight, UserCircle } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Session } from "@/app/(dashboard)/shared/types/interfaces";

interface TodayScheduleProps {
    sessions: Session[];
}

const TodaySchedule: FC<TodayScheduleProps> = ({ sessions }) => {
    return (
        <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                    <Calendar className='h-5 w-5 text-[#146C94]' />
                    Today&apos;s Schedule
                </CardTitle>
                <CardDescription>
                    Your appointments for {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                </CardDescription>
            </CardHeader>
            <CardContent>
                {sessions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-6 space-y-3">
                        <p className='text-gray-600'>No sessions scheduled for today.</p>
                        <Button
                            variant="outline"
                            className="border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Schedule New Session
                        </Button>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {sessions.map((session) => (
                            <div key={session.id} className='flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 rounded-lg border border-gray-100 hover:bg-gray-50 hover:shadow-sm transition-all'>
                                <div className='flex items-center gap-3 mb-3 sm:mb-0'>
                                    <div className="relative">
                                        <UserCircle className='h-10 w-10 text-[#146C94]' />
                                        <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${session.status === 'scheduled' ? 'bg-green-500' :
                                            session.status === 'completed' ? 'bg-blue-500' :
                                                session.status === 'cancelled' ? 'bg-red-500' : 'bg-gray-500'
                                            }`}></div>
                                    </div>
                                    <div>
                                        <p className='font-medium'>{session.patientName}</p>
                                        <div className='flex items-center gap-2 text-sm text-gray-600'>
                                            <Clock className='h-3 w-3' />
                                            <span>{session.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            <span>•</span>
                                            <Badge className={`
                        ${session.status === 'scheduled' ? 'bg-green-100 text-green-800' :
                                                    session.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                                        session.status === 'cancelled' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'}
                      `}>
                                                {session.status.charAt(0).toUpperCase() + session.status.slice(1)}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-col xs:flex-row gap-2">
                                    <Link
                                        href={`/patients/${session.patientId}`}
                                        className='flex flex-row items-center bg-white border border-[#146C94] text-[#146C94] px-3 py-2 rounded-md text-sm font-medium hover:bg-[#146C94]/5 transition-all duration-200'
                                    >
                                        Patient Profile
                                    </Link>
                                    <Link
                                        href={`/rooms/${session.id}`}
                                        className='flex flex-row items-center bg-[#146C94] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#146C94]/90 transition-all duration-200 shadow-sm'
                                    >
                                        Join Room
                                        <ArrowRight className='h-4 w-4 ml-2' />
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button
                    variant="outline"
                    className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10"
                >
                    View Full Calendar
                </Button>
            </CardFooter>
        </Card>
    );
};

export default TodaySchedule;