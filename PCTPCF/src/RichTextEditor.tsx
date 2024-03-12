import { useState } from "react";
import { LexicalComposer } from "@lexical/react/LexicalComposer";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import LexicalErrorBoundary from "@lexical/react/LexicalErrorBoundary";
import { HeadingNode, QuoteNode } from "@lexical/rich-text";
import { ListItemNode, ListNode } from "@lexical/list";
import { ListPlugin } from "@lexical/react/LexicalListPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import type { InitialConfigType } from "@lexical/react/LexicalComposer";
import { $generateHtmlFromNodes } from "@lexical/html";
import { $generateNodesFromDOM } from "@lexical/html";

import { theme } from "./RichTextTheme";
import { Flex, notification } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import SIcon from "./SIcon";
import FormatButton from "./toolbar/FormatButton";
import TypeFormatButton, { TypeFormat } from "./toolbar/TypeFormatButton";
import TypeFormatDropdown from "./toolbar/TypeFormatDropdown";
import AlignmentButton from "./toolbar/AlignmentButton";
import LexicalImagesPlugin from "./images/ImagesPlugin";
import { ImageNode } from "./images/ImageNode";
import ImageButton from "./toolbar/ImageButton";
import DragDropPaste from "./images/DragDropPaste";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ReactElement, useEffect, useRef } from "react";
import { DISPLAY_STYLES, EDITOR_STYLES } from "./RichTextStyles";
// import WhenInRole from "./auth/WhenInRole";
import { Trans } from "react-i18next";
import useIsDisabled from "./hooks/useIsDisabled";
import SetHtmlPlugin, { SET_HTML_COMMAND } from "./SetHtmlPlugin";
// import { useAtomValue } from "jotai";
// import { Environment } from "./atoms/Environment";
// import { Surface } from "./enums/Surface";
// import { UserCurrent } from "./atoms/User";
// import { Role } from "./enums/Role";
import React from "react";
import { LogicalNames, NameMapper } from "./constants";
import { convertBase64ToJson, convertJsonToBase64 } from "./utils/file";
import {
  createAnnotationRecord,
  retrieveSurveyTemplateChapter,
  updateAnnotationRecord,
} from "./apis";
import Loader from "./Loader";
import { $createParagraphNode, $getRoot } from "lexical";
import { MoreOutlined } from "@ant-design/icons";
import { Button } from "antd";

const EDITOR_CONFIG: InitialConfigType = {
  // The editor theme
  theme,
  // Handling of errors during update
  //@ts-ignore
  onError: (error) => {
    throw error;
  },
  // Any custom nodes go here
  nodes: [HeadingNode, ListNode, ListItemNode, QuoteNode, ImageNode],
  namespace: "",
};

declare global {
  interface Window {
    Xrm: any;
  }
}

type Props = Readonly<{
  value?: string;
  onBlur?: (html: string) => void;
  placeholder: ReactElement<typeof Trans> | string;
  minHeight?: number;
  maxHeight?: number;
  disabled?: boolean;
}>;

export default function RichTextEditor({ disabled, ...props }: Props) {
  // const [copyNotAllowed, setCopyNotAllowed] = useState<string>("Copying questions is not allowed on this webpage");
  // const [apiNotSupport, setApiNotSupport] = useState<string>("Permissions API not supported")
  // const [grantPermission, setGrantPermission] = useState<string>("You need to grant permission to copy on this webpage")

  // useMicrosoftTestDriveFocusCaptureFix();

  //Code to load the resources for the language translations.
  //   const loadResourceString = async () => {
  //     const url = await window.parent.Xrm.Utility.getGlobalContext().getClientUrl();
  //     const language = await window.parent.Xrm.Utility.getGlobalContext().userSettings.languageId
  //     const webResourceUrl = `${url}/WebResources/gyde_localizedstrings.${language}.resx`;

  //     try {
  //         const response = await fetch(`${webResourceUrl}`);
  //         const data = await response.text();
  //         const filterKeys = ['copyingnotallowed', 'permissionapinotsupport', 'grantpermission']; // Replace with the key you want to filter
  //         filterKeys.map((filterKey: string, index: number) => {
  //             const parser = new DOMParser();
  //             const xmlDoc = parser.parseFromString(data, "text/xml");
  //             const dataNode: any = xmlDoc.querySelector(`data[name="${filterKey}"]`);
  //             const value: any = dataNode?.querySelector("value").textContent;

  //             if (index === 0) {
  //                 setCopyNotAllowed(value)
  //             }
  //             if (index === 1) {
  //                 setApiNotSupport(value)
  //             }
  //             if (index === 2) {
  //                 setGrantPermission(value)
  //             }
  //             console.log('data ====> ',  index, value);
  //         });
  //     } catch (error) {
  //         console.error('Error loading data:', error);
  //     }
  // }

  // const messageHandler = async() => {
  //     try {
  //         await loadResourceString();
  //     } catch (error) {
  //         console.log('error ====>', error);
  //     }
  // }

  const d = useIsDisabled();
  return (
    <LexicalComposer initialConfig={EDITOR_CONFIG}>
      <Internal {...props} disabled={d || disabled} />
    </LexicalComposer>
  );
}

function Internal({
  onBlur,
  placeholder,
  minHeight = 100,
  maxHeight,
  disabled = false,
}: Props) {
  const [editor] = useLexicalComposerContext();
  const cache = useRef<string | null | undefined>();
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const [currentLocationName, setCurrentLocationName] = useState<
    "gyde_surveytemplatechapter" | "gyde_surveytemplatechaptersection"
  >();
  const [currentLocationId, setCurrentLocationId] = useState<string>();
  const [annotationId, setAnnotationId] = useState<string | null>();
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isDataRetriveCompleted, setIsDataRetriveCompleted] =
    useState<boolean>(false);
  const [isExpand, setExpand] = useState(false);
  // const [isInitial, setIsInitial] = useState(true);
  const icon = <MoreOutlined rev={undefined} />;

  const retrieveTemplateHandler = async () => {
    try {
      const currentLocation = await window.parent.Xrm.Page.ui._formContext
        .contextToken.entityTypeName;
      setCurrentLocationName(currentLocation);
      const currentEntityId = await window.parent.Xrm.Page.data.entity
        .getId()
        .replace("{", "")
        .replace("}", "");
      setCurrentLocationId(currentEntityId);
      var surveyTemplate = await window.parent.Xrm.Page.getAttribute(
        "gyde_surveytemplate"
      )
        ?.getValue()[0]
        ?.id?.replace("{", "")
        .replace("}", "");
      // console.log('id ===> ', surveyTemplate);

      const response = await retrieveSurveyTemplateChapter({
        currentLocationId: currentEntityId,
        objecttypecode: currentLocation,
      });
      console.log("response data retrive ==> ", response);
      if (!response?.error) {
        setAnnotationId(response?.result?.annotationid);
        // if (response?.result?.documentbody)
        let content = "";
        if (response?.result?.documentbody)
          content = await convertBase64ToJson(response?.result?.documentbody);
        console.log("content ==> ", content);
        await Promise.allSettled([content]);
        editor.update(() => {
          const root = $getRoot();
          root.clear();
          console.log("cont2222 =...", content);

          if (content == null) {
            const paragraph = $createParagraphNode();
            root.append(paragraph);
            paragraph.select();
          } else {
            const parser = new DOMParser();

            const dom = parser.parseFromString(content, "text/html");
            const nodes = $generateNodesFromDOM(editor, dom);

            root.append(...nodes);
            nodes[nodes.length - 1]?.selectEnd();
          }
        });
        // editor.dispatchCommand(SET_HTML_COMMAND, content);
        setValue(content);
        cache.current = content;
        setIsDataRetriveCompleted(true);
      }

      await window.parent.Xrm.WebApi.retrieveRecord(
        "gyde_surveytemplate",
        surveyTemplate,
        "?$select=statuscode"
      ).then(
        function success(result: any) {
          console.log("result status ====>", result.statuscode);
          console.log("Result ==>", result);
          if (
            result.statuscode == 528670003 ||
            result.statuscode == 528670005
          ) {
            setIsDisable(true);
            console.log("State ==>>", isDisable);
          } else {
            setIsDisable(false);
          }
        },
        function (error: any) {
          console.log("error message ====> ", error.message);
          setIsDisable(false);
        }
      );
      setIsLoading(false);
    } catch (error: any) {
      console.log("Error Message (catch) ==>", error.message);
      setIsDisable(false);
      setIsLoading(false);
      setIsDataRetriveCompleted(true);
    }
  };

  const dataRetriveHandler = async () => {
    try {
      // const response = await retrieveSurveyTemplateChapter({
      //   currentLocationId: currentLocationId!,
      //   objecttypecode: currentLocationName!,
      // })
      // console.log('response data retrive ==> ', response)
      // const content = await window.parent.Xrm.Page.getAttribute("gyde_headertext").getValue();
      // console.log("Content ==> ", content);
      // setValue(content);
      // console.log("Value when The data is set",value)
      // cache.current = content;
      // console.log("Cache ==>", cache.current);
    } catch (error: any) {
      console.log("Loading Error", error);
    }
  };

  const saveAsHtmlFile = async (htmlContent: string) => {
    // Create a Blob object from the HTML content
    const base64Data = await convertJsonToBase64(htmlContent);
    console.log("dadadadad", base64Data);
    const documentbody = base64Data;
    let filename = "";
    let subject = "";
    let bind = `objectid_${currentLocationName}@odata.bind`;
    if (
      LogicalNames?.CHAPTER === currentLocationName ||
      LogicalNames?.SECTION === currentLocationName
    ) {
      subject = NameMapper[currentLocationName];
      filename = `${currentLocationName} header text`;
    }

    if (!annotationId) {
      const response = await createAnnotationRecord({
        documentbody,
        subject,
        filename,
        objecttypecode: currentLocationName!,
        bind,
        currentLocationId: currentLocationId!,
      });
      console.log("response of save ==> ", response);

      if (!response.error) {
        setAnnotationId(response?.result?.id);
      }
    } else {
      const response = await updateAnnotationRecord({
        annotationId,
        documentbody: base64Data,
      });
      console.log("response update ==> ", response);
    }

    // createAnnotationRecord
    // const blob = new Blob([htmlContent], { type: 'text/html' });

    // // Create a URL for the Blob object
    // const url = URL.createObjectURL(blob);

    // // Create a link element
    // const link = document.createElement('a');
    // link.href = url;
    // link.download = 'HeaderText.html'; // Specify the filename here
    // document.body.appendChild(link);

    // const title: string | undefined = currentLocationName && NameMapper?.[currentLocationName];
    // // Programmatically click the link to trigger the download
    // link.click();

    // // Remove the link element from the DOM
    // document.body.removeChild(link);

    // // Revoke the URL to release the object resources
    // URL.revokeObjectURL(url);
  };

  const handleChange = async (html: any) => {
    console.log("html===================", html);
    setValue(html);
    saveAsHtmlFile(html);
    // const xrmReq = await  window.parent.Xrm.Page.getAttribute("gyde_headertext").setValue(html);
    // console.log("XRM", xrmReq);
  };

  useEffect(() => {
    setIsLoading(true);
    retrieveTemplateHandler();
  }, []);

  // useEffect(() => {
  //   // console.log('======ww=====> ', value);
  //   if ((!value || (value == '') || !cache.current || cache.current == "") ) {
  //     // console.log("Hajskaj")
  //     dataRetriveHandler();
  //   }
  // }, []);

  useEffect(() => {
    editor.setEditable(!isDisable);
  }, [editor, isDisable]);

  useEffect(() => {
    if (
      value === undefined ||
      value === cache.current ||
      cache?.current === undefined
    ) {
      return;
    }

    // if (!isInitial) {
    //   cache.current = value;
    //   editor.dispatchCommand(SET_HTML_COMMAND, value);
    // }
    // setIsInitial(false);
    // console.log("The value in the useEffect", value);
    // console.log('x ===> ', value);
    // setValue('<p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">swdwf</span></p> <p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">swdwf</span></p>');
    // cache.current = '<p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">swdwf</span></p> <p class="editor-paragraph" dir="ltr"><span style="white-space: pre-wrap;">swdwf</span></p>'
    // // value;
    if (!isLoading && isDataRetriveCompleted) {
      editor.dispatchCommand(SET_HTML_COMMAND, value || cache?.current);
    }
  }, [editor, value, cache, cache.current, isLoading, isDataRetriveCompleted]);

  const handleExpand = () => {
    setExpand(true);
  };

  return (
    <>
      {isLoading ? (
        <Loader />
      ) : (
        <div>
          <SetHtmlPlugin />
          {!isDisable && (
            <>
              <ListPlugin />
              <HistoryPlugin />
              <LexicalImagesPlugin />
              <DragDropPaste />
            </>
          )}

          <Flex vertical gap="middle" className="editor-container">
            <div style={{ position: "relative" }}>
              <RichTextPlugin
                contentEditable={
                  <ContentEditable
                    defaultValue={cache.current || value}
                    onBlur={() => {
                      // console.log('wwwwwwww');
                      editor.getEditorState().read(() => {
                        const htmlString = $generateHtmlFromNodes(editor);
                        // console.log('swrwswew==> ', htmlString);

                        cache.current = htmlString;
                        if (!isLoading) handleChange(htmlString);
                        // onBlur(htmlString);
                      });
                      // if (onBlur != null) {
                      //   editor.getEditorState().read(() => {
                      //     const htmlString = $generateHtmlFromNodes(editor);
                      //     console.log('swrwswew==> ', htmlString);

                      //     cache.current = htmlString;
                      //     onBlur(htmlString);
                      //   });
                      // }
                    }}
                    className={`${DISPLAY_STYLES} ${
                      disabled ? "" : EDITOR_STYLES
                    }`}
                    style={{
                      minHeight,
                      maxHeight,
                      overflowY: "scroll",
                      padding: 2,
                      textAlign: "left",
                      color: "black",
                    }}
                    // onChange={ handleChange }
                    value={cache?.current || value}
                  />
                }
                placeholder={
                  <div
                    style={{
                      position: "absolute",
                      top: 2,
                      left: 4,
                      pointerEvents: "none",
                      opacity: 0.5,
                    }}
                  >
                    {placeholder + "Enter Text..."}
                  </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
              />
            </div>
            {!isDisable && (
              <Flex wrap="wrap" align="center" gap="small" className="toolbar">
                <TypeFormatDropdown disabled={disabled} />
                <div className="vr"></div>
                <Flex gap={2}>
                  <FormatButton format="bold" disabled={disabled}>
                    <BoldOutlined rev={undefined} />
                  </FormatButton>
                  <FormatButton format="italic" disabled={disabled}>
                    <ItalicOutlined rev={undefined} />
                  </FormatButton>
                  <FormatButton format="underline" disabled={disabled}>
                    <UnderlineOutlined rev={undefined} />
                  </FormatButton>
                  <FormatButton format="strikethrough" disabled={disabled}>
                    <StrikethroughOutlined rev={undefined} />
                  </FormatButton>
                </Flex>

                {isExpand ? (
                  <>
                    <div className="vr"></div>
                    <Flex gap={2}>
                      <TypeFormatButton
                        format={TypeFormat.Quote}
                        disabled={disabled}
                      >
                        <SIcon>blockquote-left</SIcon>
                        <MenuUnfoldOutlined rev={undefined} />
                      </TypeFormatButton>
                      <TypeFormatButton
                        format={TypeFormat.UnorderedList}
                        disabled={disabled}
                      >
                        <UnorderedListOutlined rev={undefined} />
                      </TypeFormatButton>
                      <TypeFormatButton
                        format={TypeFormat.OrderedList}
                        disabled={disabled}
                      >
                        <OrderedListOutlined rev={undefined} />
                      </TypeFormatButton>
                    </Flex>
                    <div className="vr"></div>
                    <Flex gap={2}>
                      <AlignmentButton format="left" disabled={disabled} />
                      <AlignmentButton format="center" disabled={disabled} />
                      <AlignmentButton format="right" disabled={disabled} />
                    </Flex>
                    <div className="vr"></div>
                    <Flex gap={2}>
                      <ImageButton disabled={disabled} />
                    </Flex>
                  </>
                ) : (
                  <>
                    <div className="vr"></div>
                    <Flex gap={2}>
                      <Button
                        icon={icon}
                        size="small"
                        disabled={disabled}
                        onClick={handleExpand}
                      />
                    </Flex>
                  </>
                )}

                {/* <WhenInRole SuperAdmin>
            
          </WhenInRole> */}
              </Flex>
            )}
          </Flex>
        </div>
      )}
    </>
  );
}

/**
 * On TestDrive, Microsoft injects a file called
 * 
 *    _common/global.ashx?ver=-1516542382
 * 
 * Which contains code to listen to various document level events:
 * 
      Mscrm.GlobalEvents.$$cctor = function() {
          $addHandler(document, "keypress", Mscrm.GlobalEvents.$6G);
          $addHandler(document, "keydown", Mscrm.GlobalEvents.$6G);
          $addHandler(document, "selectstart", Mscrm.GlobalEvents.$9A); // ISSUE!
          $addHandler(document, "dragstart", Mscrm.GlobalEvents.$99);
          $addHandler(document, "unload", Mscrm.GlobalEvents.documentUnload);
          $addHandler(document, "click", Mscrm.GlobalEvents.$97);
          $addHandler(document, "contextmenu", Mscrm.GlobalEvents.$98)
      }
 * 
 * This prevents inputs from receiving focus as the rich text editor does not 
 * use traditional <input/> HTML types but instead makes use of contentEditable 
 * on a regular <div/>
 * 
 * The fix to this is to unregister the handler
 */
// function useMicrosoftTestDriveFocusCaptureFix() {
//   const { surface } = useAtomValue(Environment);
//   const { role } = useAtomValue(UserCurrent);

//   useEffect(() => {
//     if (surface === Surface.Portals) {
//       // @ts-ignore
//       if (window?.Mscrm?.GlobalEvents?.$9A != null && window?.$removeHandler != null) {
//         // @ts-ignore
//         window.$removeHandler(document, "selectstart", Mscrm.GlobalEvents.$9A);
//       }
//     }
//   }, [surface, role]);
// }
