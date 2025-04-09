'use client';

import { FC } from 'react';
import { Users, Calendar, BellRing, ClipboardList } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface QuickStatsProps {
    totalPatients: number;
    totalSessions: number;
    unreadNotifications: number;
    recentNotesCount: number;
}

const QuickStats: FC<QuickStatsProps> = ({
    totalPatients,
    totalSessions,
    unreadNotifications,
    recentNotesCount,
}) => {
    return (
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
                <div className="h-1"></div>
                <CardContent className='pt-6'>
                    <div className='flex flex-col items-center'>
                        <Users className='h-8 w-8 text-[#146C94] mb-2' />
                        <p className='text-2xl font-bold text-[#146C94]'>{totalPatients}</p>
                        <p className='text-sm text-[#146C94]/70'>Total Patients</p>
                    </div>
                </CardContent>
            </Card>

            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
                <div className="h-1"></div>
                <CardContent className='pt-6'>
                    <div className='flex flex-col items-center'>
                        <Calendar className='h-8 w-8 text-[#146C94] mb-2' />
                        <p className='text-2xl font-bold text-[#146C94]'>{totalSessions}</p>
                        <p className='text-sm text-[#146C94]/70'>Today&apos;s Sessions</p>
                    </div>
                </CardContent>
            </Card>

            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
                <div className="h-1"></div>
                <CardContent className='pt-6'>
                    <div className='flex flex-col items-center'>
                        <BellRing className='h-8 w-8 text-[#146C94] mb-2' />
                        <p className='text-2xl font-bold text-[#146C94]'>{unreadNotifications}</p>
                        <p className='text-sm text-[#146C94]/70'>Unread Notifications</p>
                    </div>
                </CardContent>
            </Card>

            <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
                <div className="h-1"></div>
                <CardContent className='pt-6'>
                    <div className='flex flex-col items-center'>
                        <ClipboardList className='h-8 w-8 text-[#146C94] mb-2' />
                        <p className='text-2xl font-bold text-[#146C94]'>{recentNotesCount}</p>
                        <p className='text-sm text-[#146C94]/70'>Recent Notes</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default QuickStats;