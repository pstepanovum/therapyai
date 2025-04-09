'use client';

import { FC } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Calendar, BookOpen, MessageSquare } from 'lucide-react';
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
import { Notification } from "@/app/(dashboard)/shared/types/interfaces";

interface PatientNotificationsProps {
    notifications: Notification[];
}

const PatientNotifications: FC<PatientNotificationsProps> = ({ notifications }) => {
    const router = useRouter();

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'session':
                return <Calendar className="h-4 w-4 text-blue-500" />;
            case 'journal':
                return <BookOpen className="h-4 w-4 text-green-500" />;
            case 'message':
                return <MessageSquare className="h-4 w-4 text-purple-500" />;
            default:
                return <Bell className="h-4 w-4 text-gray-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Card className="border-[#AFD3E2] bg-white overflow-hidden">
            <div className="h-1"></div>
            <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Bell className="h-5 w-5 text-[#146C94]" />
                        Notifications
                    </div>
                    <Badge className="bg-red-100 text-red-800">
                        {unreadCount} new
                    </Badge>
                </CardTitle>
                <CardDescription>
                    Your latest updates and reminders
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-3 max-h-64 overflow-y-auto">
                    {notifications.length === 0 ? (
                        <p className="text-sm text-gray-600 text-center py-3">No notifications</p>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-blue-50'} border ${notification.read ? 'border-gray-100' : 'border-blue-200'}`}
                            >
                                <div className="flex gap-3">
                                    <div className="flex-shrink-0 mt-1">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-1">
                                            <h4 className="font-medium text-sm">{notification.title}</h4>
                                            <span className="text-xs text-gray-500">
                                                {notification.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{notification.description || notification.message}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
            <CardFooter className="border-t pt-3 pb-3">
                <Button
                    variant="ghost"
                    className="w-full text-[#146C94] hover:bg-[#146C94]/10"
                    onClick={() => router.push("/patient/notifications")}
                >
                    View All Notifications
                </Button>
            </CardFooter>
        </Card>
    );
};

export default PatientNotifications;