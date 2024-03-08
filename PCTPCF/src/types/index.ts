export interface Window {
  Xrm: any;
}

export interface Record {
  notetext: string;
  documentbody: string;
  isdocument: boolean;
  mimetype: string;
  filename: string;
  objecttypecode: string;
  subject: string;
  "objectid_gyde_surveytemplatechaptersection@odata.bind"?: string;
  "objectid_gyde_surveytemplatechapter@odata.bind"?: string;
}

export interface AnotationInput {
  documentbody: string;
  subject: string;
  filename: string;
  objecttypecode: string;
  bind: string;
  currentLocationId: string;
}

export interface AnotationRetrive {
  objecttypecode: string;
  currentLocationId: string;
}

export interface AnotationUpdate {
  annotationId: string;
  documentbody: string;
}