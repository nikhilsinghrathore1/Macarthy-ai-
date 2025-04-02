"use client"
import dynamic from "next/dynamic";

const Page = dynamic(() => import("@/components/NewVoiceUi"), { ssr: false });

export default Page;
