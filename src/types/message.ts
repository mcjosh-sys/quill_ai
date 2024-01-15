import { AppRouter } from "@/trpc";
import { inferRouterOutputs } from "@trpc/server";

type RouterOutput = inferRouterOutputs<AppRouter>

type Messages = RouterOutput["getFileMessages"]["messages"]

type OmmitText = Omit<Messages[number], "text">

type ExtendedText = {
    text: string | JSX.Element
}

export type ExtendedMessage = OmmitText & ExtendedText