'use client';

import { FC } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, BookOpen, MessageSquare } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const QuickActionButtons: FC = () => {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <Card className="border-[#AFD3E2] bg-white overflow-hidden">
        <div className="h-1"></div>
        <CardContent className="pt-6">
          <Button 
            className="w-full bg-[#146C94] hover:bg-[#146C94]/90"
            onClick={() => router.push("/patient/schedule")}
          >
            <Plus className="mr-2 h-4 w-4" />
            Schedule Appointment
          </Button>
        </CardContent>
      </Card>

      <Card className="border-[#AFD3E2] bg-white overflow-hidden">
        <div className="h-1"></div>
        <CardContent className="pt-6">
          <Link href="/patient/journal" className="w-full">
            <Button className="w-full bg-[#146C94] hover:bg-[#146C94]/90">
              <BookOpen className="mr-2 h-4 w-4" />
              New Journal Entry
            </Button>
          </Link>
        </CardContent>
      </Card>

      <Card className="border-[#AFD3E2] bg-white overflow-hidden">
        <div className="h-1"></div>
        <CardContent className="pt-6">
          <Button 
            className="w-full bg-[#146C94] hover:bg-[#146C94]/90"
            onClick={() => router.push("/patient/messages")}
          >
            <MessageSquare className="mr-2 h-4 w-4" />
            Message Therapist
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickActionButtons;