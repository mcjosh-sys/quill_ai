"use client";

import { trpc } from "@/app/_trpc/client";
import { INFINITE_QUERY_LIMIT } from "@/config/infinite-query";
import { chatContext } from "@/context/ChatContext";
import { useIntersection } from '@mantine/hooks';
import { Loader2, MessageSquare } from "lucide-react";
import { useContext, useEffect, useRef } from "react";
import Skeleton from "react-loading-skeleton";
import Message from "./Message";

const Messages = ({ fileId }: { fileId: string }) => {
  const { isLoading: isAiThinking } = useContext(chatContext);
  const { data, isLoading, fetchNextPage } =
    trpc.getFileMessages.useInfiniteQuery(
      {
        fileId,
        limit: INFINITE_QUERY_LIMIT,
      },
      {
        getNextPageParam: (lastPage) => lastPage?.nextCursor,
        keepPreviousData: true,
      }
    );

  const messages = data?.pages.flatMap((page) => page.messages);

  const loadingMssage = {
    createdAt: new Date().toISOString(),
    id: "loading-message",
    isUserMessage: false,
    text: (
      <div className="flex h-full items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    ),
  };

  const combinedMessages = [
    ...(isAiThinking ? [loadingMssage] : []),
    ...(messages ?? []),
  ];

  const { ref, entry } = useIntersection({
    root: null,
    threshold: 1
  })

  useEffect(() => {
    // const options = {
    //   root: null,
    //   rootMargin: "0px",
    //   threshold: 1,
    // };

    // const observer = new IntersectionObserver(([entry]) => {
    //   console.log({ entry });
    //   if (entry.isIntersecting) {
    //     fetchNextPage();
    //   }
    // }, options);

    // if (lastMessageRef.current) {
    //   console.log({ observer: "Observing" })
    //   observer.observe(lastMessageRef.current);
    // }

    // return () => {
    //   observer.disconnect();
    // };

    if (entry?.isIntersecting) {
      fetchNextPage()
    }
  }, [entry, fetchNextPage]);

  return (
    <div
      
      className="flex max-h-[calc(100vh-3.5rem-7rem)] flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch"
    >
      {combinedMessages && combinedMessages.length > 0 ? (
        combinedMessages.map((message, i) => {
          const isNextMessageSamePerson =
            combinedMessages[i - 1]?.isUserMessage ===
            combinedMessages[i]?.isUserMessage;

          if (i === combinedMessages.length - 1) {
            return (
              <Message
                ref={ref}
                key={message.id}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
              />
            );
          } else {
            return (
              <Message
                key={i}
                message={message}
                isNextMessageSamePerson={isNextMessageSamePerson}
              />
            );
          }
        })
      ) : isLoading ? (
        <div className="w-full flex flex-col gap-2">
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
          <Skeleton className="h-16" />
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8" />
          <h3 className="font-semibold text-xl">You&apos;re are all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question to get started.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
