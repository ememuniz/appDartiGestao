-- CreateEnum
CREATE TYPE "Papel" AS ENUM ('PRESIDENTE', 'VICE_PRESIDENTE', 'DIRETOR', 'MEMBRO', 'ESTAGIARIO');

-- CreateEnum
CREATE TYPE "Diretoria" AS ENUM ('SEM_DIRETORIA', 'RECURSOS_HUMANOS', 'COMUNICACAO', 'HARDWARE', 'SOFTWARE', 'MULTIDISCIPLINARIDADE');

-- CreateTable
CREATE TABLE "Membro" (
    "id" TEXT NOT NULL,
    "nomeCompleto" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "senha" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "diretoria" "Diretoria" NOT NULL DEFAULT 'SEM_DIRETORIA',
    "nomeSocial" TEXT,
    "descricao" TEXT,
    "skills" TEXT[],
    "foto" TEXT,
    "curso" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "conviteId" TEXT,

    CONSTRAINT "Membro_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Convite" (
    "id" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "papel" "Papel" NOT NULL,
    "usado" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Convite_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membro_email_key" ON "Membro"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Membro_conviteId_key" ON "Membro"("conviteId");

-- CreateIndex
CREATE UNIQUE INDEX "Convite_codigo_key" ON "Convite"("codigo");

-- AddForeignKey
ALTER TABLE "Membro" ADD CONSTRAINT "Membro_conviteId_fkey" FOREIGN KEY ("conviteId") REFERENCES "Convite"("id") ON DELETE SET NULL ON UPDATE CASCADE;
