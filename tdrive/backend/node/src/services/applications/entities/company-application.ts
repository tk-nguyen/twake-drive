import { PublicApplicationObject } from "./application";

export default class CompanyApplication {
  company_id: string;
  application_id: string;
  id: string;
}

export type CompanyApplicationPrimaryKey = Pick<
  CompanyApplication,
  "company_id" | "application_id" | "id"
>;

export class CompanyApplicationWithApplication extends CompanyApplication {
  //Not in database but attached to this object
  application?: PublicApplicationObject;
}
