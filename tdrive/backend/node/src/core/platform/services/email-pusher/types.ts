import Company from "../../../../services/user/entities/company";
import User from "../../../../services/user/entities/user";

export type EmailBuilderDataPayload = {
  user: User;
  company: Company;
  notifications?: {
    title: string;
  }[];
};

export type EmailBuilderRenderedResult = {
  html: string;
  text: string;
  subject: string;
};

export type EmailBuilderTemplateName = "notification-digest" | "notification-document";

export type EmailPusherPayload = {
  subject: string;
  html: string;
  text: string;
};

export type EmailPusherEmailType = {
  sender: string;
  html_body: string;
  text_body: string;
  to: string[];
  subject: string;
};

export type EmailPusherResponseType = {
  data: {
    succeeded: number;
    failed: number;
    failures: string[];
    error?: string;
    error_code?: string;
  };
};

export type EmailLanguageType = "en" | "fr";
