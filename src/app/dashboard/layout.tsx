import { db } from "@/db"
import { getUserSubscriptionPlan } from "@/lib/stripe"
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server"
import { redirect } from "next/navigation"


const DashboardLayout = async ({children}:{children: React.ReactNode}) => {
    const { getUser } = getKindeServerSession()
    const user = await getUser()

    const subscriptionPlan = await getUserSubscriptionPlan()

    if (!user || !user.id) redirect('/auth-callback?origin=dashboard')

    const dbUser = await db.user.findFirst({
        where: { id: user.id }
    })

    if (!dbUser) redirect('/auth-callback?origin=dashboard')
    return (
        <>
            {children}
        </>
    )
}

export default DashboardLayout