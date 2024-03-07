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

import { theme } from "./RichTextTheme";
import { Flex, notification } from "antd";
import {
  BoldOutlined,
  ItalicOutlined,
  OrderedListOutlined,
  StrikethroughOutlined,
  UnderlineOutlined,
  UnorderedListOutlined,
  MenuUnfoldOutlined
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

function Internal({onBlur, placeholder, minHeight = 100, maxHeight, disabled = false }: Props) {
  const [editor] = useLexicalComposerContext();
  const cache = useRef<string | null | undefined>();
  const [isDisable, setIsDisable] = useState<boolean>(false);
  const [value, setValue] = useState("");
  // const [isInitial, setIsInitial] = useState(true);

  const retrieveTemplateHandler = async () => {
    try{
      var surveyTemplate = await window.parent.Xrm.Page.getAttribute("gyde_surveytemplate")?.getValue()[0]?.id?.replace("{","")
      .replace("}", "");
      // console.log('id ===> ', surveyTemplate);

      window.parent.Xrm.WebApi.retrieveRecord("gyde_surveytemplate", surveyTemplate, "?$select=statuscode").then(
        function success(result: any) {
            console.log("result status ====>", result.statuscode);
            if (result.statuscode == 528670003 || result.statuscode == 528670005) {
              setIsDisable(true)
            } else {
              setIsDisable(false);
            }
        },
        function (error: any) {
            console.log("error message ====> ", error.message);
            setIsDisable(false);
        }
      );
    } catch(error: any) {
      console.log("Error Message (catch) ==>", error.message);
      setIsDisable(false)
    }
  }

  const dataRetriveHandler = async () => {
    try{
      const content = await window.parent.Xrm.Page.getAttribute("gyde_headertext").getValue();
      // console.log("Content ==> ", content);
      setValue(content);
      // console.log("Value when The data is set",value)
      // cache.current = content;
      // console.log("Cache ==>", cache.current);
    } catch(error: any) {
      console.log("Loading Error", error);
    }
  }

  const handleChange = async (html: any) => {
    // console.log("html===================", html);
    setValue(html);
    // console.log("Html value of ===>",value)
    const xrmReq = await  window.parent.Xrm.Page.getAttribute("gyde_headertext").setValue(html);
    // console.log("XRM", xrmReq);
  }

  useEffect(() => {
    retrieveTemplateHandler();
  },[]);

  useEffect(() => {
    // console.log('======ww=====> ', value);
    if ((!value || (value == '') || !cache.current || cache.current == "") ) {
      // console.log("Hajskaj")
      dataRetriveHandler();
    }
  }, []);

  useEffect(() => {
    editor.setEditable(!disabled);
  }, [editor, disabled]);

  useEffect(() => {
    if (value === undefined || value === cache.current) {
      return;
    }

    // if (!isInitial) {
    //   cache.current = value;
    //   editor.dispatchCommand(SET_HTML_COMMAND, value);
    // }
    // setIsInitial(false);
    // console.log("The value in the useEffect", value);
    
    cache.current = value;

    editor.dispatchCommand(SET_HTML_COMMAND, value);
  }, [editor, value, cache]);

  // console.log('swsw ===>', cache.current);
  

  return (
    <>
      <SetHtmlPlugin />
      <ListPlugin />
      <HistoryPlugin />
      <LexicalImagesPlugin />
      <DragDropPaste />
      <Flex vertical gap="middle" className="editor-container">
        <div style={{ position: "relative" }} >
          <RichTextPlugin
            
            contentEditable={
              <ContentEditable
                onBlur={() => {
                  // console.log('wwwwwwww');
                  editor.getEditorState().read(() => {
                    const htmlString = $generateHtmlFromNodes(editor);
                    // console.log('swrwswew==> ', htmlString);
                    

                    cache.current = htmlString;
                    handleChange(htmlString);
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
                className={`${DISPLAY_STYLES} ${disabled ? "" : EDITOR_STYLES}`}
                style={{ minHeight, maxHeight, overflowY: "scroll", padding: 2, textAlign: "left", color: "black" }}
                // onChange={ handleChange }
              />
            }
            placeholder={
              <div style={{ position: "absolute", top: 2, left: 4, pointerEvents: "none", opacity: 0.5 }}>
                {placeholder}
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
        </div>
        <Flex wrap="wrap" align="center" gap="small" className="toolbar">
          <TypeFormatDropdown disabled={disabled} />
          <div className="vr"></div>
          <Flex gap={2}>
            <FormatButton format="bold" disabled={disabled} >
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
          <div className="vr"></div>
          <Flex gap={2}>
            <TypeFormatButton format={TypeFormat.Quote} disabled={disabled}>
              <SIcon>blockquote-left</SIcon>
              <MenuUnfoldOutlined rev={undefined}/>
            </TypeFormatButton>
            <TypeFormatButton format={TypeFormat.UnorderedList} disabled={disabled}>
              <UnorderedListOutlined rev={undefined} />
            </TypeFormatButton>
            <TypeFormatButton format={TypeFormat.OrderedList} disabled={disabled}>
              <OrderedListOutlined rev={undefined} />
            </TypeFormatButton>
          </Flex>
          <div className="vr"></div>
          <Flex gap={2}>
            <AlignmentButton format="left" disabled={disabled} />
            <AlignmentButton format="center" disabled={disabled} />
            <AlignmentButton format="right" disabled={disabled} />
          </Flex>
          {/* <WhenInRole SuperAdmin>
            <div className="vr"></div>
            <Flex gap={2}>
              <ImageButton disabled={disabled} />
            </Flex>
          </WhenInRole> */}
        </Flex>
      </Flex>
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
