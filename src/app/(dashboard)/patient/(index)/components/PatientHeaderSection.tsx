'use client';

import { FC } from 'react';
import { Quote } from "@/app/(dashboard)/shared/types/interfaces";

interface PatientHeaderSectionProps {
    greeting: string;
    userName: string;
    quote: Quote;
}

const PatientHeaderSection: FC<PatientHeaderSectionProps> = ({
    greeting,
    userName,
    quote,
}) => {
    return (
        <div className="mb-6">
            <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-[#146C94]">
                        {greeting}, {userName}
                    </h1>
                    <p className="text-gray-600 mt-2">
                        We&apos;re here to support your journey to better mental health
                    </p>
                </div>
                <div className="bg-[#146C94]/5 p-4 rounded-lg max-w-md">
                    <blockquote className="space-y-2">
                        <p className="text-lg text-[#146C94] italic">&quot;{quote.text}&quot;</p>
                        <footer className="text-sm text-[#146C94]/70 text-right">
                            — {quote.author}
                        </footer>
                    </blockquote>
                </div>
            </div>
        </div>
    );
};

export default PatientHeaderSection;