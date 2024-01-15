import { Send } from "lucide-react";
import { Button } from "../ui/button";
import { Textarea } from "../ui/textarea";
import { useContext, useRef } from "react";
import { chatContext } from "@/context/ChatContext";

const ChatInput = ({ isDisabled }: { isDisabled?: boolean }) => {
  const { addMessage, handleInputChange, isLoading, message } =
    useContext(chatContext);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  return (
    <div className="absolute bottom-0 left-0 w-full">
      <form
        action=""
        className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:max-w-2xl xl:max-w-3xl"
      >
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <Textarea
                rows={1}
                maxRows={4}
                ref={textAreaRef}
                autoFocus
                placeholder="Enter your question..."
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue scrollbar-w-2 scrolling-touch"
                onChange={handleInputChange}
                value={message}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    addMessage();
                    textAreaRef.current?.focus();
                  }
                }}
              />
              <Button
                disabled = {isLoading || isDisabled}
                aria-label="send message"
                type="submit"
                onClick={(e) => {
                  e.preventDefault()
                  addMessage()

                  textAreaRef.current?.focus()
                }}
                className="absolute bottom-1.5 right-[8px]"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ChatInput;
