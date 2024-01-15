import { trpc } from "@/app/_trpc/client";
import { useToast } from "@/components/ui/use-toast";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { useMutation } from "@tanstack/react-query";
import { createContext, useRef, useState } from "react";

type StreamResponse = {
    addMessage: () => void,
    message: string,
    handleInputChange: (event: React.ChangeEvent<HTMLTextAreaElement>) => void,
    isLoading: boolean
}

export const chatContext = createContext<StreamResponse>({
    addMessage: () => { },
    message: '',
    handleInputChange: () => { },
    isLoading: false
})

export const ChatContextProvider = ({ fileId, children }: {
    fileId: string
    children: React.ReactNode
}) => {

    const [message, setMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false)

    const backupMsg = useRef('')

    const utils = trpc.useUtils()

    const { toast } = useToast()
    
    const {mutate: sendMessage } = useMutation({
        mutationFn: async ({message}: {message: string}) => {
            const res = await fetch('/api/message', {
                method: 'POST',
                body: JSON.stringify({fileId, message}),
            })

            if (!res.ok) throw new Error("Failed to send message")
            
            return res
        },
        onMutate: async ({message}) => {
            backupMsg.current = message
            setMessage('')
            

            // Optimistic Update
            //step 1
            await utils.getFileMessages.cancel()

            // step 2
            const prevMessages = utils.getFileMessages.getInfiniteData()

            // step 3
            utils.getFileMessages.setInfiniteData({ fileId, limit: INFINITE_QUERY_LIMIT }, (old) => {
                if (!old) {
                    return {
                        pages: [],
                        pageParams: []
                    }
                }

                let newPages = [...old.pages]
                let latestPage = newPages[0]
                latestPage.messages = [{
                    createdAt: new Date().toISOString(),
                    id: crypto.randomUUID(),
                    text: message,
                    isUserMessage: true
                }, ...latestPage.messages]
                newPages[0] = latestPage
                return {
                    ...old, pages: newPages
                }
            })

            setIsLoading(true)
            return {
                previousMessages: prevMessages?.pages.flatMap((page)=>page.messages) ?? [] 
            }
        },
        onSuccess: async (streamRes) => {
            setIsLoading(false)
            if (!streamRes) return toast({
                title: 'There was a problem sending this message',
                description: 'please refresh the page and try again',
                variant: 'destructive'
            })

            const stream = streamRes.body
            const reader = stream?.getReader()
            const decoder = new TextDecoder()
            let done = false

            //accumulated Response
            let accResponse = ''

            while (!done) {
                const { value, done: doneReading } = await reader!.read()
                done = doneReading
                const chunkValue = decoder.decode(value)

                accResponse += chunkValue

                //append the chunk to the actual message
                utils.getFileMessages.setInfiniteData(
                    { fileId, limit: INFINITE_QUERY_LIMIT },
                    (old) => {
                        if (!old) return {
                            pages: [],
                            pageParams: []
                        }

                        let isAiResponseCreated = old.pages.some((page) => page.messages.some(message => message.id === 'ai-response'))
                        
                        let updatedPages = old.pages.map(page => {
                            if (page === old.pages[0]) {
                                let updatedMessages

                                if (!isAiResponseCreated) {
                                    updatedMessages = [
                                        {
                                            createdAt: new Date().toISOString(),
                                            id: 'ai-response',
                                            text: accResponse,
                                            isUserMessage: false
                                        },
                                        ...page.messages
                                    ]
                                } else {
                                    updatedMessages = page.messages.map(message => {
                                        if (message.id === 'ai-response') {
                                            return {
                                                ...message, text: accResponse
                                            }
                                        }
                                        return message
                                    })
                                }
                                return {
                                    ...page, messages: updatedMessages
                                }
                            }
                            return page
                        })

                        return {...old, pages: updatedPages}
                    }
                )
            }

        },
        onError: (_, __, context) => {
            setMessage(backupMsg.current)
            utils.getFileMessages.setData({fileId}, {messages: context?.previousMessages??[]})
        },
        onSettled: async () => {
            setIsLoading(false)
            await utils.getFileMessages.invalidate({fileId})
        }
    })

    const addMessage = () => {
        sendMessage({ message })
    }
    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value)
    }

    return (
        <chatContext.Provider value={{
            addMessage,
            message,
            handleInputChange,
            isLoading
        }}>
            {children}
        </chatContext.Provider>
    )

}

