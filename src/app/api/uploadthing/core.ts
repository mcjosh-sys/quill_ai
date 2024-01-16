import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import {PineconeStore} from '@langchain/community/vectorstores/pinecone'
import { pinecone } from "@/lib/pinecone";
import { getUserSubscriptionPlan } from "@/lib/stripe";
import { PLANS } from "@/config/stripe";
 
const f = createUploadthing();

const middleware = async () => {

      const user = await getKindeServerSession().getUser()

      const subscriptionPlan = await getUserSubscriptionPlan()
      

      if(!user || !user.id) throw new Error("Unauthorized")
      
      return {userId: user?.id, subscriptionPlan};
}
    
const onUploadComplete = async ({ metadata, file }: {
  metadata: Awaited<ReturnType<typeof middleware>>
  file: {
    key: string
    name: string
    url: string
  }
}) => { 

  const isFileExists = await db.file.findFirst({
    where: {
      key: file.key
    }
  })
  if (isFileExists) return 

      const createdFile = await db.file.create({
        data: {
          key: file.key,
          name: file.name,
          userId: metadata.userId,
          url: `https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`,
          uploadStatus: 'PROCESSING'
        }
      })

      try {
        const res = await fetch(`https://uploadthing-prod.s3.us-west-2.amazonaws.com/${file.key}`)
        const blob = await res.blob()
        const loader = new PDFLoader(blob)
        const pageLevelDocs = await loader.load()

        const pagesAmt = pageLevelDocs.length
        const { subscriptionPlan } = metadata 
        const { isSubscribed } = subscriptionPlan
        
        const isProExceeded = pagesAmt > PLANS.find(p => p.name === "Pro")!.pagesPerPdf
        const isFreeExceeded = pagesAmt > PLANS.find(p => p.name === "Free")!.pagesPerPdf

        if ((isSubscribed && isProExceeded) || (!isSubscribed && isFreeExceeded)) {
          throw new Error("Page limit exceeded")
        }

        // Vectorize and index the entire document

        const pineconeIndex = pinecone.Index('quillai')
        const embeddings = new OpenAIEmbeddings({
          openAIApiKey: process.env.OPENAI_API_KEY
        })

        await PineconeStore.fromDocuments(pageLevelDocs, embeddings, {
          pineconeIndex,
          namespace: createdFile.id
        })

        await db.file.update({
          data: {
            uploadStatus: 'SUCCESS'
          },
          where: {
            id: createdFile.id
          }
        })

      } catch (error) {
        await db.file.update({
          data: {
            uploadStatus: 'FAILED'
          },
          where: {
            id: createdFile.id
          }
        })
        console.log({error})
      }
    }
 
export const ourFileRouter = { 
  
  freePlanUploader: f({ pdf: { maxFileSize: "4MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
  proPlanUploader: f({ pdf: { maxFileSize: "16MB" } })
    .middleware(middleware)
    .onUploadComplete(onUploadComplete),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;