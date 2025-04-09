'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { BookOpen, Brain, HeartPulse, UserCircle } from 'lucide-react';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
    CardFooter
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WellnessResource } from "@/app/(dashboard)/shared/types/interfaces";

interface WellnessResourcesCardProps {
    resources: WellnessResource[];
}

const WellnessResourcesCard: FC<WellnessResourcesCardProps> = ({ resources }) => {
    const router = useRouter();

    const getResourceIcon = (iconName: string) => {
        switch (iconName) {
            case 'brain':
                return <Brain className="h-5 w-5 text-blue-700" />;
            case 'heart':
                return <HeartPulse className="h-5 w-5 text-green-700" />;
            case 'user':
                return <UserCircle className="h-5 w-5 text-purple-700" />;
            default:
                return <BookOpen className="h-5 w-5 text-blue-700" />;
        }
    };

    return (
        <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-[#146C94]" />
                    Wellness Resources
                </CardTitle>
                <CardDescription>
                    Helpful materials for your journey
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {resources.map((resource) => (
                        <div
                            key={resource.id}
                            className="p-3 rounded-lg bg-[#F8FBFF] border border-blue-100 flex items-start gap-3"
                        >
                            <div className={`p-2 bg-${resource.iconBgColor}-100 rounded-md flex-shrink-0`}>
                                {getResourceIcon(resource.icon)}
                            </div>
                            <div>
                                <h4 className="font-medium text-sm mb-1">{resource.title}</h4>
                                <p className="text-xs text-gray-600">{resource.description}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
            <CardFooter className="border-t pt-3 pb-3">
                <Button
                    variant="ghost"
                    className="w-full text-[#146C94] hover:bg-[#146C94]/10"
                    onClick={() => router.push("/patient/resources")}
                >
                    Browse All Resources
                </Button>
            </CardFooter>
        </Card>
    );
};

export default WellnessResourcesCard;