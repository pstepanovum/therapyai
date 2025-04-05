import * as React from 'react';
import { isVideoCodec } from '@/lib/types';
import { PageClientImpl } from './components/PageClientImplementation';

export default function Page({
  params,
  searchParams,
}: {
  params: { roomsName: string };  // Note: Changed to roomsName to match the folder structure
  searchParams: {
    region?: string;
    hq?: string;
    codec?: string;
  };
}) {
  // No need to await searchParams, it's already an object
  const codec =
    typeof searchParams.codec === 'string' && isVideoCodec(searchParams.codec)
      ? searchParams.codec
      : 'vp9';

  const hq = searchParams.hq === 'true';

  return (
    <PageClientImpl
      roomName={params.roomsName}  // Use roomsName to match params
      region={searchParams.region}
      hq={hq}
      codec={codec}
    />
  );
}