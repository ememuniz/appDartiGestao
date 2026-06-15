-- AlterTable
ALTER TABLE "Membro" ADD COLUMN     "expiracaoToken" TIMESTAMP(3),
ADD COLUMN     "tokenRecuperacao" TEXT;

-- CreateTable
CREATE TABLE "Aviso" (
    "id" TEXT NOT NULL,
    "titulo" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "diretoria" "Diretoria",
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Aviso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Tarefa" (
    "id" TEXT NOT NULL,
    "nome" TEXT NOT NULL,
    "descricao" TEXT NOT NULL,
    "dataEntrega" TIMESTAMP(3) NOT NULL,
    "linksExternos" TEXT[],
    "atribuidoAId" TEXT NOT NULL,
    "criadoPorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Tarefa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Feedback" (
    "id" TEXT NOT NULL,
    "conteudo" TEXT NOT NULL,
    "tarefaId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "paiId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Feedback_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Aviso" ADD CONSTRAINT "Aviso_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_atribuidoAId_fkey" FOREIGN KEY ("atribuidoAId") REFERENCES "Membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Tarefa" ADD CONSTRAINT "Tarefa_criadoPorId_fkey" FOREIGN KEY ("criadoPorId") REFERENCES "Membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_tarefaId_fkey" FOREIGN KEY ("tarefaId") REFERENCES "Tarefa"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Membro"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Feedback" ADD CONSTRAINT "Feedback_paiId_fkey" FOREIGN KEY ("paiId") REFERENCES "Feedback"("id") ON DELETE CASCADE ON UPDATE CASCADE;
