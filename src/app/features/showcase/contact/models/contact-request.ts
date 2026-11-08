export type ContactSubject = 'devis' | 'question';

export interface ContactRequest {
  readonly subject: ContactSubject;
  readonly service: string | null;
  readonly name: string;
  readonly organization: string | null;
  readonly audience: string;
  readonly email: string | null;
  readonly phone: string | null;
  readonly message: string;
}

export interface ContactFormValue {
  readonly subject: ContactSubject;
  readonly service: string;
  readonly name: string;
  readonly organization: string;
  readonly audience: string;
  readonly email: string;
  readonly phone: string;
  readonly message: string;
}

const blankToNull = (value: string): string | null => value.trim() || null;

export function toContactRequest(value: ContactFormValue): ContactRequest {
  return {
    subject: value.subject,
    service: blankToNull(value.service),
    name: value.name.trim(),
    organization: blankToNull(value.organization),
    audience: value.audience,
    email: blankToNull(value.email),
    phone: blankToNull(value.phone),
    message: value.message.trim(),
  };
}
