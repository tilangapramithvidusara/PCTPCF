import { DisabledContext } from "../contexts/DisabledContext";
import { useContext } from "react";

export default function useIsDisabled(){
    return useContext(DisabledContext);
}