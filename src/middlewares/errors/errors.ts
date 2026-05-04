import { DomainError } from './domain-error';

export class ValidationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(400, 'VALIDATION_ERROR', message, details);
  }
}

export class UnauthorizedError extends DomainError {
  constructor(message = 'Não autorizado') {
    super(401, 'UNAUTHORIZED', message);
  }
}

export class ForbiddenError extends DomainError {
  constructor(message = 'Acesso negado', details?: Record<string, unknown>) {
    super(403, 'FORBIDDEN', message, details);
  }
}

export class NotFoundError extends DomainError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} não encontrado.`, { resource });
  }
}

export class ConflictError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(409, 'CONFLICT', message, details);
  }
}

export class InsufficientStockError extends DomainError {
  constructor(input: { productId: number; productName?: string; requested: number; available: number }) {
    const label = input.productName ?? `Produto #${input.productId}`;
    super(
      409,
      'INSUFFICIENT_STOCK',
      `Estoque insuficiente para ${label}: pedido ${input.requested}, disponível ${input.available}.`,
      input,
    );
  }
}

export class PlanFeatureRequiredError extends DomainError {
  constructor(feature: string) {
    super(
      402,
      'PLAN_FEATURE_REQUIRED',
      `O recurso "${feature}" não está disponível no seu plano atual.`,
      { feature },
    );
  }
}

export class PlanLimitExceededError extends DomainError {
  constructor(input: { feature: string; limit: number; current: number }) {
    super(
      402,
      'PLAN_LIMIT_EXCEEDED',
      `Limite do plano atingido para "${input.feature}" (${input.current}/${input.limit}).`,
      input,
    );
  }
}

export class AppointmentConflictError extends DomainError {
  constructor(input: { conflictingId?: number; startTime: Date; endTime: Date; reason?: string }) {
    super(
      409,
      'APPOINTMENT_CONFLICT',
      input.reason ?? 'Já existe um compromisso nesse horário.',
      input,
    );
  }
}

export class CalendarIntegrationError extends DomainError {
  constructor(message: string, details?: Record<string, unknown>) {
    super(502, 'CALENDAR_INTEGRATION_ERROR', message, details);
  }
}
