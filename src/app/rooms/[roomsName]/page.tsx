/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import { isVideoCodec } from '@/lib/types';
import { PageClientImpl } from './components/PageClientImplementation';

// Remove the explicit type annotation and use a more basic approach
export default function Page(props: any) {
  const { params, searchParams } = props;
  
  // Make sure we have the roomsName from params
  const roomsName = params?.roomsName || '';
  
  // Handle the codec logic
  const codec =
    typeof searchParams?.codec === 'string' && isVideoCodec(searchParams.codec)
      ? searchParams.codec
      : 'vp9';

  // Parse the hq parameter
  const hq = searchParams?.hq === 'true';

  // Return the component with the properly named props
  return (
    <PageClientImpl
      roomName={roomsName}
      region={searchParams?.region}
      hq={hq}
      codec={codec}
    />
  );
}