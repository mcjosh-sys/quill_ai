import { type ClassValue, clsx } from "clsx"
import { Metadata } from "next"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function absoluteUrl(path: string) {
  if (typeof window !== "undefined") return path
  return `${process.env.NEXT_URL}${path}`
}


export function constructMetadata({
  title = "QuillAI - the SaaS for students",
  description = "QuillAi is an open-source software to make chatting to your PDF files easy",
  image = '/thumbnail.png',
  icons = "/favicon.ico",
  noIndex = false
}: {
    title?: string
    description?: string
    image?: string
    icons?: string
  noIndex?: boolean
  } = {}): Metadata {
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: [
        {
          url: image
        }
      ]
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
      creator: "@erosennin_q"
    },
    icons,
    metadataBase: new URL('https://quill-ai-beta.vercel.app'),
    themeColor: '#fff',
    ... (noIndex && {
      robots: {
        index: false,
        follow: false
    }})
  }
}