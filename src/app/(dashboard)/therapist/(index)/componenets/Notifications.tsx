'use client';

import { FC } from 'react';
import { BellRing, MessageSquare, Calendar } from 'lucide-react';
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

interface NotificationsProps {
    notifications: Notification[];
}

const Notifications: FC<NotificationsProps> = ({ notifications }) => {
    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'message':
                return <MessageSquare className="h-4 w-4 text-blue-500" />;
            case 'appointment':
                return <Calendar className="h-4 w-4 text-green-500" />;
            case 'reminder':
                return <BellRing className="h-4 w-4 text-amber-500" />;
            default:
                return <BellRing className="h-4 w-4 text-gray-500" />;
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <Card className='border-[#AFD3E2] bg-white overflow-hidden'>
            <div className="h-1"></div>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <CardTitle className='text-lg font-semibold flex items-center gap-2'>
                        <BellRing className='h-5 w-5 text-[#146C94]' />
                        Notifications
                    </CardTitle>
                    <CardDescription>
                        Your recent alerts and updates
                    </CardDescription>
                </div>
                <Badge className="bg-red-100 text-red-800 hover:bg-red-200">
                    {unreadCount} new
                </Badge>
            </CardHeader>
            <CardContent>
                {notifications.length === 0 ? (
                    <p className='text-gray-600'>No notifications.</p>
                ) : (
                    <div className='space-y-3 max-h-64 overflow-y-auto'>
                        {notifications.map((notification) => (
                            <div key={notification.id} className={`p-3 rounded-lg ${notification.read ? 'bg-gray-50' : 'bg-[#146C94]/5'} border ${notification.read ? 'border-gray-100' : 'border-[#146C94]/20'}`}>
                                <div className="flex items-start gap-3">
                                    <div className="mt-0.5">
                                        {getNotificationIcon(notification.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between">
                                            <p className="font-medium text-gray-900">{notification.title}</p>
                                            <p className="text-xs text-gray-500">
                                                {notification.date.toLocaleDateString()} {notification.date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{notification.message}</p>
                                        {notification.patientName && (
                                            <p className="text-xs text-[#146C94] mt-1">Related to: {notification.patientName}</p>
                                        )}
                                        {!notification.read && (
                                            <Badge className="mt-2 bg-[#146C94]/10 text-[#146C94] hover:bg-[#146C94]/20 px-2 py-0.5 text-xs">
                                                New
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
                <Button variant="outline" className="w-full border-[#146C94] text-[#146C94] hover:bg-[#146C94]/10">
                    View All Notifications
                </Button>
            </CardFooter>
        </Card>
    );
};

export default Notifications;