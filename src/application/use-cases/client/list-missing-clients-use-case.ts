import prisma from '../../../infrastructure/db/prisma';

export interface MissingClient {
  clientId: number;
  name: string;
  phone: string | null;
  email: string | null;
  lastServiceDate: string; // ISO
  lastProcedureTypeId: number;
  lastProcedureTypeName: string;
  expectedIntervalDays: number;
  daysSinceLastService: number;
  daysOverdue: number; // positivo = está sumido
  whatsappUrl: string | null;
}

export interface ListMissingClientsInput {
  businessId: number;
  /**
   * Se informado, sobrepõe o intervalo esperado de cada procedimento.
   * Útil pra fazer buscas manuais ("me mostra quem sumiu há mais de 60 dias").
   */
  overrideDaysOverdue?: number;
}

const MS_PER_DAY = 24 * 60 * 60 * 1000;

/**
 * Rule 11 — clientes cujo último atendimento passou do intervalo típico
 * do procedimento que fizeram.  Um cliente é considerado "sumido" quando:
 *
 *   (today - lastServiceDate) > lastProcedureType.expectedIntervalDays
 *
 * Se `expectedIntervalDays` for null no procedure_type, o cliente
 * não entra na lista (opção deliberada — sem intervalo cadastrado,
 * o sistema não tem base pra afirmar que está atrasado).
 *
 * Estratégia: montamos em código porque cada cliente pode ter um
 * intervalo diferente vindo do seu último procedure_type — não dá pra
 * fazer só via SQL de forma limpa e legível.  A query base traz o
 * último `service_procedure` por cliente e o intervalo do tipo dele.
 */
export class ListMissingClientsUseCase {
  async execute(input: ListMissingClientsInput): Promise<MissingClient[]> {
    const now = new Date();

    // Traz todos os atendimentos confirmados do business com o procedure
    // type de cada procedimento — não é a query mais eficiente do mundo
    // pra bases enormes, mas atende centenas de clientes tranquilamente
    // (que é o alvo desse tipo de sistema).
    const services = await prisma.service.findMany({
      where: {
        businessId: input.businessId,
        deletedAt: null,
        status: 'confirmed',
      },
      include: {
        client: { select: { id: true, name: true, phone: true, email: true, deletedAt: true } },
        procedures: {
          include: {
            procedureType: {
              select: { id: true, name: true, expectedIntervalDays: true },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    // Reduce → last service per client with the first procedure whose
    // interval we can compare against.
    const seen = new Map<number, MissingClient>();
    for (const svc of services) {
      if (svc.client.deletedAt) continue;
      if (seen.has(svc.clientId)) continue;

      const proc = svc.procedures.find((p) => p.procedureType.expectedIntervalDays != null);
      if (!proc) continue;

      const interval = proc.procedureType.expectedIntervalDays!;
      const daysSince = Math.floor((now.getTime() - svc.date.getTime()) / MS_PER_DAY);
      const threshold = input.overrideDaysOverdue ?? interval;
      const daysOverdue = daysSince - threshold;

      if (daysOverdue <= 0) {
        // Cliente ainda dentro do intervalo — pula, mas guarda como "visto"
        // pra não considerar atendimentos ANTERIORES a esse.
        seen.set(svc.clientId, {
          clientId: svc.clientId,
          name: svc.client.name,
          phone: svc.client.phone,
          email: svc.client.email,
          lastServiceDate: svc.date.toISOString(),
          lastProcedureTypeId: proc.procedureType.id,
          lastProcedureTypeName: proc.procedureType.name,
          expectedIntervalDays: interval,
          daysSinceLastService: daysSince,
          daysOverdue,
          whatsappUrl: null,
        });
        continue;
      }

      seen.set(svc.clientId, {
        clientId: svc.clientId,
        name: svc.client.name,
        phone: svc.client.phone,
        email: svc.client.email,
        lastServiceDate: svc.date.toISOString(),
        lastProcedureTypeId: proc.procedureType.id,
        lastProcedureTypeName: proc.procedureType.name,
        expectedIntervalDays: interval,
        daysSinceLastService: daysSince,
        daysOverdue,
        whatsappUrl: buildWhatsappUrl(svc.client.phone, svc.client.name),
      });
    }

    return Array.from(seen.values())
      .filter((c) => c.daysOverdue > 0)
      .sort((a, b) => b.daysOverdue - a.daysOverdue);
  }
}

function buildWhatsappUrl(phone: string | null, clientName: string): string | null {
  if (!phone) return null;
  // Normaliza pra apenas dígitos (WhatsApp aceita formato E.164 sem "+").
  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) return null;

  // Assume código de país 55 (Brasil) se o número tem 10 ou 11 dígitos.
  const withCountry = digits.length === 10 || digits.length === 11 ? `55${digits}` : digits;

  const greeting = encodeURIComponent(
    `Olá ${clientName.split(' ')[0]}! Como você está? Faz um tempo que não te vejo aqui, vamos marcar? 💇`,
  );
  return `https://wa.me/${withCountry}?text=${greeting}`;
}
