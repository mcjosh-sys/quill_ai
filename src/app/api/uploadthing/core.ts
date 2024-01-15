import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import {PDFLoader} from 'langchain/document_loaders/fs/pdf'
import { OpenAIEmbeddings } from '@langchain/openai'
import {PineconeStore} from '@langchain/community/vectorstores/pinecone'
import { pinecone } from "@/lib/pinecone";
 
const f = createUploadthing();
 
export const ourFileRouter = { 
  
  pdfUploader: f({ pdf: { maxFileSize: "4MB" } })
   
    .middleware(async ({ req }) => {

      const user = await getKindeServerSession().getUser()
      

      if(!user || !user.id) throw new Error("Unauthorized")
      
      return {userId: user?.id};
    })
    .onUploadComplete(async ({ metadata, file }) => { 
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
    }),
} satisfies FileRouter;
 
export type OurFileRouter = typeof ourFileRouter;