'use client';

import { FC } from 'react';
import { CheckCircle2, Plus, FileText, MessageSquare, Users } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QuickActions: FC = () => {
    return (
        <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                    <CheckCircle2 className='h-5 w-5 text-[#146C94]' />
                    Quick Actions
                </CardTitle>
                <CardDescription>
                    Common tasks and shortcuts
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                <Button className="w-full bg-[#146C94] hover:bg-[#146C94]/90">
                    <Plus className="mr-2 h-4 w-4" />
                    Schedule New Session
                </Button>

                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                    <FileText className="mr-2 h-4 w-4" />
                    Create New Note
                </Button>

                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Message Patient
                </Button>

                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                    <Users className="mr-2 h-4 w-4" />
                    View Patient List
                </Button>
            </CardContent>
        </Card>
    );
};

export default QuickActions;