import { LogicalNames } from "../constants";
import { AnotationInput, AnotationRetrive, AnotationUpdate, Record } from "../types";

export const createAnnotationRecord = async(info: AnotationInput):Promise<any> => {
  try {
    let record: Record = {
      notetext: "",// Multiline Text
      documentbody: info?.documentbody, // Text
      isdocument: true, // Boolean
      mimetype: "text/thml", // Text
      filename: info?.filename, // Text
      objecttypecode: info?.objecttypecode, // EntityName
      // "objectid_gyde_surveytemplatechaptersection@odata.bind": "/gyde_surveytemplatechaptersections(0ad33728-af40-ee11-be6d-002248079177)", // Lookup
      subject: info?.subject, // Text
    };
    if (info?.objecttypecode === LogicalNames?.CHAPTER) {
      record = {
        ...record,
        "objectid_gyde_surveytemplatechapter@odata.bind": `/gyde_surveytemplatechapters(${info?.currentLocationId})`
      }
    }
    if (info?.objecttypecode === LogicalNames?.SECTION) {
      record = {
        ...record,
        "objectid_gyde_surveytemplatechaptersection@odata.bind": `/gyde_surveytemplatechaptersections(${info?.currentLocationId})`
      }
    }

    const result = await window.parent.Xrm.WebApi.createRecord("annotation", record);
    var newId = result.id;
    console.log(newId);
    return {error: false, result}
  } catch (error: { message: string} | any) {
    console.log(error.message);
    return {error: true, result: error.message}
  }
}

export const retrieveSurveyTemplateChapter = async(info: AnotationRetrive) => {
  const {currentLocationId, objecttypecode} = info;
  try {
      const result = await window.parent.Xrm.WebApi.retrieveRecord(
        objecttypecode, // "gyde_surveytemplatechapter", 
        currentLocationId, // "7f74261d-af40-ee11-be6d-002248079177", 
        `?$select=${objecttypecode}id&$expand=${objecttypecode}_Annotations($select=annotationid,notetext,documentbody,filename,isdocument,mimetype,objecttypecode,prefix,_objectid_value,subject)`);

      console.log("*****", result);
      // gyde_surveytemplatechapter_Annotations

      let resultValue = null;

      if (objecttypecode === LogicalNames?.CHAPTER) {
        console.log('result?.gyde_surveytemplatechapter_Annotations[0] ==> ', result?.gyde_surveytemplatechapter_Annotations[0]);
        
        resultValue = result?.gyde_surveytemplatechapter_Annotations[0] || null;
      }
      if (objecttypecode === LogicalNames?.SECTION) {
        resultValue = result?.gyde_surveytemplatechaptersection_Annotations[0] || null;

      }

      if (resultValue && resultValue?.annotationid) {
        return {error: false, result: resultValue}
      }
      return {error: false, result: null}

    //   {
    //     "@odata.etag": "W/\"15371904\"",
    //     "annotationid": "67f0515e-a0dc-ee11-904d-002248079177",
    //     "notetext": null,
    //     "documentbody": "PHAgY2xhc3M9ImVkaXRvci1wYXJhZ3JhcGgiIGRpcj0ibHRyIj48c3BhbiBzdHlsZT0id2hpdGUtc3BhY2U6IHByZS13cmFwOyI+ZHdmd2Z3d2QyZDwvc3Bhbj48L3A+",
    //     "filename": "gyde_surveytemplatechapter header text",
    //     "isdocument@OData.Community.Display.V1.FormattedValue": "Yes",
    //     "isdocument": true,
    //     "mimetype": "text/thml",
    //     "objecttypecode@OData.Community.Display.V1.FormattedValue": "Chapter",
    //     "objecttypecode": "gyde_surveytemplatechapter",
    //     "prefix": null,
    //     "_objectid_value@Microsoft.Dynamics.CRM.associatednavigationproperty": "objectid_gyde_surveytemplatechapter",
    //     "_objectid_value@Microsoft.Dynamics.CRM.lookuplogicalname": "gyde_surveytemplatechapter",
    //     "_objectid_value": "8364ce7c-a26b-47de-9615-b851e85a87ed",
    //     "subject": "CHAPTER_HEADER"
    // }

      // Columns
      // var gyde_surveytemplatechapterid = result["gyde_surveytemplatechapterid"]; // Guid
      // console.log('gyde_surveytemplatechapterid ==> ', gyde_surveytemplatechapterid)
      // // One To Many Relationships
      // for (var j = 0; j < result.gyde_surveytemplatechapter_Annotations.length; j++) {
      //     var gyde_surveytemplatechapter_Annotations_annotationid = result.gyde_surveytemplatechapter_Annotations[j]["annotationid"]; // Guid
      //     // var gyde_surveytemplatechapter_Annotations_notetext = result.gyde_surveytemplatechapter_Annotations[j]["notetext"]; // Multiline Text
      //     var gyde_surveytemplatechapter_Annotations_documentbody = result.gyde_surveytemplatechapter_Annotations[j]["documentbody"]; // Text
      //     // var gyde_surveytemplatechapter_Annotations_filename = result.gyde_surveytemplatechapter_Annotations[j]["filename"]; // Text
      //     // var gyde_surveytemplatechapter_Annotations_isdocument = result.gyde_surveytemplatechapter_Annotations[j]["isdocument"]; // Boolean
      //     // var gyde_surveytemplatechapter_Annotations_isdocument_formatted = result.gyde_surveytemplatechapter_Annotations[j]["isdocument@OData.Community.Display.V1.FormattedValue"];
      //     // var gyde_surveytemplatechapter_Annotations_mimetype = result.gyde_surveytemplatechapter_Annotations[j]["mimetype"]; // Text
      //     // var gyde_surveytemplatechapter_Annotations_objecttypecode = result.gyde_surveytemplatechapter_Annotations[j]["objecttypecode"]; // EntityName
      //     // var gyde_surveytemplatechapter_Annotations_objecttypecode_formatted = result.gyde_surveytemplatechapter_Annotations[j]["objecttypecode@OData.Community.Display.V1.FormattedValue"];
      //     // var gyde_surveytemplatechapter_Annotations_prefix = result.gyde_surveytemplatechapter_Annotations[j]["prefix"]; // Text
      //     // var gyde_surveytemplatechapter_Annotations_objectid = result.gyde_surveytemplatechapter_Annotations[j]["_objectid_value"]; // Lookup
      //     // var gyde_surveytemplatechapter_Annotations_objectid_formatted = result.gyde_surveytemplatechapter_Annotations[j]["_objectid_value@OData.Community.Display.V1.FormattedValue"];
      //     // var gyde_surveytemplatechapter_Annotations_objectid_lookuplogicalname = result.gyde_surveytemplatechapter_Annotations[j]["_objectid_value@Microsoft.Dynamics.CRM.lookuplogicalname"];
      //     // var gyde_surveytemplatechapter_Annotations_subject = result.gyde_surveytemplatechapter_Annotations[j]["subject"]; // Text
      // }
  } catch (error: { message: string} | any) {
      console.log(error.message);
      return {error: true, result: error?.message}
  }
}

export const updateAnnotationRecord = async (info: AnotationUpdate) => {
  const {annotationId, documentbody} = info;
  try {
    var record = {
      documentbody,
    };
    // record.documentbody = "base64"; // Text

    const result = await window.parent.Xrm.WebApi.updateRecord("annotation", annotationId, record);
    var updatedId = result.id;
    console.log("update ==>", updatedId);
    return {error: false, result}
  } catch (error: { message: string} | any) {
    console.log(error.message);
    return {error: true, result: error.message}
  }
}