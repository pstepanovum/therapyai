'use client';

import { FC } from 'react';
import { Brain, FileText, Calendar } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const ClinicalResources: FC = () => {
    return (
        <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                    <Brain className='h-5 w-5 text-[#146C94]' />
                    Clinical Resources
                </CardTitle>
                <CardDescription>
                    Therapeutic tools and resources
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                        <div className="p-2 bg-blue-100 rounded-md flex-shrink-0">
                            <FileText className="h-5 w-5 text-blue-700" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm mb-1">Assessment Templates</h4>
                            <p className="text-xs text-gray-600">Standardized assessment tools</p>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                        <div className="p-2 bg-green-100 rounded-md flex-shrink-0">
                            <Brain className="h-5 w-5 text-green-700" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm mb-1">CBT Worksheets</h4>
                            <p className="text-xs text-gray-600">Resources for cognitive therapy</p>
                        </div>
                    </div>

                    <div className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3">
                        <div className="p-2 bg-purple-100 rounded-md flex-shrink-0">
                            <Calendar className="h-5 w-5 text-purple-700" />
                        </div>
                        <div>
                            <h4 className="font-medium text-sm mb-1">Treatment Planners</h4>
                            <p className="text-xs text-gray-600">Care plan templates and goals</p>
                        </div>
                    </div>
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                    Browse Resource Library
                </Button>
            </CardFooter>
        </Card>
    );
};

export default ClinicalResources;