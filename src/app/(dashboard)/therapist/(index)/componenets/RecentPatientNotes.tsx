'use client';

import { FC } from 'react';
import { FileText, Plus, ArrowRight } from 'lucide-react';
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
import { PatientNote } from "@/app/(dashboard)/shared/types/interfaces";

interface RecentPatientNotesProps {
    notes: PatientNote[];
}

const RecentPatientNotes: FC<RecentPatientNotesProps> = ({ notes }) => {
    return (
        <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                        <FileText className='h-5 w-5 text-[#146C94]' />
                        Recent Patient Notes
                    </CardTitle>
                    <CardDescription>
                        Your most recent clinical documentation
                    </CardDescription>
                </div>
                <Button variant="outline" size="sm" className="border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                    <Plus className="h-4 w-4 mr-1" />
                    New Note
                </Button>
            </CardHeader>
            <CardContent>
                {notes.length === 0 ? (
                    <p className='text-gray-600'>No recent notes.</p>
                ) : (
                    <div className='space-y-4'>
                        {notes.map((note) => (
                            <div key={note.id} className='p-4 rounded-lg border border-gray-200 hover:shadow-sm transition-shadow'>
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h3 className="font-medium text-gray-900">{note.title}</h3>
                                        <p className="text-sm text-[#146C94]">
                                            Patient: {note.patientName}
                                        </p>
                                    </div>
                                    <Badge variant="outline" className={`
                    ${note.type === 'session' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                            note.type === 'observation' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                                'bg-green-50 text-green-700 border-green-200'}
                  `}>
                                        {note.type.charAt(0).toUpperCase() + note.type.slice(1)}
                                    </Badge>
                                </div>
                                <p className="text-sm text-gray-600 line-clamp-2">{note.content}</p>
                                <div className="flex items-center justify-between mt-3">
                                    <p className="text-xs text-gray-500">{note.date.toLocaleDateString()}</p>
                                    <Button variant="ghost" size="sm" className="text-[#146C94] h-8 px-2">
                                        View Details
                                        <ArrowRight className="h-3 w-3 ml-1" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                    View All Patient Metrics
                </Button>
            </CardFooter>
        </Card>
    );
};

export default RecentPatientNotes;