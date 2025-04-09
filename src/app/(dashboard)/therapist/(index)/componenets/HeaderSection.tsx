'use client';

import { FC } from 'react';
import Link from 'next/link';
import { Clock } from 'lucide-react';
import { Session } from "@/app/(dashboard)/shared/types/interfaces";

interface TherapistHeaderSection {
    greeting: string;
    therapistLastName: string;
    sessionsCount: number;
    upcomingSession: Session | null;
}

const TherapistHeaderSection: FC<TherapistHeaderSection> = ({
    greeting,
    therapistLastName,
    sessionsCount,
    upcomingSession,
}) => {
    return (
        <div className='mb-6'>
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <h1 className='text-3xl font-bold text-[#146C94]'>
                        {greeting}, Dr. {therapistLastName}!
                    </h1>
                    <p className='text-gray-600 mt-2'>
                        You have {sessionsCount} session{sessionsCount !== 1 && 's'} scheduled for today
                    </p>
                </div>
                {upcomingSession && (
                    <div className="bg-[#146C94]/5 p-4 rounded-lg">
                        <div className="text-sm font-medium text-[#146C94] mb-2">Next Appointment</div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-[#146C94]" />
                            <span>
                                {upcomingSession.sessionDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                            <span>with</span>
                            <span className="font-medium">{upcomingSession.patientName}</span>
                            <Link
                                href={`/rooms/${upcomingSession.id}`}
                                className="ml-2 bg-[#146C94] text-white text-xs px-3 py-1 rounded-md hover:bg-[#146C94]/90"
                            >
                                Join
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TherapistHeaderSection;