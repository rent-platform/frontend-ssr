'use client'
import { redirect } from "next/navigation";
import { ROUTE_PATHS } from "@/business/utils/routes";

export default function DevPage() {
    redirect(ROUTE_PATHS.LOGIN); //сразу редирект на логин(потом убрать), раскоментируй снизу чтобы свое вставлять
    // return (
    //     <>
    //     <div></div>
    //     </>
    // )
}
